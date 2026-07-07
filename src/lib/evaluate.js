import { QUALITY_RANGES } from './photoSpecs'
import { predictFixedSize } from './cropMath'

function round(n, d = 2) {
  const f = 10 ** d
  return Math.round(n * f) / f
}

function criterion(key, label, pass, detail) {
  return { key, label, pass, detail }
}

// Clases de COCO-SSD que SÍ son el producto (no se marcan como "extra").
const FOOD_CLASSES = new Set(['banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake'])
// Elementos normales de cualquier foto de plato (vajilla/mesa) — tampoco se marcan.
const NEUTRAL_CLASSES = new Set(['bowl', 'dining table'])

const CLASS_LABELS_ES = {
  person: 'una mano/persona',
  bottle: 'una botella',
  cup: 'un vaso',
  'wine glass': 'una copa',
  fork: 'un tenedor',
  knife: 'un cuchillo',
  spoon: 'una cuchara',
  'cell phone': 'un celular',
  remote: 'un control remoto',
  book: 'un libro',
  clock: 'un reloj',
  vase: 'un florero',
  scissors: 'unas tijeras',
  chair: 'una silla',
  couch: 'un sofá',
  'potted plant': 'una planta',
  tv: 'una pantalla/TV',
  laptop: 'una laptop',
  keyboard: 'un teclado',
  mouse: 'un mouse',
  backpack: 'una mochila',
  umbrella: 'un paraguas',
  handbag: 'un bolso',
  tie: 'una corbata',
  suitcase: 'una maleta',
  refrigerator: 'un refrigerador',
  oven: 'un horno',
  toaster: 'una tostadora',
  sink: 'un lavaplatos',
}

function translateClass(cls) {
  return CLASS_LABELS_ES[cls] || cls
}

