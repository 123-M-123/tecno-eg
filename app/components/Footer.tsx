'use client'

export default function Footer() {
  return (
    <footer style={{
      background: '#000000', // fondo negro
      textAlign: 'center',
      padding: '1rem', // más compacto
      borderTop: '3px solid #858585', // gris hardcodeado
      position: 'sticky',
      bottom: 0,
    }}>
      {/* Primer bloque: marca web */}
      <p style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700, lineHeight: '1.4' }}>
        TECNO EG — Componentes & Servicio Técnico
      </p>
      <p style={{ fontSize: '0.7rem', color: '#9b9b9b', lineHeight: '1.4' }}>
        CABALLITO &nbsp;|&nbsp; C.A.B.A.
      </p>
      <p style={{ fontSize: '0.65rem', color: '#7e7e7e', lineHeight: '1.4' }}>
        © {new Date().getFullYear()} Todos los derechos reservados
      </p>

      {/* Segundo bloque: tu marca */}
      <p style={{ fontSize: '0.75rem', fontWeight: 700, paddingTop: '1rem', lineHeight: '1.4' }}>
        <a href="https://tienda-de-tiendas.vercel.app" style={{ color: '#7e7e7e', textDecoration: 'none' }}>
          Diseño y Desarrollo web: Tienda de Tiendas
        </a>
      </p>
      <p style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
        <a href="https://tienda-de-tiendas.vercel.app" style={{ color: '#9b9b9b', textDecoration: 'none' }}>
          Promo Micro Emp 50% off hasta Dic 2026
        </a>
      </p>
      <p style={{ fontSize: '0.65rem', lineHeight: '1.4' }}>
        <a href="mailto:marcosrenemarti@gmail.com" style={{ color: '#ffffff', textDecoration: 'none' }}>
          Tené tu Web en 2 días ✉️ Contacto
        </a>
      </p>
    </footer>
  )
}
