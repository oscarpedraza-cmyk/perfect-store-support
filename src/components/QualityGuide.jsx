import Icon from './Icon'

function MockFrame({ variant, label }) {
  return (
    <div className={`mock-frame mock-frame--${variant}`}>
      <div className="mock-frame__bg">
        <div className="mock-frame__plate" />
      </div>
      {variant === 'banner' && <div className="mock-frame__banner">-20% HOY</div>}
      <span className="mock-frame__label">{label}</span>
    </div>
  )
}

const PAIRS = [
  {
    title: 'Encuadre',
    good: { variant: 'centered', label: 'Plato centrado, 80%+ del cuadro' },
    bad: { variant: 'offcenter', label: 'Descentrado o con zoom exagerado' },
  },
  {
    title: 'Fondo e iluminación',
    good: { variant: 'clean', label: 'Fondo neutro, luz pareja' },
    bad: { variant: 'cluttered', label: 'Fondo cargado, sombras fuertes' },
  },
  {
    title: 'Nitidez',
    good: { variant: 'sharp', label: 'Enfocada y clara' },
    bad: { variant: 'blurry', label: 'Borrosa, pixelada o estirada' },
  },
  {
    title: 'Sin elementos extra',
    good: { variant: 'plain', label: 'Solo el producto' },
    bad: { variant: 'banner', label: 'Con texto, precios o banners' },
  },
]

const CHECKLIST = [
  'Mínimo 400×400px, ideal 950×950px',
  'Imagen cuadrada, plato en el centro',
  'Fondo neutro que no distraiga',
  'Buena luz, idealmente natural, sin sombras fuertes',
  'Enfocada: nítida, sin pixelado ni estiramiento',
  'Se ve al menos el 80% del producto, sin zoom exagerado',
  'Ambiente higiénico y organizado',
  'Sin texto, precios ni banners superpuestos',
  'Formato JPG o PNG',
]

export default function QualityGuide() {
  return (
    <section id="guia" className="quality-guide">
      <div className="section-head">
        <span className="eyebrow">Guía de calidad</span>
        <h2>Así se ve una foto que aprueba — y una que no.</h2>
        <p className="section-lead">Basado en los lineamientos oficiales de fotos de producto del Perfect Store.</p>
      </div>

      <div className="pairs">
        {PAIRS.map((p) => (
          <div key={p.title} className="pair">
            <h4>{p.title}</h4>
            <div className="pair__frames">
              <div className="pair__frame">
                <MockFrame {...p.good} />
                <span className="pair__tag pair__tag--good">
                  <Icon name="check" size={14} /> Correcto
                </span>
              </div>
              <div className="pair__frame">
                <MockFrame {...p.bad} />
                <span className="pair__tag pair__tag--bad">
                  <Icon name="cross" size={14} /> Incorrecto
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="checklist-card">
        <h3>Checklist rápido antes de subir</h3>
        <ul>
          {CHECKLIST.map((item) => (
            <li key={item}>
              <Icon name="check" size={16} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
