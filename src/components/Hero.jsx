import Icon from './Icon'

export default function Hero() {
  const scrollToAnalyzer = () => document.getElementById('analizador')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="hero">
      <div className="hero__badge">
        <Icon name="warn" size={14} />
        Herramienta comunitaria, independiente y <strong>no oficial de Rappi</strong>
      </div>

      <h1>
        Fotos de plato que <span className="hero__highlight">pasan a la primera</span>.
      </h1>
      <p className="hero__lead">
        Sube la foto de tu producto, portada, logo o topping. Perfect Store Support la analiza al instante contra los criterios
        de calidad del Perfect Store y te dice exactamente qué ajustar — antes de que el aliado la suba y se lleve un rechazo.
      </p>

      <div className="hero__actions">
        <button className="btn btn--accent btn--lg" onClick={scrollToAnalyzer}>
          <Icon name="upload" size={18} />
          Analizar mi foto ahora
        </button>
        <span className="hero__actions-note">Gratis · sin registro · tus fotos nunca salen del navegador</span>
      </div>

      <div className="hero__stats">
        <div className="stat">
          <strong>6</strong>
          <span>criterios de calidad verificados</span>
        </div>
        <div className="stat">
          <strong>4</strong>
          <span>tipos de foto: portada, logo, producto, topping</span>
        </div>
        <div className="stat">
          <strong>100%</strong>
          <span>procesamiento local con IA en el navegador</span>
        </div>
      </div>
    </section>
  )
}
