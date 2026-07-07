import { useState } from 'react'
import Icon from './Icon'

const TABS = [
  { id: 'overview', label: 'Perfect Store', icon: 'aperture' },
  { id: 'fotos', label: 'Fotos', icon: 'dish' },
  { id: 'purchasing', label: 'Purchasing Experience', icon: 'badge' },
  { id: 'missing', label: 'Missing Products', icon: 'grid' },
]

function VarTable({ rows }) {
  return (
    <div className="var-table__wrap">
      <table className="var-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Qué significa</th>
            <th>Qué se espera</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td>{r[0]}</td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function OverviewTab() {
  return (
    <div className="hub-panel">
      <h3>¿Qué es Perfect Store?</h3>
      <p>
        Es la métrica que mide qué tan lista está la carta de un restaurante en Rappi para vender igual (o mejor) que en el
        local físico. Le sirve tanto al equipo comercial para saber dónde enfocar su gestión con un aliado, como al aliado
        mismo para entender qué le está costando ventas.
      </p>
      <p>Se compone de <strong>3 partes</strong>, con el mismo peso cada una (33%). Para considerarse "de calidad", cada una debe estar en <strong>70% o más</strong>:</p>

      <div className="hub-pillars">
        <button className="hub-pillar" onClick={() => scrollTo('analizador')}>
          <Icon name="dish" size={22} />
          <strong>Fotos</strong>
          <span>El restaurante tiene foto de todos sus productos, y todas cumplen los criterios de calidad.</span>
        </button>
        <button className="hub-pillar" onClick={() => scrollTo('descripciones')}>
          <Icon name="badge" size={22} />
          <strong>Purchasing Experience</strong>
          <span>El cliente puede pedir en Rappi tan bien informado y con las mismas opciones que en el restaurante.</span>
        </button>
        <div className="hub-pillar hub-pillar--static">
          <Icon name="grid" size={22} />
          <strong>Missing Products</strong>
          <span>Todos los productos del punto físico también están cargados en Rappi — no falta ninguno.</span>
        </div>
      </div>

      <p className="hub-note">
        Las fichas de "Fotos" y "Purchasing Experience" te llevan directo al analizador correspondiente en esta misma
        herramienta. Missing Products es solo informativo aquí — más abajo te explicamos por qué.
      </p>
    </div>
  )
}

function FotosTab() {
  return (
    <div className="hub-panel">
      <h3>Fotos</h3>
      <p>
        Mide que el restaurante tenga foto de <strong>todos</strong> sus productos, y que <strong>todas</strong> cumplan un
        estándar de calidad — porque una foto mala o ausente es casi siempre la razón número uno por la que un cliente
        elige otro restaurante en la app.
      </p>

      <h4>Criterios de calidad (los mismos que mide el analizador)</h4>
      <VarTable
        rows={[
          ['Peso del archivo', 'Qué tan pesado es el archivo', '≥ 70KB (menos suele ser señal de baja resolución)'],
          ['Proporción', 'Qué tan cuadrada/rectangular es la foto', 'Entre 0.85 y 1.15 (para producto/topping)'],
          ['Encuadre', '% del cuadro que ocupa el producto', '≥ 90% — el plato debe ser el protagonista'],
          ['Brillo', 'Qué tan iluminada se ve', 'Ni muy oscura ni sobreexpuesta'],
          ['Saturación', 'Intensidad de los colores', 'Colores naturales, ni lavados ni artificiales'],
          ['Nitidez', 'Qué tan enfocada está', 'Sin borrosidad ni pixelado'],
          ['Fondo', 'Qué hay detrás del producto', 'Neutro (blanco puro obligatorio en toppings)'],
          ['Objetos ajenos', 'Manos, botellas, celulares, etc. en el encuadre', 'Ninguno — solo el producto'],
        ]}
      />

      <h4>Los 4 tipos de foto</h4>
      <VarTable
        rows={[
          ['Portada', 'Banner principal de la tienda en la app', '1256×600px · JPG · máx 600KB'],
          ['Logo', 'Identidad de marca (diseño, no una foto)', '700×520px · JPG · máx 600KB'],
          ['Producto', 'Foto de un plato del menú', '992×676px (mín 400×400, ideal 950×950) · JPG/PNG · máx 1MB'],
          ['Topping', 'Foto individual de un extra/ingrediente', '180×180px · PNG · fondo blanco obligatorio'],
        ]}
      />

      <button className="btn btn--dark" onClick={() => scrollTo('analizador')}>
        Ir al analizador de fotos
      </button>
    </div>
  )
}

function PurchasingTab() {
  return (
    <div className="hub-panel">
      <h3>Purchasing Experience</h3>
      <p>
        Mide que el cliente pueda pedir en Rappi <strong>tal como lo haría en el restaurante</strong>: entendiendo bien qué
        va a recibir, y con la posibilidad de personalizarlo (quitar lo que no quiere, agregar lo que sí).
      </p>

      <h4>1. Descripciones de calidad</h4>
      <VarTable
        rows={[
          ['Longitud', 'Ni muy corta ni muy larga', 'Corta y concisa, pero completa'],
          ['Sin juicios de valor', 'Palabras como "delicioso", "rico", "exquisito"', 'Cero — deben ser descriptivas, no opiniones'],
          ['Ingredientes', 'Qué lleva el plato', 'Mencionar todos o casi todos'],
          ['Tono', 'Cómo está escrito', 'Profesional y neutro (sin mayúsculas, sin exclamaciones, sin emojis)'],
          ['Detalles extra', 'Gramaje, presentación, método de preparación', 'Suma puntos, no es obligatorio'],
        ]}
      />

      <h4>2. Personalización (agregar/quitar)</h4>
      <p>Aplica sobre todo a <strong>hamburguesas y sandwiches</strong>:</p>
      <VarTable
        rows={[
          ['Categoría QUITAR', 'Que el cliente pueda pedir sin cebolla, sin mayonesa, sin azúcar, etc.', 'Configurada en el catálogo'],
          ['Categoría AGREGAR', 'Extras como salsas, vegetales o proteínas — con o sin precio', 'Configurada en el catálogo'],
        ]}
      />

      <button className="btn btn--dark" onClick={() => scrollTo('descripciones')}>
        Ir al analizador de descripciones
      </button>
    </div>
  )
}

function MissingTab() {
  return (
    <div className="hub-panel">
      <h3>Missing Products</h3>
      <p>
        Mide que <strong>todos</strong> los productos que existen en el punto físico también estén cargados en Rappi. Se
        audita comparando el menú de Rappi contra el menú real del restaurante — casi siempre a partir de un PDF o foto del
        menú físico que el aliado entrega.
      </p>

      <h4>Qué necesita el equipo para poder revisarlo</h4>
      <VarTable
        rows={[
          ['Formato', 'Tipo de archivo del menú', 'PNG, JPG, JPEG o PDF — nunca DOC, CSV ni un link'],
          ['Calidad', 'Que se pueda leer bien', 'Legible, completo, con el detalle de cada producto'],
          ['Un solo menú por archivo', 'No mezclar contenido', 'Sin 2 menús duplicados en un mismo documento'],
          ['Fotos sueltas', 'Cuando el menú son varias páginas', 'Combinarlas en un solo PDF, no mandarlas por separado'],
          ['Fuente', 'De dónde sale el menú', 'El propio restaurante — no una captura de la web ni de la competencia'],
        ]}
      />

      <div className="hub-note hub-note--warn">
        <Icon name="warn" size={16} />
        <p>
          Esta herramienta no tiene un analizador automático para Missing Products: en la práctica, la mayoría de los
          archivos que suben los aliados no vienen en el formato correcto, así que un checker automático no resultaba útil.
          Esta sección es solo para que entiendas qué se necesita — la revisión real la hace el equipo de Rappi con el
          catálogo interno.
        </p>
      </div>
    </div>
  )
}

const PANELS = {
  overview: OverviewTab,
  fotos: FotosTab,
  purchasing: PurchasingTab,
  missing: MissingTab,
}

export default function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState('overview')
  const ActivePanel = PANELS[activeTab]

  return (
    <section id="conocimiento" className="knowledge-hub">
      <div className="section-head">
        <span className="eyebrow">Centro de conocimiento</span>
        <h2>Todo lo que significa "calidad" en Perfect Store</h2>
        <p className="section-lead">
          Para que el equipo comercial y el aliado hablen el mismo idioma: qué mide cada parte de Perfect Store, con qué
          variables, y qué se espera de cada una.
        </p>
      </div>

      <div className="hub-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`hub-tab ${activeTab === t.id ? 'is-active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <ActivePanel />
    </section>
  )
}
