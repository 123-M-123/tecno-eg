'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Monitor,
  Laptop,
  Cpu,
  Keyboard,
  Router,
  Cable,
  HardDrive,
  Truck,
  Phone,
  ShoppingBag,
} from 'lucide-react'

import { useCarrito } from '../context/CarritoContext'
import { C } from '@/styles/colores'
import { Producto } from '../context/CarritoContext'

/* =========================================
   ICONO CARRITO (NO TOCADO)
========================================= */
const IconCarrito = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

/* =========================================
   LINKS PRINCIPALES
========================================= */
const LINKS_PRINCIPALES = [
  { label: 'Inicio', id: 'inicio', icon: Home },
  { label: 'Quiénes Somos', id: 'quienes', icon: Home },
  { label: 'Contacto', id: 'contacto', icon: Phone },
]

/* =========================================
   LINKS TIENDA
========================================= */
const LINKS_TIENDA = [
  { label: 'Notebooks', id: 'notebooks', icon: Laptop },
  { label: 'Monitores', id: 'monitores', icon: Monitor },
  { label: 'PCs Armadas', id: 'pc', icon: Cpu },
  { label: 'Componentes', id: 'componentes', icon: Cpu },
  { label: 'Periféricos', id: 'perifericos', icon: Keyboard },
  { label: 'Almacenamiento', id: 'almacenamiento', icon: HardDrive },
  { label: 'Gabinetes y Fuentes', id: 'gabinetes', icon: Cpu },
  { label: 'Redes y Conectividad', id: 'redes', icon: Router },
  { label: 'Cables y Adaptadores', id: 'cables', icon: Cable },
]

type SeccionJSON = {
  id: string
  productos: Producto[]
}

