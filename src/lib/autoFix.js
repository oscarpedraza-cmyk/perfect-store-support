import { QUALITY_RANGES } from './photoSpecs'
import { centerCropRect, MAX_UPSCALE } from './cropMath'

function loadImg(url) {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('No se pudo cargar la imagen para corregir'))
    el.src = url
  })
}

function blobFromCanvas(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function compressToTarget(canvas, maxKB) {
  if (!maxKB) return blobFromCanvas(canvas, 'image/jpeg', 0.92)
  let quality = 0.92
  let blob = await blobFromCanvas(canvas, 'image/jpeg', quality)
  while (blob && blob.size / 1024 > maxKB && quality > 0.55) {
    quality -= 0.08
    blob = await blobFromCanvas(canvas, 'image/jpeg', quality)
  }
  return blob
}

// Genera una versión corregida de la foto: recorta al encuadre correcto,
// ajusta brillo/saturación si están fuera de rango, y comprime al peso objetivo.
// Si el tipo requiere fondo blanco y ya corrimos el recorte de fondo por IA, lo reemplaza.
export async function autoFixImage(file, analysis, spec) {
  const outputDims = spec.idealDims || spec.dims
  const targetRatio = outputDims.width / outputDims.height

  const useWhiteBg = Boolean(spec.requireWhiteBackground && analysis.segmentation?.cutoutUrl && !analysis.segmentation.error)
  const sourceUrl = useWhiteBg ? analysis.segmentation.cutoutUrl : analysis.previewUrl
  const sourceImg = await loadImg(sourceUrl)

  const crop = centerCropRect(sourceImg.naturalWidth, sourceImg.naturalHeight, targetRatio)

  const scale = Math.min(MAX_UPSCALE, outputDims.width / crop.sw)
  const finalWidth = Math.max(1, Math.round(crop.sw * scale))
  const finalHeight = Math.max(1, Math.round(crop.sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = finalWidth
  canvas.height = finalHeight
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (useWhiteBg) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const midBrightness = (QUALITY_RANGES.brightnessMin + QUALITY_RANGES.brightnessMax) / 2
  const midSaturation = (QUALITY_RANGES.saturationMin + QUALITY_RANGES.saturationMax) / 2
  const brightnessFactor = clampFactor(midBrightness / (analysis.brightness || midBrightness))
  const saturationFactor = clampFactor(midSaturation / (analysis.saturation || midSaturation))

  const brightnessOk = analysis.brightness >= QUALITY_RANGES.brightnessMin && analysis.brightness <= QUALITY_RANGES.brightnessMax
  const saturationOk = analysis.saturation >= QUALITY_RANGES.saturationMin && analysis.saturation <= QUALITY_RANGES.saturationMax

  ctx.filter = `brightness(${brightnessOk ? 1 : brightnessFactor}) saturate(${saturationOk ? 1 : saturationFactor})`
  ctx.drawImage(sourceImg, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height)
  ctx.filter = 'none'

  const wantsPngOnly = spec.formats.length === 1 && spec.formats[0] === 'png'
  const blob = wantsPngOnly ? await blobFromCanvas(canvas, 'image/png') : await compressToTarget(canvas, spec.maxKB)

  const minDims = spec.minDims || spec.dims
  const belowMinResolution = canvas.width < minDims.width || canvas.height < minDims.height

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    sizeKB: blob.size / 1024,
    warning: belowMinResolution
      ? `Tu foto original no tiene suficiente resolución para llegar a ${minDims.width}×${minDims.height}px sin verse borrosa. Quedó en ${canvas.width}×${canvas.height}px — para mejorarla de verdad, toma una foto nueva más cerca o con mejor cámara.`
      : null,
  }
}

function clampFactor(f) {
  return Math.min(1.8, Math.max(0.55, f))
}
