const PATHS = {
  aperture: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 4 L15 10 L12 12 L9 10 Z" fill="currentColor" />
      <path d="M20 12 L14 14.5 L12 12 L14.5 9.5 Z" fill="currentColor" />
      <path d="M12 20 L9 14 L12 12 L15 14 Z" fill="currentColor" />
      <path d="M4 12 L10 9.5 L12 12 L9.5 14.5 Z" fill="currentColor" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="10.5" r="1.6" fill="currentColor" />
      <path d="M4 17 L9.5 12.5 L13 15.5 L16 12 L20 16" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  badge: (
    <>
      <path
        d="M12 3 L19 6 V12 C19 16 16 19 12 21 C8 19 5 16 5 12 V6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M9 12 L11 14 L15.5 9" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  dish: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  check: <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  cross: (
    <>
      <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 6 L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  warn: (
    <>
      <path d="M12 3.5 L21 19.5 H3 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9.5 V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16 V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 9.5 L12 5 L16.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.5 V18 C4.5 18.8 5.2 19.5 6 19.5 H18 C18.8 19.5 19.5 18.8 19.5 18 V16.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  download: (
    <>
      <path d="M12 5 V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 11.5 L12 16 L16.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.5 V18 C4.5 18.8 5.2 19.5 6 19.5 H18 C18.8 19.5 19.5 18.8 19.5 18 V16.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  wand: (
    <>
      <path d="M5 19 L15 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 9 L19 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 3 V6 M16.5 4.5 H19.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 15 V17.5 M6.7 16.25 H9.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  refresh: (
    <path
      d="M5 12a7 7 0 0 1 12-4.9L19 9M19 4v5h-5M19 12a7 7 0 0 1-12 4.9L5 15m0 5v-5h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`icon icon-${name} ${className}`} aria-hidden="true">
      {PATHS[name] || null}
    </svg>
  )
}
