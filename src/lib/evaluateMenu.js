function round(n, d = 2) {
  const f = 10 ** d
  return Math.round(n * f) / f
}

function criterion(key, label, pass, detail) {
  return { key, label, pass, detail }
}

const MENU_SHARPNESS_MIN = 40
const MENU_BRIGHTNESS_MIN = 0.15
// Fotos de menú nunca deberían pesar casi nada, pero un PDF de puro texto sí
// puede ser legítimamente liviano (unos pocos KB) — usamos un piso mucho más
// bajo para PDF que para imagen, para no marcar como "sospechoso" un PDF real.
const MIN_SIZE_KB_IMAGE = 8
const MIN_SIZE_KB_PDF = 1

export function evaluateMenuFile(analysis) {
  const criteria = []

  criteria.push(
    criterion(
      'format',
      'Formato de archivo',
      analysis.formatOk,
      analysis.formatOk
        ? `.${analysis.ext.toUpperCase()} es un formato aceptado.`
        : `.${analysis.ext.toUpperCase() || '?'} no se acepta${analysis.rejectedLabel ? ` (${analysis.rejectedLabel})` : ''}. Usa PNG, JPG, JPEG o PDF.`,
    ),
  )

  if (!analysis.formatOk) {
    return finalize(criteria)
  }

  if (analysis.kind === 'error') {
    criteria.push(criterion('read', 'Lectura del archivo', false, analysis.error))
    return finalize(criteria)
  }

  const minSizeKB = analysis.kind === 'pdf' ? MIN_SIZE_KB_PDF : MIN_SIZE_KB_IMAGE
  const sizeOk = analysis.fileSizeKB >= minSizeKB
  criteria.push(
    criterion(
      'size',
      'Peso del archivo',
      sizeOk,
      sizeOk
        ? `${round(analysis.fileSizeKB, 0)}KB.`
        : `${round(analysis.fileSizeKB, 1)}KB es sospechosamente pequeño — revisa que el archivo no esté vacío o corrupto.`,
    ),
  )

  if (analysis.kind === 'image') {
    const brightOk = analysis.brightness >= MENU_BRIGHTNESS_MIN
    criteria.push(
      criterion(
        'brightness',
        'Iluminación',
        brightOk,
        brightOk ? 'Suficiente luz para leerse bien.' : 'La foto está muy oscura — vuelve a tomarla con mejor luz.',
      ),
    )
    const sharpOk = analysis.sharpness >= MENU_SHARPNESS_MIN
    criteria.push(
      criterion(
        'sharpness',
        'Nitidez (estimada)',
        sharpOk,
        sharpOk ? 'Texto e imágenes se ven enfocados.' : 'Se ve borrosa — probablemente el equipo no podrá leer los productos.',
      ),
    )
  }

  if (analysis.kind === 'pdf') {
    criteria.push(criterion('pages', 'Páginas', true, `El PDF tiene ${analysis.pageCount} página${analysis.pageCount > 1 ? 's' : ''}.`))
  }

  return finalize(criteria)
}

function finalize(criteria) {
  const evaluable = criteria.filter((c) => c.pass !== null)
  const passCount = evaluable.filter((c) => c.pass).length
  const score = evaluable.length > 0 ? Math.round((passCount / evaluable.length) * 100) : 0
  const overallPass = evaluable.length > 0 && evaluable.every((c) => c.pass)
  return { criteria, score, overallPass, passCount, totalCount: evaluable.length }
}
