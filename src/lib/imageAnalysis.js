// Motor de análisis de imágenes. Todo corre en el navegador — ninguna foto sale del equipo del usuario.

const ANALYSIS_MAX_DIM = 640

export function loadImage(fileOrBlob) {
  const url = URL.createObjectURL(fileOrBlob)
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve({ img: el, url })
    el.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen. ¿El archivo está dañado?'))
    }
    el.src = url
  })
}

export function drawToCanvas(img, maxDim = ANALYSIS_MAX_DIM) {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  return { canvas, ctx, w, h }
}

function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max
  return { s, v }
}

export function computeBrightnessSaturation(ctx, w, h) {
  const { data } = ctx.getImageData(0, 0, w, h)
  let sSum = 0
  let vSum = 0
  const n = w * h
  for (let i = 0; i < data.length; i += 4) {
    const { s, v } = rgbToHsv(data[i], data[i + 1], data[i + 2])
    sSum += s
    vSum += v
  }
  return { saturation: sSum / n, brightness: vSum / n }
}

export function computeSharpness(ctx, w, h) {
  const { data } = ctx.getImageData(0, 0, w, h)
  const gray = new Float32Array(w * h)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  let sum = 0
  let sumSq = 0
  let count = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x
      const lap = gray[idx - 1] + gray[idx + 1] + gray[idx - w] + gray[idx + w] - 4 * gray[idx]
      sum += lap
      sumSq += lap * lap
      count++
    }
  }
  const mean = sum / count
  return sumSq / count - mean * mean
}

async function computeSegmentation(file, origCtx, w, h) {
  const { removeBackground } = await import('@imgly/background-removal')
  // isnet_quint8 (~40MB) en vez del default isnet_fp16 (~80MB): la mitad de datos
  // para el aliado. Solo necesitamos % de encuadre y color de fondo, no un recorte
  // fotográfico perfecto — la pérdida de precisión del modelo cuantizado no importa aquí.
  const cutoutBlob = await removeBackground(file, { model: 'isnet_quint8' })
  const cutoutUrl = URL.createObjectURL(cutoutBlob)
  const cutoutImg = await new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('No se pudo procesar el recorte de fondo'))
    el.src = cutoutUrl
  })

  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = w
  maskCanvas.height = h
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })
  maskCtx.drawImage(cutoutImg, 0, 0, w, h)
  const maskData = maskCtx.getImageData(0, 0, w, h).data
  const origData = origCtx.getImageData(0, 0, w, h).data

  let subjectPixels = 0
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  let bgR = 0
  let bgG = 0
  let bgB = 0
  let bgCount = 0

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const alpha = maskData[idx + 3]
      if (alpha > 128) {
        subjectPixels++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      } else {
        bgR += origData[idx]
        bgG += origData[idx + 1]
        bgB += origData[idx + 2]
        bgCount++
      }
    }
  }

  const occupancyPct = (subjectPixels / (w * h)) * 100
  const paddingPct = Math.max(0, 100 - occupancyPct)
  const avgBg = bgCount > 0 ? { r: bgR / bgCount, g: bgG / bgCount, b: bgB / bgCount } : null
  const isWhiteBg = avgBg ? avgBg.r > 235 && avgBg.g > 235 && avgBg.b > 235 : false
  const bbox = subjectPixels > 0 ? { minX, minY, maxX, maxY, w, h } : null

  return { occupancyPct, paddingPct, avgBg, isWhiteBg, cutoutUrl, bbox, maskCanvas }
}

let cocoModelPromise = null
function getCocoModel() {
  if (!cocoModelPromise) {
    cocoModelPromise = Promise.all([import('@tensorflow/tfjs'), import('@tensorflow-models/coco-ssd')]).then(([, cocoSsd]) =>
      cocoSsd.load({ base: 'lite_mobilenet_v2' }),
    )
  }
  return cocoModelPromise
}

// Detecta objetos generales en la foto (manos/personas, botellas, vasos, celulares, etc.)
// usando COCO-SSD. Sirve para avisar cuando hay elementos ajenos al plato en el encuadre.
async function detectObjects(img) {
  const model = await getCocoModel()
  // Umbral bajo a propósito: preferimos que se detecte de más (mostramos el % de
  // confianza para que el usuario juzgue) a que se pase por alto una mano o una
  // botella real en la foto, como pasó con 0.55 en una foto real de prueba.
  const predictions = await model.detect(img, 10, 0.3)
  return predictions.map((p) => ({ class: p.class, score: p.score }))
}

// Analiza un archivo de imagen y devuelve todas las métricas medibles.
// `withSegmentation` corre el modelo de IA de recorte de fondo (más lento, ~1-3s).
// `withObjectDetection` corre COCO-SSD para detectar objetos ajenos al plato en el encuadre.
export async function analyzeImage(file, { withSegmentation = true, withObjectDetection = true } = {}) {
  const { img, url } = await loadImage(file)
  try {
    const { canvas, ctx, w, h } = drawToCanvas(img)
    const { saturation, brightness } = computeBrightnessSaturation(ctx, w, h)
    const sharpness = computeSharpness(ctx, w, h)

    const [segmentation, objects] = await Promise.all([
      withSegmentation
        ? computeSegmentation(file, ctx, w, h).catch((e) => ({ error: e?.message || 'No se pudo analizar el fondo/encuadre' }))
        : Promise.resolve(null),
      withObjectDetection ? detectObjects(img).catch(() => null) : Promise.resolve(null),
    ])

    return {
      fileName: file.name,
      fileType: file.type,
      fileSizeKB: file.size / 1024,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      saturation,
      brightness,
      sharpness,
      segmentation,
      objects,
      previewUrl: url,
      analysisCanvas: canvas,
    }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}