const formatARS = (n: number) =>
  n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  const y = el.getBoundingClientRect().top + window.scrollY - 90

  window.scrollTo({
    top: y,
    behavior: 'smooth',
  })
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const { carrito, setCarritoOpen, setModal } = useCarrito()

  const cantidadCarrito = carrito.reduce((s, i) => s + i.cantidad, 0)

  const [menuOpen, setMenuOpen] = useState(false)
  const [tiendaOpen, setTiendaOpen] = useState(true)

  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Producto[]>([])
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /* ===============================
     CARGA PRODUCTOS
  =============================== */
  useEffect(() => {
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data) => {
        const todos = data.secciones.flatMap((s: SeccionJSON) => s.productos)
        setTodosLosProductos(todos)
      })
  }, [])

  /* ===============================
     BUSCADOR
  =============================== */
  useEffect(() => {
    if (busqueda.length < 3) {
      setResultados([])
      setDropdownOpen(false)
      return
    }

    const filtrados = todosLosProductos
      .filter((p) =>
        p.titulo.toLowerCase().includes(busqueda.toLowerCase())
      )
      .slice(0, 8)

    setResultados(filtrados)
    setDropdownOpen(true)
  }, [busqueda, todosLosProductos])

  /* ===============================
     CLICK AFUERA
  =============================== */
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

    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ===============================
     BLOQUEAR SCROLL MENU
  =============================== */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto'
  }, [menuOpen])

  const abrirDesdeSearch = (p: Producto) => {
    setModal({
      ...p,
      categoria: p.categoria || '',
      etiqueta: p.etiqueta || '',
      descripcion: p.descripcion || p.titulo,
    })

    setBusqueda('')
    setDropdownOpen(false)
  }

  /* =================================
     NAVEGACION HOME / TIENDA
  ================================= */
  const irA = (id: string) => {
  setMenuOpen(false)

  const idsHome = ['inicio', 'quienes', 'contacto']
  const estoyEnHome = pathname === '/'
  const estoyEnTienda = pathname === '/tienda'

  /* HOME */
  if (idsHome.includes(id)) {
    if (estoyEnHome) {
      scrollToId(id)
    } else {
      router.push(`/#${id}`)
    }
    return
  }

  /* TIENDA */
  if (estoyEnTienda) {
    scrollToId(id)
  } else {
    router.push(`/tienda#${id}`)
  }
}

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: C.grisOscuro,
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* FILA SUPERIOR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 1rem',
            maxWidth: 1200,
            margin: '0 auto',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.white,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={34} />
          </button>

          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/logo.png"
              alt="TECNO EG"
              width={210}
              height={84}
              priority
              style={{
                objectFit: 'contain',
                height: 'auto',
                maxHeight: 82,
              }}
            />
          </div>

          <button
            onClick={() => setCarritoOpen(true)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: C.white,
              cursor: 'pointer',
              padding: '0.3rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconCarrito size={38} />

            {cantidadCarrito > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  background: C.naranja,
                  color: C.white,
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cantidadCarrito}
              </span>
            )}
          </button>
        </div>

        {/* BUSCADOR */}
        <div
          style={{
            padding: '0 1rem 0.7rem',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 500,
              margin: '0 auto',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: 999,
                border: 'none',
                outline: 'none',
                background: '#ffffff',
                color: C.negro,
                fontSize: '0.95rem',
              }}
            />

            {dropdownOpen && resultados.length > 0 && (
  <div
    ref={dropdownRef}
    style={{
      position: 'absolute',
      top: '110%',
      left: 0,
      right: 0,
      background: '#fff',
      borderRadius: 14,
      overflow: 'hidden',
      zIndex: 200,
      boxShadow: '0 14px 24px rgba(0,0,0,0.18)',
      maxHeight: 420,
      overflowY: 'auto',
    }}
  >
    {resultados.map((p) => (
      <div
        key={p.id_producto}
        onClick={() => abrirDesdeSearch(p)}
        style={{
          padding: '0.75rem',
          cursor: 'pointer',
          borderBottom: '1px solid #eee',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <img
          src={p.imagen}
          alt={p.titulo}
          style={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            borderRadius: 10,
            background: '#fafafa',
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: C.vino,
              lineHeight: 1.25,
            }}
          >
            {p.titulo}
          </div>

          <div
            style={{
              fontSize: '0.82rem',
              color: C.naranja,
              marginTop: 4,
              fontWeight: 800,
            }}
          >
            {formatARS(p.precio)}
          </div>
        </div>
      </div>
    ))}
  </div>
)}
          </div>
        </div>
      </header>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 90,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: menuOpen ? 0 : -340,
          width: 320,
          maxWidth: '88vw',
          height: '100vh',
          background: '#ffffff',
          zIndex: 100,
          transition: 'all 0.28s ease',
          boxShadow: '8px 0 28px rgba(0,0,0,0.18)',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            background: C.vino,
            color: '#fff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>
              TECNO EG
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              Navegación
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={26} />
          </button>
        </div>

        <div style={{ padding: '0.8rem' }}>
          {/* LINKS PRINCIPALES */}
          {LINKS_PRINCIPALES.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                onClick={() => irA(item.id)}
                style={btnMenu}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}

          {/* ACORDEON */}
          <button
            onClick={() => setTiendaOpen(!tiendaOpen)}
            style={{
              ...btnMenu,
              fontWeight: 800,
              marginTop: '0.35rem',
            }}
          >
            <ShoppingBag size={18} />
            Tienda de Componentes

            <span style={{ marginLeft: 'auto' }}>
              {tiendaOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>

          {tiendaOpen && (
            <div style={{ paddingLeft: '0.45rem' }}>
              {LINKS_TIENDA.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    onClick={() => irA(item.id)}
                    style={{
                      ...btnMenu,
                      fontSize: '0.9rem',
                      padding: '0.7rem 0.75rem',
                    }}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* ENVÍOS ABAJO DE TODO */}
          <button
            onClick={() => irA('envios')}
            style={{
              ...btnMenu,
              marginTop: '0.6rem',
            }}
          >
            <Truck size={18} />
            Envíos
          </button>
        </div>
      </aside>
    </>
  )
}

const btnMenu: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.85rem 0.75rem',
  borderRadius: 12,
  cursor: 'pointer',
  color: '#111',
  fontWeight: 700,
  fontSize: '0.95rem',
}