'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useConfigStore } from '@/store/useConfigStore'

// Definimos la interfaz que espera Zustand
interface ProductoZustand {
  id: string
  nombre: string
  precio: number
  precioTransfer: number
  imagen: string
  categoria?: string
  descripcion?: string
  stock?: number
}

type Props = {
  titulo: string
  productos: any[] // Recibe los productos del fetch original
  onVerProducto: (producto: ProductoZustand) => void
}

export default function Carrusel({ titulo, productos, onVerProducto }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { config } = useConfigStore()

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Título del carrusel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '1rem', 
          fontWeight: 700, 
          color: 'var(--color-medio-1)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em' 
        }}>
          {titulo}
        </h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => scroll('left')} style={btnStyle}>‹</button>
          <button onClick={() => scroll('right')} style={btnStyle}>›</button>
        </div>
      </div>

      {/* Track del carrusel */}
      <div
        ref={ref}
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none',
        }}
      >
        {productos.map((p) => {
          // MAPEADO DE CAMPOS PARA EL MOTOR ESTÁNDAR
          const prodMapeado: ProductoZustand = {
            id: p.id_producto || p.id,
            nombre: p.titulo || p.nombre,
            precio: p.precio, // Precio con descuento (Transfer)
            precioTransfer: p.precio, 
            imagen: p.imagen,
            categoria: p.categoria || titulo,
            descripcion: p.descripcion || p.titulo,
            stock: p.stock
          }

          const precioLista = Math.round(prodMapeado.precio / 0.9);

          return (
            <div
              key={prodMapeado.id}
              onClick={() => onVerProducto(prodMapeado)}
              style={{
                flexShrink: 0,
                width: 200,
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                borderRadius: 'var(--radius-ui)',
                overflow: 'hidden',
                border: `1.5px solid var(--color-claro-3)`,
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
              }}
            >
              {/* Imagen */}
              <div style={{ position: 'relative', aspectRatio: '1', background: '#f3f3f3' }}>
                <Image
                  src={prodMapeado.imagen}
                  alt={prodMapeado.nombre}
                  fill
                  sizes="160px"
                  style={{ objectFit: 'contain', padding: '10px' }}
                />
                <span style={{
                  position: 'absolute', top: 8, left: 8,
                  background: prodMapeado.stock === 0 ? '#cc0000' : '#11cc00',
                  color: 'white', fontSize: '0.65rem', fontWeight: 700,
                  padding: '0.2rem 0.55rem', borderRadius: 10, zIndex: 1
                }}>
                  {prodMapeado.stock === 0 ? 'SIN STOCK' : 'Disponible'}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: '0.8rem' }}>
                <p style={{
                  margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700,
                  color: 'var(--color-oscuro-1)', lineHeight: 1.3, height: '2.1rem',
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {prodMapeado.nombre}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', opacity: 0.5 }}>
                    {formatARS(precioLista)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-medio-2)' }}>
                      {formatARS(prodMapeado.precio)}
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-medio-2)' }}>
                      -10% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%', border: 'none',
  background: 'var(--color-medio-2)', color: '#fff', fontSize: '1.5rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}