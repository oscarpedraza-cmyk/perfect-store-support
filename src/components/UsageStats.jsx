import { useEffect, useState } from 'react'
import { getStats } from '../lib/track'
import Icon from './Icon'

export default function UsageStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    getStats(['analyzed', 'approved']).then((s) => {
      if (!cancelled) setStats(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!stats?.analyzed) return null

  return (
    <div className="usage-bar">
      <Icon name="dish" size={14} />
      <span>
        <strong>{stats.analyzed.toLocaleString('es')}</strong> fotos analizadas
        {stats.approved ? (
          <>
            {' '}
            · <strong>{stats.approved.toLocaleString('es')}</strong> aprobadas a la primera
          </>
        ) : null}
      </span>
    </div>
  )
}
