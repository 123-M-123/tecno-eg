'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu, X, ChevronDown, ChevronUp, Monitor, Home, Truck, Phone, ShoppingBag, Search
} from 'lucide-react'

// IMPORTACIÓN DE STORES (ZUSTAND)
import { useCartStore } from '@/store/useCartStore'
import { useConfigStore } from '@/store/useConfigStore'

/* =========================================
   COMPONENTES AUXILIARES
========================================= */

const IconCarrito = ({ size = 34 }: { size?: number }) => {
  const items = useCartStore((state) => state.items);
  // Calculamos cantidad total de unidades
  const cantidad = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {cantidad > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5,
          background: 'var(--color-medio-2)', // Naranja del Excel
          color: '#fff', borderRadius: '50%', width: 20, height: 20,
          fontSize: '0.75rem', fontWeight: 900, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          {cantidad}
        </span>
      )}
    </div>
  );
}

/* =========================================
   HEADER PRINCIPAL
========================================= */

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Consumo de Configuración (Blueprint 111)
  const { config } = useConfigStore()
  
  // Consumo de Carrito
  const { items } = useCartStore()

  // Estados de UI
  const [menuOpen, setMenuOpen] = useState(false)
  const [tiendaOpen, setTiendaOpen] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [categorias, setCategorias] = useState<{label: string, slug: string}[]>([])
  const [todosLosProductos, setTodosLosProductos] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. CARGA DINÁMICA DE CATEGORÍAS Y PRODUCTOS
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/catalog/meta') // Debes crear esta ruta API
        const data = await res.json()
        setCategorias(data.categories || [])
        setTodosLosProductos(data.products || [])
      } catch (e) {
        console.error("Error cargando catálogo dinámico:", e)
      }
    }
    loadCatalog()
  }, [])

  // 2. LÓGICA DE BÚSQUEDA
  useEffect(() => {
    if (busqueda.length < 2) {
      setResultados([])
      setDropdownOpen(false)
      return
    }
    const filtrados = todosLosProductos
      .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .slice(0, 6)
    setResultados(filtrados)
    setDropdownOpen(true)
  }, [busqueda, todosLosProductos])

  // 3. NAVEGACIÓN SMART (Home vs Tienda)
  const irA = (id: string, isAnchor: boolean = true) => {
    setMenuOpen(false)
    if (!isAnchor) {
      router.push(id)
      return
    }
    if (pathname !== '/') {
      router.push(`/#${id}`)
    } else {
      const el = document.getElementById(id)
      if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
    }
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0,
        zIndex: Number(config.Z_Index_Header) || 100,
        background: 'var(--color-oscuro-1)',
        opacity: config.Header_Opacity || 1,
        backdropFilter: `blur(${config.Blur_Intensity || 0}px)`,
        boxShadow: `0 4px 20px rgba(0,0,0,${config.Grid_Shadow_Intensity || 0.2})`,
        transition: 'all 0.3s ease'
      }}>
        {/* FILA SUPERIOR: LOGO Y ACCIONES */}
        <div style={topRowStyle}>
          <button onClick={() => setMenuOpen(true)} style={iconBtnStyle}>
            <Menu size={Number(config.Header_Icon_Size) || 32} />
          </button>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Image
              src={config.Logo_URL || "/logo.png"}
              alt={config.Nombre_Corto || "TECNO-EG"}
              width={Number(config.Logo_Size) || 200}
              height={80}
              priority
              style={{ 
                objectFit: 'contain', 
                height: 'auto',
                transform: `translateX(${config.Logo_X_Offset || 0}px)`
              }}
            />
          </div>

          <div onClick={() => router.push('/checkout')} style={{ cursor: 'pointer' }}>
            <IconCarrito size={Number(config.Header_Icon_Size) || 32} />
          </div>
        </div>

        {/* FILA INFERIOR: BUSCADOR DINÁMICO */}
        <div style={searchRowStyle}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 'var(--max-width)' }}>
            <div style={inputContainerStyle}>
              <Search size={18} color="#999" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Busca en la tienda..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* DROPDOWN DE BÚSQUEDA */}
            {dropdownOpen && resultados.length > 0 && (
              <div ref={dropdownRef} style={dropdownStyle}>
                {resultados.map((p) => (
                  <div key={p.id} onClick={() => router.push(`/producto/${p.id}`)} style={resultItemStyle}>
                    <img src={p.imagen} alt="" style={resultImgStyle} />
                    <div style={{ flex: 1 }}>
                      <p style={resultTitleStyle}>{p.nombre}</p>
                      <p style={resultPriceStyle}>$ {p.precio.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* OVERLAY & SIDEBAR (ESCUDO 2) */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={overlayStyle} />}
      
      <aside style={{ 
        ...sidebarStyle, 
        left: menuOpen ? 0 : -340,
        zIndex: Number(config.Z_Index_Modal) || 200
      }}>
        <div style={{ 
          background: 'var(--color-medio-1)', 
          color: '#fff', padding: '1.5rem 1.2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>{config.Nombre_Corto}</h2>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: 0 }}>Menu de Navegación</p>
          </div>
          <X onClick={() => setMenuOpen(false)} style={{ cursor: 'pointer' }} />
        </div>

        <nav style={{ padding: '1rem' }}>
          <button onClick={() => irA('inicio')} style={navItemStyle}><Home size={18}/> Inicio</button>
          <button onClick={() => irA('quienes')} style={navItemStyle}><ShoppingBag size={18}/> Quiénes Somos</button>
          <button onClick={() => irA('/acceso-remoto', false)} style={navItemStyle}><Monitor size={18}/> Soporte Remoto</button>
          
          <div style={categoryDividerStyle}>
            <p style={categoryLabelStyle}>CATEGORÍAS</p>
            <button 
              onClick={() => setTiendaOpen(!tiendaOpen)} 
              style={{ ...navItemStyle, borderBottom: '1px solid #f0f0f0' }}
            >
              Ver Todo el Catálogo {tiendaOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            
            {tiendaOpen && (
              <div style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
                {categorias.map(cat => (
                  <button 
                    key={cat.slug} 
                    onClick={() => { setMenuOpen(false); router.push(`/#${cat.slug}`); }} 
                    style={{ ...navItemStyle, fontSize: '0.9rem', padding: '0.7rem' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => irA('contacto')} style={navItemStyle}><Phone size={18}/> Contacto</button>
        </nav>
      </aside>
    </>
  )
}

/* =========================================
   ESTILOS DINÁMICOS (SISTEMA DE VARIABLES)
========================================= */

const topRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.7rem 1.2rem', maxWidth: 'var(--max-width)', margin: '0 auto'
}

const searchRowStyle: React.CSSProperties = {
  padding: '0 1.2rem 0.8rem', display: 'flex', justifyContent: 'center'
}

const inputContainerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.8rem',
  background: '#fff', padding: '0.6rem 1.2rem',
  borderRadius: 'var(--radius-ui)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: 'none', outline: 'none',
  fontSize: 'var(--font-size-global)', color: '#333'
}

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0
}

const sidebarStyle: React.CSSProperties = {
  position: 'fixed', top: 0, width: 320, height: '100vh',
  background: '#fff', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '10px 0 40px rgba(0,0,0,0.15)', overflowY: 'auto'
}

const navItemStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
  padding: '0.9rem 1rem', border: 'none', background: 'transparent',
  fontWeight: 700, cursor: 'pointer', textAlign: 'left',
  borderRadius: 'var(--radius-ui)', color: 'var(--color-oscuro-1)',
  transition: 'all 0.2s'
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
  zIndex: 150, backdropFilter: 'blur(4px)'
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '110%', width: '100%', background: '#fff',
  borderRadius: 'var(--radius-ui)', boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
  overflow: 'hidden', zIndex: 300
}

const resultItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem',
  borderBottom: '1px solid #f0f0f0', cursor: 'pointer'
}

const resultImgStyle: React.CSSProperties = {
  width: 45, height: 45, objectFit: 'contain', borderRadius: 8, background: '#f9f9f9'
}

const resultTitleStyle: React.CSSProperties = {
  fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#111'
}

const resultPriceStyle: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 800, margin: 0, color: 'var(--color-medio-2)'
}

const categoryDividerStyle: React.CSSProperties = {
  margin: '1.2rem 0', paddingTop: '1.2rem', borderTop: '1px solid #eee'
}

const categoryLabelStyle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 900, color: '#999', 
  letterSpacing: '1.5px', marginBottom: '0.5rem', paddingLeft: '1rem'
}