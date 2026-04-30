'use client'

import Image from 'next/image'
import { useCarrito } from '../context/CarritoContext'
import { C } from '@/styles/colores'
import { getOriginalPrice } from '@/lib/pricing'

const formatARS = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

const IconCarrito = ({ size = 15 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

export default function ModalImagen() {
  const { modal, setModal, agregarAlCarrito } = useCarrito()
  if (!modal) return null

  const lista = modal._lista || []
  const indice = modal._indice ?? -1
  const tieneFlechas = lista.length > 1 && indice >= 0

  const ir = (nuevoIndice: number) => {
    if (nuevoIndice < 0 || nuevoIndice >= lista.length) return
    setModal({ ...lista[nuevoIndice], _lista: lista, _indice: nuevoIndice })
  }

  const precioFinal = modal.precio
  const precioOriginal = getOriginalPrice(modal.precio)

  return (
    <div
      onClick={() => setModal(null)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,18,14,0.88)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
       style={{
  background: C.white,
  borderRadius: 16,
  overflow: 'hidden',
  width: '100%',
  maxWidth: 480,
  boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
  position: 'relative',
}}
className="modal-producto"
      >
        {/* Flechas navegación */}
        {tieneFlechas && (
          <>
            <button
              onClick={() => ir(indice - 1)}
              disabled={indice === 0}
              style={{
                position: 'absolute',
                left: 8,
                top: '35%',
                zIndex: 10,
                background: indice === 0 ? 'rgba(0,0,0,0.2)' : C.vino,
                border: 'none',
                borderRadius: '50%',
                width: 48,
                height: 48,
                color: C.white,
                fontSize: '2.6rem',
                lineHeight: '1',
                paddingBottom: '10px',
                cursor: indice === 0 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ‹
            </button>

            <button
              onClick={() => ir(indice + 1)}
              disabled={indice === lista.length - 1}
              style={{
                position: 'absolute',
                right: 8,
                top: '35%',
                zIndex: 10,
                background: indice === lista.length - 1 ? 'rgba(0,0,0,0.2)' : C.vino,
                border: 'none',
                borderRadius: '50%',
                width: 48,
                height: 48,
                color: C.white,
                fontSize: '2.6rem',
                lineHeight: '1',
                paddingBottom: '10px',
                cursor: indice === lista.length - 1 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Imagen */}
        <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
          <Image
            src={modal.imagen}
            alt={modal.titulo}
            fill
            sizes="480px"
            style={{ objectFit: 'cover' }}
          />

          <button
            onClick={() => setModal(null)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: C.white,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {tieneFlechas && (
            <span
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.5)',
                color: C.white,
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 10,
              }}
            >
              {indice + 1} / {lista.length}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', fontWeight: 700, color: C.vino }}>
            {modal.titulo}
          </h3>

          {/* Stock */}
          <span
            translate="no"
            style={{
              display: 'inline-block',
              marginBottom: '0.75rem',
              background: modal.stock === 0 ? '#cc0000' : '#2d9c4a',
              color: C.white,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 8,
            }}
          >
            {modal.stock === 0 ? '❌ Sin stock' : '✅ Disponible'}
          </span>

          {/* PRECIO */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

  {/* precio de lista */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

    <span style={{
      fontSize: '1.1rem',
      textDecoration: 'line-through',
      opacity: 0.5,
      color: C.grisOscuro,
    }}>
      {formatARS(precioOriginal)}
    </span>

    <span style={{
      fontSize: '0.9rem',
      opacity: 0.7,
      color: C.grisOscuro,
    }}>
      Precio de lista
    </span>

  </div>

  {/* precio con descuento */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

    <span style={{
      fontSize: '1.3rem',
      fontWeight: 800,
      color: C.naranja,
    }}>
      {formatARS(precioFinal)}
    </span>

    <span style={{
      fontSize: '0.85rem',
      fontWeight: 400,
      color: C.naranja,
      opacity: 0.8,
    }}>
      (Con desc. 10%)
    </span>

  </div>

</div>
          </div>

          {/* Botones */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${C.gris}`,
                  borderRadius: 8,
                  background: C.white,
                  color: C.grisOscuro,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  agregarAlCarrito(modal)
                  setModal(null)
                }}
                disabled={modal.stock === 0}
                style={{
                  padding: '0.5rem 1.25rem',
                  border: 'none',
                  borderRadius: 8,
                  background: modal.stock === 0 ? C.gris : C.naranja,
                  color: C.white,
                  cursor: modal.stock === 0 ? 'default' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <IconCarrito size={15} />
                  {modal.stock === 0 ? 'Sin stock' : 'Agregar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}