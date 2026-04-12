'use client'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import Image from 'next/image'
import { useCarrito } from '../context/CarritoContext'
import { C } from '@/styles/colores'

const formatARS = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

const IconCarrito = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

const btnQtyStyle: React.CSSProperties = {
  width: 26, height: 26,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: C.crema, border: `1px solid ${C.gris}`, borderRadius: 6,
  cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: C.vino, padding: 0,
}

export default function CarritoPanel() {
  const { carrito, carritoOpen, setCarritoOpen, cambiarCantidad, quitarDelCarrito, vaciarCarrito, mostrarNotif } = useCarrito()
  const [procesando, setProcesando] = useState(false)

  const totalCarrito    = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const cantidadCarrito = carrito.reduce((s, i) => s + i.cantidad, 0)

 const handleComprar = async () => {
  if (carrito.length === 0) return
  setProcesando(true)
  try {
    const titulo = carrito.map(i => `${i.titulo} x${i.cantidad}`).join(', ')
    const precio = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
    setCarritoOpen(false)
    window.location.href = `/checkout?titulo=${encodeURIComponent(titulo)}&precio=${precio}`
  } finally {
    setProcesando(false)
  }
}

  if (!carritoOpen) return null

  return createPortal(
    <div onClick={() => setCarritoOpen(false)} style={{
      position: 'fixed', inset: 0, background: 'rgba(20,18,14,0.5)', zIndex: 9999,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top: 0, right: 0,
        height: '100%', width: 'min(400px, 100vw)',
        background: C.fondo,
        boxShadow: '-4px 0 30px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', zIndex: 9999,
      }}>

        {/* Header carrito */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.gris}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.vino,
        }}>
          <h3 style={{ margin: 0, color: C.white, fontSize: '1.1rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconCarrito size={18} /> Carrito ({cantidadCarrito})
          </h3>
          <button onClick={() => setCarritoOpen(false)} style={{
            background: 'transparent', border: 'none', color: C.white,
            cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1, padding: '0.25rem',
          }}>✕</button>
        </div>

        {/* Aviso stock */}
        <div style={{
          background: C.naranja, padding: '0.6rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: C.white, lineHeight: 1.3 }}>
            ANTES DE PAGAR CONSULTÁ EL STOCK POR WHATSAPP
          </p>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {carrito.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '3rem', color: C.grisOscuro }}>
              <IconCarrito size={40} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item.id_producto} style={{
                display: 'flex', gap: '0.75rem', padding: '0.75rem 0',
                borderBottom: `1px solid ${C.gris}`, alignItems: 'center',
              }}>
                <div style={{
                  position: 'relative', width: 60, height: 60,
                  borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: C.gris,
                }}>
                  <Image src={item.imagen} alt={item.titulo} fill sizes="60px" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.82rem', fontWeight: 600,
                    color: C.vino, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.titulo}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: C.naranja, fontWeight: 700 }}>
                    {formatARS(item.precio)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button onClick={() => cambiarCantidad(item.id_producto, -1)} style={btnQtyStyle}>−</button>
                  <span style={{ minWidth: 20, textAlign: 'center', fontSize: '0.85rem' }}>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id_producto, 1)} style={btnQtyStyle}>+</button>
                  <button onClick={() => quitarDelCarrito(item.id_producto)} style={{
                    background: 'transparent', border: 'none', color: '#ef4444',
                    cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.3rem', marginLeft: '0.2rem',
                  }}>🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer carrito */}
        {carrito.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: `1px solid ${C.gris}`, background: C.crema }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, color: C.vino }}>Total</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: C.naranja }}>{formatARS(totalCarrito)}</span>
            </div>
            <button onClick={handleComprar} disabled={procesando} style={{
              width: '100%', padding: '0.9rem',
              background: procesando ? C.grisOscuro : C.vino,
              border: 'none', borderRadius: 10, color: C.white,
              fontWeight: 800, fontSize: '1rem', cursor: procesando ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              <IconCarrito size={18} />
              {procesando ? 'Redirigiendo…' : 'Pagar con Mercado Pago'}
            </button>
            <button onClick={vaciarCarrito} style={{
              width: '100%', marginTop: '0.5rem', padding: '0.5rem',
              background: 'transparent', border: 'none', color: C.grisOscuro,
              fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline',
            }}>Vaciar carrito</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}