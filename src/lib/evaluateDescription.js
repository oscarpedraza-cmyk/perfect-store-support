// Analiza la calidad de una descripción de producto según el playbook Perfect Store
// (Purchasing Experience, slides 24-25): descripciones cortas, sin juicios de valor,
// que mencionen ingredientes, con lenguaje profesional y neutro.

// Palabras de "juicio de sabor" que el playbook pide evitar (son valoraciones, no descripciones).
const JUDGMENT_WORDS = [
  'delicioso', 'deliciosa', 'deliciosos', 'deliciosas',
  'rico', 'rica', 'ricos', 'ricas',
  'riquísimo', 'riquísima', 'riquisimo', 'riquisima',
  'exquisito', 'exquisita',
  'jugoso', 'jugosa', 'jugosos', 'jugosas',
  'sabroso', 'sabrosa', 'sabrosos', 'sabrosas',
  'increíble', 'increible',
  'espectacular',
  'buenísimo', 'buenisimo', 'buenísima', 'buenisima',
  'apetitoso', 'apetitosa',
  'delicia', 'delicias',
  'irresistible',
  'exquisitez',
  'perfecto', 'perfecta',
  'ideal',
  'genial',
]

const DETAIL_PATTERNS = [
  /\b\d+\s?(g|gr|grs|gramos|kg|ml|cc|oz|cm)\b/i,
  /\b(asado|asada|frito|frita|horneado|horneada|a la plancha|gratinado|gratinada|salteado|salteada|cocido|cocida|al vapor|a la parrilla|ahumado|ahumada)\b/i,
]

function round(n, d = 2) {
  const f = 10 ** d
  return Math.round(n * f) / f
}

function criterion(key, label, pass, detail) {
  return { key, label, pass, detail }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function evaluateDescription(text) {
  const criteria = []
  const raw = (text || '').trim()
  const wordCount = countWords(raw)
  const lower = raw.toLowerCase()

  // Longitud
  const tooShort = wordCount < 4
  const tooLong = wordCount > 45
  criteria.push(
    criterion(
      'length',
      'Longitud',
      !tooShort && !tooLong,
      tooShort
        ? `Muy corta (${wordCount} palabras): probablemente no describe bien el producto.`
        : tooLong
          ? `Muy larga (${wordCount} palabras): el playbook pide descripciones cortas y concisas.`
          : `${wordCount} palabras, longitud adecuada.`,
    ),
  )

  // Sin valoraciones de juicio
  const foundJudgment = JUDGMENT_WORDS.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))
  criteria.push(
    criterion(
      'judgment',
      'Sin valoraciones de juicio',
      foundJudgment.length === 0,
      foundJudgment.length === 0
        ? 'No usa palabras de opinión/sabor (ej. "delicioso", "riquísimo").'
        : `Usa palabras de opinión: ${foundJudgment.join(', ')}. Deben ser descriptivas, no valorativas.`,
    ),
  )

  // Menciona varios ingredientes (heurística: separadores tipo coma/"y"/"con")
  const ingredientParts = raw.split(/,|\by\b|\bcon\b|\+/i).map((p) => p.trim()).filter(Boolean)
  const looksLikeIngredientList = ingredientParts.length >= 3
  criteria.push(
    criterion(
      'ingredients',
      'Menciona ingredientes',
      looksLikeIngredientList,
      looksLikeIngredientList
        ? `Menciona ${ingredientParts.length} elementos — parece listar los ingredientes.`
        : 'Se detectan pocos ingredientes mencionados. Revisa que estén todos o casi todos los del plato.',
    ),
  )

  // Tono profesional y neutro (mayúsculas, exclamaciones, emojis)
  const shouting = /\b[A-ZÁÉÍÓÚÑ]{4,}\b/.test(raw)
  const excessiveExclaim = /!{2,}|¡.*!.*¡/.test(raw)
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(raw)
  const toneIssues = []
  if (shouting) toneIssues.push('texto en mayúsculas')
  if (excessiveExclaim) toneIssues.push('signos de exclamación excesivos')
  if (hasEmoji) toneIssues.push('emojis')
  criteria.push(
    criterion(
      'tone',
      'Lenguaje profesional y neutro',
      toneIssues.length === 0,
      toneIssues.length === 0 ? 'Tono neutro y profesional.' : `Evita: ${toneIssues.join(', ')}.`,
    ),
  )

  // Bonus informativo: detalles de gramaje/presentación/método (no es pass/fail estricto)
  const hasDetail = DETAIL_PATTERNS.some((re) => re.test(raw))
  criteria.push(
    criterion(
      'detail',
      'Detalles (gramaje/método/presentación)',
      hasDetail ? true : null,
      hasDetail
        ? 'Incluye un detalle de gramaje, presentación o método de preparación.'
        : 'No es obligatorio, pero sumar gramaje, método de preparación o presentación mejora la descripción.',
    ),
  )

  const evaluable = criteria.filter((c) => c.pass !== null)
  const passCount = evaluable.filter((c) => c.pass).length
  const score = evaluable.length > 0 ? Math.round((passCount / evaluable.length) * 100) : 0
  const overallPass = raw.length > 0 && evaluable.every((c) => c.pass)

  return { criteria, score, overallPass, passCount, totalCount: evaluable.length, isEmpty: raw.length === 0 }
}

export { round }
