// Especificaciones extraídas del Playbook Perfect Store (Rappi), sección Fotos.
// Fuente: slides 29-33 del playbook interno. Esta herramienta es independiente y no oficial.

export const PHOTO_TYPES = [
  {
    id: 'portada',
    label: 'Portada',
    icon: 'image',
    description: 'Foto de portada de la tienda (banner principal en la app).',
    dims: { width: 1256, height: 600 },
    ratioMode: 'target',
    orientation: 'horizontal',
    formats: ['jpg', 'jpeg'],
    maxKB: 600,
    checkBackground: false,
    checkPadding: false,
    checkPhotoQuality: true,
    checkExtraObjects: true,
    notes: [
      'Siempre debe ser la foto de un plato representativo del menú.',
      'Debe estar bien iluminada, sin sombras fuertes.',
      'No puede incluir texto ni banners.',
      'Fondo neutro.',
    ],
  },
  {
    id: 'logo',
    label: 'Logo',
    icon: 'badge',
    description: 'Logo de la marca (identidad, no una foto de plato).',
    dims: { width: 700, height: 520 },
    ratioMode: 'target',
    orientation: 'square',
    formats: ['jpg', 'jpeg'],
    maxKB: 600,
    checkBackground: false,
    checkPadding: false,
    checkPhotoQuality: false,
    checkExtraObjects: false,
    notes: [
      'Debe incluir el nombre de la marca.',
      'Debe ser una imagen/diseño, no una foto.',
      'No puede incluir información del aliado (teléfono, redes, dirección).',
    ],
  },
  {
    id: 'producto',
    label: 'Producto',
    icon: 'dish',
    description: 'Foto de un plato/producto del menú.',
    dims: { width: 992, height: 676 },
    minDims: { width: 400, height: 400 },
    idealDims: { width: 950, height: 950 },
    ratioMode: 'range',
    orientation: 'horizontal',
    formats: ['jpg', 'jpeg', 'png'],
    maxKB: 1024,
    checkBackground: true,
    checkPadding: true,
    checkPhotoQuality: true,
    checkExtraObjects: true,
    notes: [
      'El plato debe estar centrado y enfocado (no borrosa, pixelada ni estirada).',
      'Ambiente higiénico y organizado.',
      'Sin zoom exagerado ni texto/banners.',
      'Sin manos, envases, latas ni otros objetos ajenos al plato en el encuadre.',
    ],
  },
  {
    id: 'topping',
    label: 'Topping',
    icon: 'grid',
    description: 'Foto individual de un topping/extra (fondo blanco).',
    dims: { width: 180, height: 180 },
    ratioMode: 'range',
    orientation: 'square',
    formats: ['png'],
    maxKB: null,
    checkBackground: true,
    requireWhiteBackground: true,
    checkPadding: true,
    checkPhotoQuality: true,
    checkExtraObjects: true,
    notes: [
      'Fondo blanco obligatorio.',
      'Siempre debe ser la foto de un plato/ingrediente real, bien iluminada.',
      'No puede incluir texto ni banners.',
    ],
  },
]

// Rangos de calidad medibles automáticamente (slide 29 del playbook).
export const QUALITY_RANGES = {
  ratioMin: 0.85,
  ratioMax: 1.15,
  minKB: 70,
  paddingMaxPct: 10, // % máximo de espacio libre alrededor del producto
  sharpnessMin: 80,
  sharpnessMax: 1000,
  saturationMin: 0.10,
  saturationMax: 0.70,
  brightnessMin: 0.20,
  brightnessMax: 0.75,
}

export function getPhotoType(id) {
  return PHOTO_TYPES.find((t) => t.id === id) ?? PHOTO_TYPES[2]
}
