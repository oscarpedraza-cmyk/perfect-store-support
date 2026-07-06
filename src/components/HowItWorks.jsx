import Icon from './Icon'

const STEPS = [
  {
    icon: 'grid',
    title: '1. Elige el tipo de foto',
    text: 'Portada, logo, producto o topping — cada una tiene su propio estándar de tamaño, peso y encuadre.',
  },
  {
    icon: 'upload',
    title: '2. Arrastra tu imagen',
    text: 'Sube una o varias fotos a la vez. El análisis corre en tu navegador: tamaño, proporción, brillo, saturación, nitidez y encuadre con IA.',
  },
  {
    icon: 'wand',
    title: '3. Corrige y descarga',
    text: 'Si algo falla, un clic recorta, ajusta y comprime la imagen al estándar exacto. Descargas el archivo listo para subir.',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="how-it-works">
      <div className="section-head">
        <span className="eyebrow">Cómo funciona</span>
        <h2>De la cámara del celular a una foto aprobada, en tres pasos.</h2>
      </div>
      <div className="steps">
        {STEPS.map((s) => (
          <div key={s.title} className="step">
            <div className="step__icon">
              <Icon name={s.icon} size={22} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
