// Conteo de uso anónimo: solo suma +1 a un contador público, nunca envía datos de la foto,
// nombre del aliado ni nada identificable. Si el servicio de conteo falla, se ignora en silencio
// — nunca debe romper el análisis ni la corrección de fotos.

const NAMESPACE = 'pss-oscarpedraza-cmyk'
const BASE = 'https://abacus.jasoncameron.dev'

export function trackEvent(key) {
  try {
    fetch(`${BASE}/hit/${NAMESPACE}/${key}`, { mode: 'cors', keepalive: true }).catch(() => {})
  } catch {
    // el conteo nunca debe interrumpir la herramienta
  }
}

export async function getStats(keys) {
  try {
    const entries = await Promise.all(
      keys.map(async (key) => {
        try {
          const res = await fetch(`${BASE}/get/${NAMESPACE}/${key}`)
          if (!res.ok) return [key, 0]
          const data = await res.json()
          return [key, data.value ?? 0]
        } catch {
          return [key, 0]
        }
      }),
    )
    return Object.fromEntries(entries)
  } catch {
    return {}
  }
}
