import Icon from './Icon'

function ScoreRing({ score }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const tone = score >= 90 ? 'good' : score >= 60 ? 'warn' : 'bad'
  return (
    <div className={`score-ring score-ring--${tone}`}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" opacity="0.15" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span className="score-ring__value">{score}</span>
    </div>
  )
}

function CriterionRow({ c }) {
  const icon = c.pass === null ? 'warn' : c.pass ? 'check' : 'cross'
  const tone = c.pass === null ? 'warn' : c.pass ? 'good' : 'bad'
  return (
    <li className={`criterion criterion--${tone}`}>
      <span className="criterion__icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="criterion__text">
        <strong>{c.label}.</strong> {c.detail}
      </span>
    </li>
  )
}

export default function PhotoResultCard({ item, onFix, onRemove, onReanalyzeFixed }) {
  const { status, analysis, evaluation, error, fixing, fixed } = item

  return (
    <article className="result-card">
      <div className="result-card__thumb">
        {analysis?.previewUrl && <img src={analysis.previewUrl} alt={item.file.name} />}
        {status === 'analyzing' && (
          <div className="result-card__overlay">
            <span className="spinner" />
            <p>Analizando con IA…</p>
          </div>
        )}
      </div>

      <div className="result-card__body">
        <div className="result-card__head">
          <div>
            <h4>{item.file.name}</h4>
            {evaluation && (
              <p className="result-card__summary">
                {evaluation.passCount}/{evaluation.totalCount} criterios aprobados
              </p>
            )}
          </div>
          <div className="result-card__head-right">
            {evaluation && <ScoreRing score={evaluation.score} />}
            <button className="icon-btn" onClick={() => onRemove(item.id)} aria-label="Quitar">
              <Icon name="cross" size={16} />
            </button>
          </div>
        </div>

        {status === 'error' && <p className="result-card__error">{error}</p>}

        {evaluation && (
          <ul className="criterion-list">
            {evaluation.criteria.map((c) => (
              <CriterionRow key={c.key} c={c} />
            ))}
          </ul>
        )}

        {evaluation && !evaluation.overallPass && (
          <div className="result-card__actions">
            <button className="btn btn--accent" onClick={() => onFix(item.id)} disabled={fixing}>
              <Icon name="wand" size={16} />
              {fixing ? 'Corrigiendo…' : 'Corregir automáticamente'}
            </button>
          </div>
        )}

        {fixed && (
          <div className="fixed-panel">
            <img src={fixed.url} alt="Corregida" className="fixed-panel__preview" />
            <div className="fixed-panel__info">
              <p>
                <strong>Lista:</strong> {fixed.width}×{fixed.height}px · {Math.round(fixed.sizeKB)}KB
              </p>
              {fixed.warning && (
                <p className="fixed-panel__warning">
                  <Icon name="warn" size={14} />
                  {fixed.warning}
                </p>
              )}
              <div className="fixed-panel__actions">
                <a className="btn btn--dark" href={fixed.url} download={`corregida-${item.file.name.replace(/\.[^.]+$/, '')}.jpg`}>
                  <Icon name="download" size={16} />
                  Descargar
                </a>
                <button className="btn btn--ghost" onClick={() => onReanalyzeFixed(item.id)}>
                  <Icon name="refresh" size={16} />
                  Volver a analizar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
