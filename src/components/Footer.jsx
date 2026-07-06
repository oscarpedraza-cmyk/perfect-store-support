import Icon from './Icon'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Icon name="aperture" size={22} className="brand-mark" />
        <span>
          Perfect Store <strong>Support</strong>
        </span>
      </div>
      <p>
        Proyecto independiente y comunitario, no afiliado ni operado por Rappi. Construido para ayudar a los aliados de
        restaurantes de cualquier país a subir fotos de calidad, sin errores.
      </p>
      <p className="site-footer__meta">Oscar Pedraza · 2026</p>
    </footer>
  )
}
