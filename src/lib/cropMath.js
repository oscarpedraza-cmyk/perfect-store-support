// Matemática de recorte compartida entre autoFix.js (que sí dibuja en canvas) y
// evaluate.js (que solo necesita predecir el tamaño final para saber si vale la
// pena ofrecer "Corregir automáticamente" o si la foto definitivamente no alcanza).

// No agrandamos la foto más de un 15% sobre su resolución real: estirar más allá
// de eso produce pixelado/borrosidad visible en vez de mejorar la calidad.
export const MAX_UPSCALE = 1.15

export function centerCropRect(sw, sh, targetRatio) {
  if (sw / sh > targetRatio) {
    const cropW = sh * targetRatio
    return { sx: (sw - cropW) / 2, sy: 0, sw: cropW, sh }
  }
  const cropH = sw / targetRatio
  return { sx: 0, sy: (sh - cropH) / 2, sw, sh: cropH }
}

// Predice el tamaño final que tendría la foto después de autoFixImage, sin
// tener que cargarla ni dibujarla — solo con las dimensiones naturales.
export function predictFixedSize(naturalWidth, naturalHeight, spec) {
  const outputDims = spec.idealDims || spec.dims
  const targetRatio = outputDims.width / outputDims.height
  const crop = centerCropRect(naturalWidth, naturalHeight, targetRatio)
  const scale = Math.min(MAX_UPSCALE, outputDims.width / crop.sw)
  return {
    width: Math.max(1, Math.round(crop.sw * scale)),
    height: Math.max(1, Math.round(crop.sh * scale)),
  }
}
