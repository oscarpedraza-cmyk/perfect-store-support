const FAQS = [
  {
    q: '¿Esto es una herramienta oficial de Rappi?',
    a: 'No. Perfect Store Support es un proyecto independiente hecho para apoyar a los aliados a subir fotos de calidad. No está afiliado, respaldado ni operado por Rappi. Los criterios se basan en lineamientos públicos de buenas prácticas de fotografía de producto.',
  },
  {
    q: '¿Suben mis fotos a algún servidor?',
    a: 'No. Todo el análisis (tamaño, brillo, saturación, nitidez y detección de encuadre con IA) corre directamente en tu navegador. Las imágenes nunca se envían a ningún backend.',
  },
  {
    q: '¿Qué tan preciso es el análisis?',
    a: 'Las métricas de tamaño, dimensiones y proporción son exactas. Brillo, saturación, nitidez y encuadre son estimaciones automáticas pensadas para ayudarte a detectar problemas evidentes antes de subir la foto — no reemplazan la validación final del sistema al que subas tu contenido.',
  },
  {
    q: '¿La corrección automática garantiza la aprobación?',
    a: 'La corrección ajusta recorte, tamaño, peso, brillo y saturación al estándar del tipo de foto seleccionado. Mejora muchísimo tus probabilidades, pero la aprobación final siempre depende del sistema oficial donde subas la imagen.',
  },
]

export default function FAQ() {
  return (
    <section className="faq">
      <div className="section-head">
        <span className="eyebrow">Preguntas frecuentes</span>
        <h2>Antes de que preguntes</h2>
      </div>
      <div className="faq__list">
        {FAQS.map((f) => (
          <details key={f.q} className="faq__item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
