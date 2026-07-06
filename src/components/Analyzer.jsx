import { useCallback, useRef, useState } from 'react'
import { PHOTO_TYPES, getPhotoType } from '../lib/photoSpecs'
import { analyzeImage } from '../lib/imageAnalysis'
import { evaluatePhoto } from '../lib/evaluate'
import { autoFixImage } from '../lib/autoFix'
import { trackEvent } from '../lib/track'
import Icon from './Icon'
import PhotoResultCard from './PhotoResultCard'

let idCounter = 0

export default function Analyzer() {
  const [typeId, setTypeId] = useState('producto')
  const [items, setItems] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const spec = getPhotoType(typeId)

  const runAnalysis = useCallback(async (id, file, specForItem) => {
    try {
      const analysis = await analyzeImage(file)
      const evaluation = evaluatePhoto(analysis, specForItem)
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'ready', analysis, evaluation } : it)))
      trackEvent('analyzed')
      trackEvent(`analyzed_${specForItem.id}`)
      if (evaluation.overallPass) trackEvent('approved')
    } catch (e) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'error', error: e.message } : it)))
    }
  }, [])

  const addFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (files.length === 0) return
      const newItems = files.map((file) => ({
        id: ++idCounter,
        file,
        specId: typeId,
        status: 'analyzing',
        analysis: null,
        evaluation: null,
        fixing: false,
        fixed: null,
        error: null,
      }))
      setItems((prev) => [...newItems, ...prev])
      newItems.forEach((it) => runAnalysis(it.id, it.file, spec))
    },
    [typeId, spec, runAnalysis],
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleFix = async (id) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, fixing: true } : it)))
    const item = items.find((it) => it.id === id)
    if (!item) return
    try {
      const itemSpec = getPhotoType(item.specId)
      const fixed = await autoFixImage(item.file, item.analysis, itemSpec)
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, fixing: false, fixed } : it)))
      trackEvent('fixed')
    } catch (e) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, fixing: false, error: e.message } : it)))
    }
  }

  const handleReanalyzeFixed = (id) => {
    const item = items.find((it) => it.id === id)
    if (!item?.fixed) return
    const newFile = new File([item.fixed.blob], item.file.name, { type: item.fixed.blob.type })
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, file: newFile, status: 'analyzing', fixed: null, analysis: null, evaluation: null } : it)),
    )
    runAnalysis(id, newFile, getPhotoType(item.specId))
  }

  const handleRemove = (id) => setItems((prev) => prev.filter((it) => it.id !== id))

  const doneItems = items.filter((it) => it.status === 'ready')
  const approvedCount = doneItems.filter((it) => it.evaluation?.overallPass).length

  return (
    <section id="analizador" className="analyzer">
      <div className="section-head">
        <span className="eyebrow">El analizador</span>
        <h2>Sube tu foto. Te decimos exactamente qué corregir.</h2>
        <p className="section-lead">
          Elige el tipo de imagen, suelta uno o varios archivos y obtén un diagnóstico criterio por criterio en segundos. Nada se
          sube a ningún servidor: todo el análisis corre en tu navegador.
        </p>
      </div>

      <div className="type-selector">
        {PHOTO_TYPES.map((t) => (
          <button key={t.id} className={`type-pill ${typeId === t.id ? 'is-active' : ''}`} onClick={() => setTypeId(t.id)}>
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>
      <p className="type-description">{spec.description}</p>

      <div
        className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <Icon name="upload" size={32} />
        <p>
          <strong>Arrastra tus fotos aquí</strong> o haz clic para elegir archivos
        </p>
        <span className="dropzone__hint">
          {spec.formats.map((f) => f.toUpperCase()).join(' / ')} · objetivo {spec.dims.width}×{spec.dims.height}px
          {spec.maxKB ? ` · máx ${spec.maxKB}KB` : ''}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="batch-summary">
          <strong>
            {approvedCount}/{doneItems.length}
          </strong>{' '}
          fotos aprobadas en este lote
        </div>
      )}

      <div className="result-grid">
        {items.map((item) => (
          <PhotoResultCard key={item.id} item={item} onFix={handleFix} onRemove={handleRemove} onReanalyzeFixed={handleReanalyzeFixed} />
        ))}
      </div>
    </section>
  )
}
