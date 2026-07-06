import { useCallback, useState } from 'react'
import { evaluateDescription } from '../lib/evaluateDescription'
import { trackEvent } from '../lib/track'
import Icon from './Icon'
import PersonalizationChecklist from './PersonalizationChecklist'

function splitLine(line) {
  const idx = line.indexOf(':')
  if (idx > 0 && idx < 60) {
    return { name: line.slice(0, idx).trim(), text: line.slice(idx + 1).trim() }
  }
  return { name: null, text: line.trim() }
}

function ScoreBadge({ score }) {
  const tone = score >= 90 ? 'good' : score >= 60 ? 'warn' : 'bad'
  return <span className={`desc-score desc-score--${tone}`}>{score}</span>
}

export default function DescriptionChecker() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])

  const handleAnalyze = useCallback(() => {
    const lines = input
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return

    const analyzed = lines.map((line, i) => {
      const { name, text } = splitLine(line)
      return { id: i, name: name || `Producto ${i + 1}`, text, evaluation: evaluateDescription(text) }
    })
    setResults(analyzed)

    analyzed.forEach(() => trackEvent('description_analyzed'))
    if (analyzed.some((r) => r.evaluation.overallPass)) trackEvent('description_approved')
  }, [input])

  return (
    <section id="descripciones" className="description-checker">
      <div className="section-head">
        <span className="eyebrow">Descripciones y personalización</span>
        <h2>¿Tu descripción suena a menú o a publicidad?</h2>
        <p className="section-lead">
          Pega una o varias descripciones (una por línea, opcionalmente como "Nombre: descripción") y revisa si cumplen el
          estándar de Purchasing Experience: cortas, sin adjetivos de sabor, con los ingredientes y en tono neutro.
        </p>
      </div>

      <textarea
        className="description-input"
        placeholder={
          'Ej: Hamburguesa clásica: Pan brioche, carne de res 150g, queso cheddar, lechuga, tomate y salsa especial.\nOtra línea = otro producto...'
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
      />
      <button className="btn btn--accent" onClick={handleAnalyze}>
        <Icon name="check" size={16} />
        Analizar descripciones
      </button>

      {results.length > 0 && (
        <div className="description-results">
          {results.map((r) => (
            <div key={r.id} className="description-card">
              <div className="description-card__head">
                <h4>{r.name}</h4>
                <ScoreBadge score={r.evaluation.score} />
              </div>
              <p className="description-card__text">"{r.text}"</p>
              <ul className="criterion-list">
                {r.evaluation.criteria.map((c) => (
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
          ))}
        </div>
      )}

      <PersonalizationChecklist />
    </section>
  )
}
