'use client'

import { CarritoProvider, useCarrito } from '../context/CarritoContext'
import Header from '../components/Header'
import ProductosSection from '../components/ProductosSection'
import CarritoPanel from '../components/CarritoPanel'
import ModalImagen from '../components/ModalImagen'
import EnviosSection from '../components/EnviosSection'
import Footer from '../components/Footer'
import { C } from '@/styles/colores'
import {
  Truck,
  MapPin,
  Wallet,
  PackageCheck,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

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

function HeroTienda() {
  return (
    <section
      id="tienda"
      style={{
        padding: '2.2rem 1.2rem',
        background: '#ffffff',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          margin: '0 0 .5rem',
          fontSize: '2rem',
          color: C.vino,
          fontWeight: 800,
        }}
      >
        Equipos y Componentes
      </h1>

      <p
        style={{
          margin: '0 auto',
          maxWidth: 760,
          color: '#444',
          lineHeight: 1.6,
          fontSize: '1rem',
        }}
      >
        Notebooks, PCs armadas, monitores, periféricos,
        redes, almacenamiento y más.
      </p>
    </section>
  )
}

function ProductosWrap() {
  return (
    <section id="productos">
      <ProductosSection />
    </section>
  )
}

function CondicionesCompra() {
  const [open, setOpen] = useState(false)

  const items = [
    {
      icon: <Truck size={18} />,
      title: 'Entregas',
      text: 'Consultar zonas y tiempos disponibles.',
    },
    {
      icon: <MapPin size={18} />,
      title: 'Retiro',
      text: 'Caballito, C.A.B.A.',
    },
    {
      icon: <Wallet size={18} />,
      title: 'Seña',
      text: '50% en pedidos especiales.',
    },
    {
      icon: <PackageCheck size={18} />,
      title: 'Stock',
      text: 'Consultar antes de pagar.',
    },
  ]

  return (
    <section
      id="condiciones"
      style={{
        padding: '2rem 1.2rem',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: '100%',
            background: '#f6f6f6',
            border: '1px solid #e6e6e6',
            borderRadius: 18,
            padding: '1rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontWeight: 700,
            color: C.vino,
            fontSize: '1rem',
          }}
        >
          Condiciones de Compra, Venta y Envío
          <ChevronDown
            size={18}
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.25s',
            }}
          />
        </button>

        {open && (
          <div
            style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              gap: '1rem',
            }}
          >
            {items.map((item) => (
              <div
                key={item.title}
                style={{
                  background: '#fafafa',
                  border: '1px solid #ececec',
                  borderRadius: 16,
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    color: C.vino,
                    fontWeight: 700,
                    marginBottom: '.5rem',
                  }}
                >
                  {item.icon}
                  {item.title}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '.92rem',
                    color: '#444',
                    lineHeight: 1.5,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function AppContent() {
  return (
    <div suppressHydrationWarning className="app-content">
      <Header />

      <HeroTienda />

      {/* Productos con ancla principal */}
      <ProductosWrap />

      {/* Sección envíos anclable */}
      <section id="envios">
        <EnviosSection />
      </section>

      {/* Datos menos protagonistas */}
      <CondicionesCompra />

      <CarritoPanel />
      <ModalImagen />
      <Toast />
      <Footer />
    </div>
  )
}

export default function TiendaPage() {
  return (
    <CarritoProvider>
      <AppContent />
    </CarritoProvider>
  )
}