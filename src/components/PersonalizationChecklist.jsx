import { useState } from 'react'
import { trackEvent } from '../lib/track'
import Icon from './Icon'

const REMOVE_EXAMPLES = ['Hamburguesa sin cebolla', 'Perro sin mayonesa', 'Café sin azúcar']
const ADD_EXAMPLES = ['Salsas (ej. teriyaki)', 'Vegetales (ej. alcachofa)', 'Proteínas (ej. doble carne)']

export default function PersonalizationChecklist() {
  const [isBurgerOrSandwich, setIsBurgerOrSandwich] = useState(true)
  const [hasRemove, setHasRemove] = useState(false)
  const [hasAdd, setHasAdd] = useState(false)

  const checkedCount = [hasRemove, hasAdd].filter(Boolean).length
  const complete = checkedCount === 2

  const handleCheck = (setter) => (e) => {
    setter(e.target.checked)
    trackEvent('personalization_checked')
  }

  return (
    <div className="personalization-card">
      <h3>Checklist de personalización (agregar/quitar)</h3>
      <p className="personalization-intro">
        El playbook pide que el usuario pueda pedir en Rappi como lo haría en el restaurante: quitando ingredientes o
        agregando extras. Esto se configura en el catálogo del Portal — no lo podemos leer automáticamente desde una foto o
        texto, pero aquí tienes el checklist para verificarlo tú mismo.
      </p>

      <label className="toggle-row">
        <input type="checkbox" checked={isBurgerOrSandwich} onChange={(e) => setIsBurgerOrSandwich(e.target.checked)} />
        Este producto es una hamburguesa o sandwich
      </label>

      {isBurgerOrSandwich && (
        <>
          <label className="toggle-row">
            <input type="checkbox" checked={hasRemove} onChange={handleCheck(setHasRemove)} />
            Tiene categoría topping para QUITAR ingredientes
          </label>
          <p className="personalization-examples">Ej: {REMOVE_EXAMPLES.join(' · ')}</p>

          <label className="toggle-row">
            <input type="checkbox" checked={hasAdd} onChange={handleCheck(setHasAdd)} />
            Tiene categoría topping para AGREGAR extras (con o sin precio)
          </label>
          <p className="personalization-examples">Ej: {ADD_EXAMPLES.join(' · ')}</p>

          <div className={`personalization-result ${complete ? 'is-good' : 'is-warn'}`}>
            <Icon name={complete ? 'check' : 'warn'} size={16} />
            {complete
              ? 'Este producto cumple con personalización completa.'
              : `Falta configurar ${2 - checkedCount} categoría${2 - checkedCount > 1 ? 's' : ''} de personalización en el catálogo.`}
          </div>
        </>
      )}
    </div>
  )
}
