'use client'
import { C } from '@/styles/colores'
import { CarritoProvider, useCarrito } from './context/CarritoContext'
import Header from './components/Header'
import HeroSection from '@/app/components/HeroSection'
import ProductosSection from '@/app/components/ProductosSection'
import CarritoPanel from '@/app/components/CarritoPanel'
import ModalImagen from '@/app/components/ModalImagen'
import EnviosSection from '@/app/components/EnviosSection'

function Toast() {
  const { notif } = useCarrito()
  if (!notif) return null
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '0.4rem',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Producto agregado */}
      <div style={{
        background: C.naranja, color: C.white,
        padding: '0.65rem 1.5rem', borderRadius: 24,
        fontWeight: 700, fontSize: '0.9rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        whiteSpace: 'nowrap',
      }}>
        🛒 {notif}
      </div>
      {/* Aviso stock */}
      <div style={{
        background: C.vino, color: '#FFD700',
        padding: '0.5rem 1.25rem', borderRadius: 20,
        fontWeight: 800, fontSize: '0.75rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        textAlign: 'center', letterSpacing: '0.03em',
      }}>
        ⚠️ ANTES DE PAGAR CONSULTÁ EL STOCK POR WHATSAPP
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{
      background: C.grisOscuro,
      color: C.crema,
      textAlign: 'center',
      padding: '2rem 1.5rem',
      marginTop: '3rem',
      borderTop: `3px solid ${C.naranja}`,
    }}>
      <p style={{ margin: 0, fontSize: '0.85rem' }}>
        <span style={{ color: C.naranjaPale, fontWeight: 700 }}>
          TECNO EG — Componentes & Servicio Técnico
        </span>
      </p>
      <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', opacity: 0.85 }}>
        CABALLITO  &nbsp;|&nbsp; C.A.B.A.
      </p>
      <p style={{ margin: '0.5rem 0', fontSize: '0.8rem' }}>
        
      </p>
      <p style={{ margin: '1.2rem 0 0', fontSize: '0.85rem', opacity: 0.5 }}>
        © {new Date().getFullYear()} Todos los derechos reservados {' '}
        <span style={{ color: C.naranjaPale }}>
          <br />
          Diseño web: Marcos Marti
        </span>
      </p>
      <a href="mailto:marcosmarti1980@gmail.com"
          style={{ color: C.gris, textDecoration: 'none', fontSize: '0.70rem', fontWeight: 400 }}>
           Si queres una web como esta <br />
           sos emprendedor ✉️ contactame
        </a>
    </footer>
  )
}

function AppContent() {
  return (
    <div suppressHydrationWarning className="app-content">
      <Header />
      <HeroSection />
      <ProductosSection />
      <EnviosSection />
      <Footer />
      <CarritoPanel />
      <ModalImagen />
      <Toast />

    </div>
  )
}

export default function Home() {
  return (
    <CarritoProvider>
      <AppContent />
    </CarritoProvider>
  )
}
