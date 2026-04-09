'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useCarrito } from '../context/CarritoContext'
import { C } from '@/styles/colores'

const IconCarrito = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

const NAV_LINKS = [
  { label: 'Inicio',      id: 'inicio'    },
  { label: 'Novedades',   id: 'novedades' },
  { label: 'Bolsos',      id: 'bolsos'    },
  { label: 'Bazar',       id: 'bazar'     },
  { label: 'Cuencos',     id: 'cuencos'   },
  { label: 'Decoración',  id: 'deco'      },
  { label: 'Cerámica',    id: 'ceramica'  },
  { label: 'Envíos',      id: 'envios'    },
]

function handleNavClick(e: React.MouseEvent, id: string) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top: y, behavior: 'smooth' })
}

import { Producto } from '../context/CarritoContext'

type SeccionJSON = {
  id: string
  productos: Producto[]
}
const formatARS = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function Header() {
  const { carrito, setCarritoOpen, setModal } = useCarrito()
  const cantidadCarrito = carrito.reduce((s, i) => s + i.cantidad, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Producto[]>([])
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cargar productos al montar
  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => {
        const todos = data.secciones.flatMap((s: SeccionJSON) => s.productos)
        setTodosLosProductos(todos)
      })
  }, [])

  // Buscar mientras escribe
  useEffect(() => {
    if (busqueda.length < 3) {
      setResultados([])
      setDropdownOpen(false)
      return
    }
    const filtrados = todosLosProductos.filter(p =>
      p.titulo.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 8)
    setResultados(filtrados)
    setDropdownOpen(true)
  }, [busqueda, todosLosProductos])

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const abrirDesdeSearch = (p: Producto) => {
    setModal({ ...p, categoria: p.categoria || '', etiqueta: p.etiqueta || '', descripcion: p.descripcion || p.titulo })
    setBusqueda('')
    setDropdownOpen(false)
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: C.grisOscuro,
      boxShadow: '0 5px 18px rgba(0,0,0,0.25)',
    }}>

      {/* FILA 1 — Redes | Logo | Carrito */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 1.25rem', maxWidth: 1200, margin: '0 auto',
      }}>

        {/* Instagram */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="https://www.instagram.com/tecnoeg" target="_blank" rel="noopener noreferrer"
            style={{ color: C.white, display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
            </svg>
          </a>
        </div>

        {/* Logo */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo.png" alt="TECNO EG" width={210} height={84} priority
            style={{ objectFit: 'contain', height: 'auto', maxHeight: 84 }} />
        </div>

        {/* Carrito */}
        <button onClick={() => setCarritoOpen(true)} style={{
          position: 'relative', background: 'transparent', border: 'none',
          color: C.white, cursor: 'pointer', padding: '0.4rem',
          display: 'flex', alignItems: 'center',
        }}>
          <IconCarrito size={40} />
          {cantidadCarrito > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: C.naranja, color: C.white,
              borderRadius: '50%', width: 18, height: 18,
              fontSize: '0.7rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cantidadCarrito}</span>
          )}
        </button>
      </div>

      {/* FILA 2 — Buscador */}
      <div style={{
        padding: '0.4rem 1.25rem', maxWidth: 1200, margin: '0 auto',
        borderTop: `1px solid rgba(255,255,255,0.1)`,
      }}>
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: C.grisOscuro, pointerEvents: 'none', fontSize: '0.9rem',
          }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              borderRadius: 20, border: 'none', outline: 'none',
              background: 'rgba(230,230,230,0.89)', color: C.vino,
              fontSize: '0.85rem',
            }}
          />

          {/* Dropdown resultados */}
          {dropdownOpen && resultados.length > 0 && (
            <div ref={dropdownRef} style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: C.white, borderRadius: 12, zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}>
              {resultados.map(p => (
                <div
                  key={p.id_producto}
                  onClick={() => abrirDesdeSearch(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', cursor: 'pointer',
                    borderBottom: `1px solid ${C.crema}`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.crema)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.white)}
                >
                  {/* Foto */}
                  <div style={{ position: 'relative', width: 44, height: 44,
                    borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    filter: p.stock === 0 ? 'grayscale(80%)' : 'none',
                  }}>
                    <Image src={p.imagen} alt={p.titulo} fill
                      sizes="44px" style={{ objectFit: 'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600,
                      color: C.vino, whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{p.titulo}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: C.naranja }}>
                        {formatARS(p.precio)}
                      </span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                        borderRadius: 6, background: p.stock === 0 ? '#cc0000' : '#2d9c4a',
                        color: C.white,
                      }}>
                        {p.stock === 0 ? 'Sin stock' : 'Disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {dropdownOpen && busqueda.length >= 3 && resultados.length === 0 && (
            <div ref={dropdownRef} style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: C.white, borderRadius: 12, zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              padding: '1rem', textAlign: 'center',
              color: C.grisOscuro, fontSize: '0.85rem',
            }}>
              No se encontraron productos para "{busqueda}"
            </div>
          )}
        </div>
      </div>

      {/* FILA 3 — Navegación */}
<nav style={{
  borderTop: `1px solid rgba(255,255,255,0.1)`,
  padding: '0 1.25rem', maxWidth: 1200, margin: '0 auto',
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}>
    
    {/* Hamburguesa */}
    <button onClick={() => setMenuOpen(!menuOpen)} style={{
      background: 'transparent', border: 'none', color: C.vino,
      cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem 0.5rem',
    }} aria-expanded={menuOpen}>
      {menuOpen ? '✕' : '☰'}
    </button>

    {/* Links — solo visibles si menuOpen */}
    {menuOpen && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {NAV_LINKS.map(link => (
          <a key={link.id} href={`#${link.id}`}
            onClick={(e) => {
              handleNavClick(e, link.id)
            
            }}
            style={{
              color: C.vino, textDecoration: 'none',
              fontSize: '0.8rem', fontWeight: 600,
              padding: '0.25rem 0.6rem', borderRadius: 12,
              transition: 'all 0.2s', letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.background = C.naranja
              ;(e.target as HTMLElement).style.color = C.white
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.background = 'transparent'
              ;(e.target as HTMLElement).style.color = C.vino
            }}
          >{link.label}</a>
        ))}
      </div>
    )}
  </div>
</nav>
    </header>
  )
}