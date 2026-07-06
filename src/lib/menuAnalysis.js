// Analiza el archivo de menú (PDF o imagen) que se sube para el proceso de
// Missing Products. Esta herramienta NO puede calcular el % real de productos
// faltantes (eso requiere comparar contra el catálogo interno de Rappi, al que
// no tenemos ni debemos tener acceso) — solo valida que el archivo esté listo
// para que ese proceso lo pueda leer bien.

import { drawToCanvas, loadImage, computeBrightnessSaturation, computeSharpness } from './imageAnalysis'

function withTimeout(promise, ms, message) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))])
}

export const ACCEPTED_FORMATS = ['png', 'jpg', 'jpeg', 'pdf']
const REJECTED_LABELS = {
  doc: 'Word (DOC)',
  docx: 'Word (DOCX)',
  csv: 'CSV',
  xls: 'Excel (XLS)',
  xlsx: 'Excel (XLSX)',
  exe: 'ejecutable (EXE)',
  txt: 'texto plano (TXT)',
}

function getExtension(file) {
  // Priorizamos la extensión del nombre de archivo: el MIME type no siempre
  // coincide con la extensión real (ej. "application/msword" para .doc), lo
  // que mostraba etiquetas confusas como ".MSWORD" en vez de ".DOC".
  const parts = file.name.split('.')
  if (parts.length > 1) return parts.pop().toLowerCase()
  const byType = (file.type || '').split('/')[1]?.toLowerCase()
  if (byType === 'jpeg') return 'jpg'
  return byType && byType !== 'octet-stream' ? byType : ''
}

async function analyzeImageMenu(file) {
  const { img, url } = await loadImage(file)
  const { canvas, ctx, w, h } = drawToCanvas(img)
  const { brightness } = computeBrightnessSaturation(ctx, w, h)
  const sharpness = computeSharpness(ctx, w, h)
  return {
    kind: 'image',
    previewUrl: url,
    width: img.naturalWidth,
    height: img.naturalHeight,
    brightness,
    sharpness,
    canvas,
  }
}

// Nota: deliberadamente NO renderizamos la página a un canvas para detectar
// páginas en blanco. page.render() de pdf.js puede quedarse colgado sin lanzar
// error en algunos entornos/navegadores — preferimos un chequeo menos profundo
// pero 100% confiable (conteo de páginas + peso del archivo) a uno que puede
// dejar al usuario esperando para siempre.
async function analyzePdfMenu(file) {
  const pdfjsLib = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pageCount = pdf.numPages

  return {
    kind: 'pdf',
    pageCount,
    previewUrl: null,
  }
}

export async function analyzeMenuFile(file) {
  const ext = getExtension(file)
  const formatOk = ACCEPTED_FORMATS.includes(ext)
  const base = {
    fileName: file.name,
    fileSizeKB: file.size / 1024,
    ext,
    formatOk,
    rejectedLabel: REJECTED_LABELS[ext] || null,
  }

  if (!formatOk) return { ...base, kind: 'rejected' }

  try {
    if (ext === 'pdf') {
      const pdfData = await withTimeout(
        analyzePdfMenu(file),
        15000,
        'El PDF tardó demasiado en procesarse — puede estar dañado. Intenta con otro archivo o expórtalo de nuevo.',
      )
      return { ...base, ...pdfData }
    }
    const imgData = await withTimeout(analyzeImageMenu(file), 15000, 'La imagen tardó demasiado en procesarse. Intenta con otro archivo.')
    return { ...base, ...imgData }
  } catch (e) {
    return { ...base, kind: 'error', error: e?.message || 'No se pudo leer el archivo.' }
  }
}
