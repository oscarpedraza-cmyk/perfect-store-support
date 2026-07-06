import { QUALITY_RANGES } from './photoSpecs'

function loadImg(url) {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('No se pudo cargar la imagen para corregir'))
    el.src = url
  })
}

function centerCropRect(sw, sh, targetRatio) {
  if (sw / sh > targetRatio) {
    const cropW = sh * targetRatio
    return { sx: (sw - cropW) / 2, sy: 0, sw: cropW, sh }
  }
  const cropH = sw / targetRatio
  return { sx: 0, sy: (sh - cropH) / 2, sw, sh: cropH }
}

function blobFromCanvas(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function compressToTarget(canvas, maxKB) {
  if (!maxKB) return blobFromCanvas(canvas, 'image/jpeg', 0.92)
  let quality = 0.92
  let blob = await blobFromCanvas(canvas, 'image/jpeg', quality)
  while (blob && blob.size / 1024 > maxKB && quality > 0.35) {
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

  const canvas = document.createElement('canvas')
  canvas.width = outputDims.width
  canvas.height = outputDims.height
  const ctx = canvas.getContext('2d')

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

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    sizeKB: blob.size / 1024,
  }
}

function clampFactor(f) {
  return Math.min(1.8, Math.max(0.55, f))
}
