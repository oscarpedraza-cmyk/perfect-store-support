import { useRef, useState } from 'react'
import { analyzeMenuFile, ACCEPTED_FORMATS } from '../lib/menuAnalysis'
import { evaluateMenuFile } from '../lib/evaluateMenu'
import { trackEvent } from '../lib/track'
import Icon from './Icon'

const STATIC_CHECKLIST = [
  'Es el menú completo de tu restaurante, no un link ni una captura de una página web.',
  'No hay 2 menús iguales dentro del mismo archivo.',
  'No subiste varias fotos sueltas de la misma tienda — combínalas en un solo PDF.',
  'Evitaste menús armados en la estructura de WhatsApp o de la competencia.',
  'Es legible y contiene el detalle completo de los productos.',
]

function ScoreBadge({ score }) {
  const tone = score >= 90 ? 'good' : score >= 60 ? 'warn' : 'bad'
  return <span className={`desc-score desc-score--${tone}`}>{score}</span>
}

export default function MenuChecker() {
  const [status, setStatus] = useState('idle') // idle | analyzing | ready | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setStatus('analyzing')
    setError(null)
    try {
      const analysis = await analyzeMenuFile(file)
      const evaluation = evaluateMenuFile(analysis)
      setResult({ analysis, evaluation })
      setStatus('ready')
      trackEvent('menu_analyzed')
      if (evaluation.overallPass) trackEvent('menu_approved')
    } catch (e) {
      setError(e?.message || 'No se pudo analizar el archivo.')
      setStatus('error')
    }
  }

  return (
    <section id="missing-products" className="menu-checker">
      <div className="section-head">
        <span className="eyebrow">Missing Products</span>
        <h2>¿Tu menú en PDF está listo para subir?</h2>
        <p className="section-lead">
          Esta herramienta no puede calcular tu % real de productos faltantes — eso depende del catálogo interno de Rappi. Lo
          que sí valida es que tu archivo de menú esté en el formato correcto, sea legible, y no esté vacío o dañado, antes de
          subirlo.
        </p>
      </div>

      <div
        className="dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFile(e.dataTransfer.files?.[0])
        }}
        role="button"
        tabIndex={0}
      >
        <Icon name="upload" size={32} />
        <p>
          <strong>Arrastra tu menú aquí</strong> o haz clic para elegir un archivo
        </p>
        <span className="dropzone__hint">{ACCEPTED_FORMATS.map((f) => f.toUpperCase()).join(' / ')}</span>
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          hidden
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      {status === 'analyzing' && <p className="menu-checker__status">Analizando archivo…</p>}
      {status === 'error' && <p className="result-card__error">{error}</p>}

      {result && (
        <div className="menu-result">
          <div className="menu-result__preview">
            {result.analysis.previewUrl ? (
              <img src={result.analysis.previewUrl} alt={result.analysis.fileName} />
            ) : (
              <div className="menu-result__preview-placeholder">
                <Icon name="image" size={28} />
                {result.analysis.kind === 'pdf' && <span>{result.analysis.pageCount} pág.</span>}
              </div>
            )}
          </div>
          <div className="menu-result__body">
            <div className="description-card__head">
              <h4>{result.analysis.fileName}</h4>
              <ScoreBadge score={result.evaluation.score} />
            </div>
            <ul className="criterion-list">
              {result.evaluation.criteria.map((c) => (
                <li key={c.key} className={`criterion criterion--${c.pass === null ? 'warn' : c.pass ? 'good' : 'bad'}`}>
                  <span className="criterion__icon">
                    <Icon name={c.pass === null ? 'warn' : c.pass ? 'check' : 'cross'} size={16} />
                  </span>
                  <span className="criterion__text">
                    <strong>{c.label}.</strong> {c.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="checklist-card">
        <h3>Checklist de contenido (revísalo tú mismo)</h3>
        <ul>
          {STATIC_CHECKLIST.map((item) => (
            <li key={item}>
              <Icon name="check" size={16} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="upload-steps">
        <h3>Cómo subirlo</h3>
        <ol>
          <li>Si tienes fotos sueltas del menú, conviértelas a un solo PDF (herramientas como LovePDF funcionan bien y son gratuitas).</li>
          <li>Entra al Portal Manager o Portal Partners de Rappi con tu usuario de aliado.</li>
          <li>Busca la sección de carga de menú/catálogo y sube el PDF validado arriba.</li>
          <li>Confirma el envío y espera la confirmación del equipo de Missing Products.</li>
        </ol>
      </div>
    </section>
  )
}
