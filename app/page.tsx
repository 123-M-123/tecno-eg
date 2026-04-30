'use client'

import { CarritoProvider, useCarrito } from './context/CarritoContext'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import Footer from './components/Footer'
import CarritoPanel from './components/CarritoPanel'
import ModalImagen from './components/ModalImagen'
import { C } from '@/styles/colores'

function Toast() {
  const { notif } = useCarrito()

  if (!notif) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: C.naranja,
          color: C.white,
          padding: '0.7rem 1.4rem',
          borderRadius: 30,
          fontWeight: 700,
          boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
        }}
      >
        🛒 {notif}
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <div suppressHydrationWarning className="app-content">
      {/* HEADER GLOBAL */}
      <Header />

      {/* HOME REORDENADO */}
      <HeroSection />

      {/* SISTEMA GLOBAL */}
      <CarritoPanel />
      <ModalImagen />
      <Toast />

      {/* FOOTER */}
      <Footer />
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