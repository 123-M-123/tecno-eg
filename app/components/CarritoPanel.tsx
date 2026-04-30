'use client'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import Image from 'next/image'
import { useCarrito } from '../context/CarritoContext'
import { C } from '@/styles/colores'

const formatARS = (n: number) =>
  n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

const IconCarrito = ({ size = 18 }: { size?: number }) => (
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

const btnQtyStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f4f4f4',
  border: '1px solid #dddddd',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 700,
  color: '#222',
  padding: 0,
}

export default function CarritoPanel() {
  const {
    carrito,
    carritoOpen,
    setCarritoOpen,
    cambiarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
  } = useCarrito()

  const [procesando, setProcesando] = useState(false)

  const totalCarrito = carrito.reduce(
    (s, i) => s + i.precio * i.cantidad,
    0
  )

  const cantidadCarrito = carrito.reduce(
    (s, i) => s + i.cantidad,
    0
  )

  const handleComprar = async () => {
    if (carrito.length === 0) return

    setProcesando(true)

    try {
      const titulo = carrito
        .map((i) => `${i.titulo} x${i.cantidad}`)
        .join(', ')

      const precio = carrito.reduce(
        (s, i) => s + i.precio * i.cantidad,
        0
      )

      setCarritoOpen(false)

      window.location.href =
        `/checkout?titulo=${encodeURIComponent(titulo)}&precio=${precio}`
    } finally {
      setProcesando(false)
    }
  }

  if (!carritoOpen) return null

  return createPortal(
    <div
      onClick={() => setCarritoOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(400px, 100vw)',
          background: C.fondo,
          boxShadow: '-4px 0 30px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: `1px solid ${C.gris}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: C.grisOscuro,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: C.white,
              fontSize: '1.05rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '.5rem',
            }}
          >
            <IconCarrito size={18} />
            Carrito ({cantidadCarrito})
          </h3>

          <button
            onClick={() => setCarritoOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.white,
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* AVISO */}
        <div
          style={{
            background: C.naranja,
            padding: '.7rem 1.2rem',
          }}
        >
          <p
            style={{
              margin: 0,
              color: C.white,
              fontSize: '.78rem',
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            CONSULTAR STOCK ANTES DE ABONAR
          </p>
        </div>

        {/* ITEMS */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.3rem',
          }}
        >
          {carrito.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                paddingTop: '3rem',
                color: C.grisOscuro,
              }}
            >
              <IconCarrito size={42} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div
                key={item.id_producto}
                style={{
                  display: 'flex',
                  gap: '.75rem',
                  padding: '.8rem 0',
                  borderBottom: `1px solid ${C.gris}`,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 62,
                    height: 62,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#fff',
                    border: `1px solid ${C.gris}`,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.imagen}
                    alt={item.titulo}
                    fill
                    sizes="62px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: '0 0 .25rem',
                      fontSize: '.82rem',
                      fontWeight: 700,
                      color: C.vino,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.titulo}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

  {/* precio lista (tachado izquierda + label derecha) */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

    <span
      style={{
        fontSize: '.9rem',
        textDecoration: 'line-through',
        opacity: 0.5,
        color: C.grisOscuro,
      }}
    >
      {formatARS(item.precio / 0.9)}
    </span>

    <span
      style={{
        fontSize: '.8rem',
        opacity: 0.7,
        color: C.grisOscuro,
      }}
    >
      Precio de lista
    </span>

  </div>

  {/* precio con descuento */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

    <span
      style={{
        fontSize: '.9rem',
        fontWeight: 900,
        color: C.naranja,
      }}
    >
      {formatARS(item.precio)}
    </span>

    <span
      style={{
        fontSize: '.75rem',
        fontWeight: 400,
        color: C.naranja,
        opacity: 0.85,
      }}
    >
      (Con desc.-10%)
    </span>

  </div>

</div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.3rem',
                  }}
                >
                  <button
                    onClick={() =>
                      cambiarCantidad(item.id_producto, -1)
                    }
                    style={btnQtyStyle}
                  >
                    −
                  </button>

                  <span
                    style={{
                      minWidth: 18,
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {item.cantidad}
                  </span>

                  <button
                    onClick={() =>
                      cambiarCantidad(item.id_producto, 1)
                    }
                    style={btnQtyStyle}
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      quitarDelCarrito(item.id_producto)
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: C.naranja,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      marginLeft: '.2rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {carrito.length > 0 && (
          <div
            style={{
              padding: '1.2rem 1.4rem',
              borderTop: `1px solid ${C.gris}`,
              background: C.gris,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: C.vino,
                }}
              >
                Total
              </span>

              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: C.naranja,
                }}
              >
                {formatARS(totalCarrito)}
              </span>
            </div>

            <button
              onClick={handleComprar}
              disabled={procesando}
              style={{
                width: '100%',
                padding: '.95rem',
                background: procesando
                  ? C.grisOscuro
                  : C.vino,
                border: 'none',
                borderRadius: 10,
                color: C.white,
                fontWeight: 800,
                fontSize: '.98rem',
                cursor: procesando
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {procesando
                ? 'Redirigiendo...'
                : 'Elegir Medio de Pago'}
            </button>

            <button
              onClick={vaciarCarrito}
              style={{
                width: '100%',
                marginTop: '.55rem',
                padding: '.45rem',
                background: 'transparent',
                border: 'none',
                color: C.grisOscuro,
                fontSize: '.78rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}