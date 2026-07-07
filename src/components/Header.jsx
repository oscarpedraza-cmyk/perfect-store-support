import Icon from './Icon'

export default function Header() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <Icon name="aperture" size={26} className="brand-mark" />
        <span>
          Perfect Store <strong>Support</strong>
        </span>
      </div>
      <nav className="site-header__nav">
        <button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button>
        <button onClick={() => scrollTo('analizador')}>Fotos</button>
        <button onClick={() => scrollTo('guia')}>Guía de calidad</button>
        <button onClick={() => scrollTo('descripciones')}>Descripciones</button>
        <button onClick={() => scrollTo('conocimiento')}>Conocimiento</button>
        <button className="btn btn--accent btn--sm" onClick={() => scrollTo('analizador')}>
          Analizar mi foto
        </button>
      </nav>
    </header>
  )
}