// Combina el resultado de analyzeImage() con el spec de photoSpecs.js
// y devuelve una lista de criterios pass/fail listos para pintar en la UI.
export function evaluatePhoto(analysis, spec) {
  const criteria = []
  const { fileType, fileSizeKB, naturalWidth, naturalHeight, saturation, brightness, sharpness, segmentation, objects } = analysis

  // Formato
  const ext = (fileType || '').split('/')[1]?.toLowerCase().replace('jpeg', 'jpg')
  const formatOk = spec.formats.includes(ext === 'jpg' ? 'jpg' : ext)
  criteria.push(
    criterion(
      'format',
      'Formato de archivo',
      formatOk,
      formatOk
        ? `${ext?.toUpperCase()} es válido para ${spec.label}.`
        : `Debe ser ${spec.formats.map((f) => f.toUpperCase()).join(' o ')}, subiste ${ext?.toUpperCase() || 'un formato desconocido'}.`,
    ),
  )

  // Peso (KB)
  const sizeIssues = []
  if (spec.maxKB && fileSizeKB > spec.maxKB) sizeIssues.push(`supera el máximo de ${spec.maxKB}KB`)
  if (fileSizeKB < QUALITY_RANGES.minKB) sizeIssues.push(`por debajo del mínimo de ${QUALITY_RANGES.minKB}KB (posible baja resolución)`)
  criteria.push(
    criterion(
      'size',
      'Peso del archivo',
      sizeIssues.length === 0,
      sizeIssues.length === 0
        ? `${round(fileSizeKB, 0)}KB, dentro del rango permitido.`
        : `${round(fileSizeKB, 0)}KB: ${sizeIssues.join(' y ')}.`,
    ),
  )

  // Dimensiones mínimas
  if (spec.minDims) {
    const dimsOk = naturalWidth >= spec.minDims.width && naturalHeight >= spec.minDims.height
    criteria.push(
      criterion(
        'dims',
        'Dimensiones mínimas',
        dimsOk,
        dimsOk
          ? `${naturalWidth}×${naturalHeight}px cumple el mínimo (${spec.minDims.width}×${spec.minDims.height}px). Ideal: ${spec.idealDims?.width}×${spec.idealDims?.height}px.`
          : `${naturalWidth}×${naturalHeight}px es menor al mínimo requerido (${spec.minDims.width}×${spec.minDims.height}px).`,
      ),
    )
  } else {
    const target = spec.dims
    const tolerance = 0.08
    const dimsOk =
      Math.abs(naturalWidth - target.width) / target.width <= tolerance &&
      Math.abs(naturalHeight - target.height) / target.height <= tolerance
    criteria.push(
      criterion(
        'dims',
        'Dimensiones',
        dimsOk,
        dimsOk
          ? `${naturalWidth}×${naturalHeight}px, coincide con ${target.width}×${target.height}px.`
          : `${naturalWidth}×${naturalHeight}px no coincide con el estándar ${target.width}×${target.height}px.`,
      ),
    )
  }

  // Proporción
  const ratio = naturalWidth / naturalHeight
  if (spec.ratioMode === 'range') {
    const ratioOk = ratio >= QUALITY_RANGES.ratioMin && ratio <= QUALITY_RANGES.ratioMax
    criteria.push(
      criterion(
        'ratio',
        'Proporción',
        ratioOk,
        ratioOk
          ? `Proporción ${round(ratio)} dentro de ${QUALITY_RANGES.ratioMin}-${QUALITY_RANGES.ratioMax}.`
          : `Proporción ${round(ratio)} fuera de rango (${QUALITY_RANGES.ratioMin}-${QUALITY_RANGES.ratioMax}): la foto es demasiado rectangular.`,
      ),
    )
  } else {
    const targetRatio = spec.dims.width / spec.dims.height
    const ratioOk = Math.abs(ratio - targetRatio) / targetRatio <= 0.08
    criteria.push(
      criterion(
        'ratio',
        'Proporción',
        ratioOk,
        ratioOk
          ? `Proporción ${round(ratio)} coincide con el estándar (${round(targetRatio)}).`
          : `Proporción ${round(ratio)} no coincide con el estándar (${round(targetRatio)}).`,
      ),
    )
  }

  // Calidad de foto (brillo / saturación / nitidez)
  if (spec.checkPhotoQuality) {
    const brightOk = brightness >= QUALITY_RANGES.brightnessMin && brightness <= QUALITY_RANGES.brightnessMax
    criteria.push(
      criterion(
        'brightness',
        'Brillo',
        brightOk,
        brightOk
          ? `Brillo ${round(brightness)} dentro de rango.`
          : brightness < QUALITY_RANGES.brightnessMin
            ? `Brillo ${round(brightness)} muy bajo (mín ${QUALITY_RANGES.brightnessMin}): la foto se ve oscura.`
            : `Brillo ${round(brightness)} muy alto (máx ${QUALITY_RANGES.brightnessMax}): la foto está sobreexpuesta.`,
      ),
    )

    const satOk = saturation >= QUALITY_RANGES.saturationMin && saturation <= QUALITY_RANGES.saturationMax
    criteria.push(
      criterion(
        'saturation',
        'Saturación',
        satOk,
        satOk
          ? `Saturación ${round(saturation)} dentro de rango.`
          : saturation < QUALITY_RANGES.saturationMin
            ? `Saturación ${round(saturation)} muy baja: colores lavados/apagados.`
            : `Saturación ${round(saturation)} muy alta: colores poco naturales.`,
      ),
    )

    const sharpOk = sharpness >= QUALITY_RANGES.sharpnessMin && sharpness <= QUALITY_RANGES.sharpnessMax
    criteria.push(
      criterion(
        'sharpness',
        'Nitidez (estimada)',
        sharpOk,
        sharpOk
          ? `Nitidez ${round(sharpness, 0)} dentro de rango.`
          : sharpness < QUALITY_RANGES.sharpnessMin
            ? `Nitidez ${round(sharpness, 0)} muy baja: la foto se ve borrosa.`
            : `Nitidez ${round(sharpness, 0)} inusualmente alta: revisa ruido/artefactos.`,
      ),
    )
  }

  // Encuadre / fondo (requiere segmentación con IA)
  if (spec.checkPadding || spec.checkBackground) {
    if (!segmentation || segmentation.error) {
      criteria.push(
        criterion('framing', 'Encuadre y fondo', null, segmentation?.error || 'No se pudo analizar el encuadre con IA.'),
      )
    } else {
      if (spec.checkPadding) {
        const paddingOk = segmentation.paddingPct <= QUALITY_RANGES.paddingMaxPct
        criteria.push(
          criterion(
            'padding',
            'Encuadre (producto visible)',
            paddingOk,
            paddingOk
              ? `El producto ocupa ${round(100 - segmentation.paddingPct, 0)}% del encuadre.`
              : `El producto solo ocupa ${round(100 - segmentation.paddingPct, 0)}% del encuadre (debe ser ≥${100 - QUALITY_RANGES.paddingMaxPct}%). Acércate más o recorta.`,
          ),
        )
      }
      if (spec.requireWhiteBackground) {
        criteria.push(
          criterion(
            'background',
            'Fondo blanco',
            segmentation.isWhiteBg,
            segmentation.isWhiteBg
              ? 'El fondo es blanco, correcto para toppings.'
              : 'El fondo no es blanco puro. Los toppings requieren fondo blanco.',
          ),
        )
      } else if (spec.checkBackground) {
        criteria.push(
          criterion('background', 'Fondo neutro', true, 'Fondo detectado, sin reglas de color estrictas para este tipo de foto.'),
        )
      }
    }
  }

  // Objetos ajenos al plato en el encuadre (manos, botellas, celulares, etc.)
  if (spec.checkExtraObjects) {
    if (!objects) {
      criteria.push(criterion('objects', 'Elementos en el encuadre', null, 'No se pudo analizar los objetos del encuadre.'))
    } else {
      const extras = objects.filter((o) => !FOOD_CLASSES.has(o.class) && !NEUTRAL_CLASSES.has(o.class))
      const noExtras = extras.length === 0
      criteria.push(
        criterion(
          'objects',
          'Elementos en el encuadre',
          noExtras,
          noExtras
            ? 'Solo se detecta el producto, sin objetos ajenos.'
            : `Se detectó ${extras.map((o) => `${translateClass(o.class)} (${round(o.score * 100, 0)}%)`).join(', ')}. La foto debe mostrar solo el plato, sin manos ni otros objetos.`,
        ),
      )
    }
  }

  const evaluable = criteria.filter((c) => c.pass !== null)
  const passCount = evaluable.filter((c) => c.pass).length
  const score = evaluable.length > 0 ? Math.round((passCount / evaluable.length) * 100) : 0
  const overallPass = evaluable.every((c) => c.pass)

  // Razones por las que "Corregir automáticamente" NO va a arreglar la foto de verdad —
  // recorte/brillo/compresión no pueden borrar objetos ni inventar resolución que no existe.
  const unfixableReasons = []
  const objectsCriterion = criteria.find((c) => c.key === 'objects')
  if (objectsCriterion?.pass === false) {
    unfixableReasons.push('hay objetos ajenos al plato en el encuadre — el corrector no puede borrarlos de la foto')
  }
  if (spec.minDims) {
    const minDims = spec.minDims
    const predicted = predictFixedSize(naturalWidth, naturalHeight, spec)
    if (predicted.width < minDims.width || predicted.height < minDims.height) {
      unfixableReasons.push(
        `la resolución de origen es muy baja — aun corrigiendo quedaría en ${predicted.width}×${predicted.height}px, por debajo del mínimo ${minDims.width}×${minDims.height}px`,
      )
    }
  }

  return { criteria, score, overallPass, passCount, totalCount: evaluable.length, unfixableReasons }
}
