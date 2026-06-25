'use client'

import { useCartStore } from '@/store/useCartStore'
import { useRouter } from 'next/navigation'
import { X, Trash2, ArrowRight } from 'lucide-react'

export default function CarritoPanel() {
  const router = useRouter()
  // 1. Conectamos al Store de Zustand
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()

  // Nota: Deberías manejar si el panel está abierto/cerrado con un estado global.
  // Por ahora lo dejamos visible si hay elementos o como estado simple.
  const [isOpen, setIsOpen] = [true, () => {}] // Ajustable según tu diseño visual

  const total = getTotal()
  const formatARS = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

  if (items.length === 0) return null;

  return (
    <div style={panelContainer}>
      <div style={headerStyle}>
        <span style={{ fontWeight: 900 }}>Tu Carrito</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      <div style={listStyle}>
        {items.map((item) => (
          <div key={item.id} style={itemStyle}>
            <img src={item.imagen} alt="" style={imgStyle} />
            <div style={{ flex: 1 }}>
              <p style={titleStyle}>{item.nombre}</p>
              <p style={priceStyle}>{formatARS(item.precio)}</p>
              
              <div style={actionsStyle}>
                <div style={qtySelector}>
                  <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} style={qtyBtn}>-</button>
                  <span style={{ fontWeight: 700 }}>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} style={qtyBtn}>+</button>
                </div>
                <button onClick={() => removeItem(item.id)} style={deleteBtn}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={footerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 800 }}>
          <span>Total:</span>
          <span>{formatARS(total)}</span>
        </div>
        <button onClick={() => router.push('/checkout')} style={checkoutBtn}>
          INICIAR PAGO <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}

const arrowBtn: React.CSSProperties = { display: 'none' } // Aux
const ArrowRightIcon = () => <ArrowRight size={18} />

// ESTILOS
const panelContainer: React.CSSProperties = { position: 'fixed', right: 0, top: 0, width: 360, maxWidth: '100%', height: '100vh', background: '#fff', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', zIndex: 900, display: 'flex', flexDirection: 'column' }
const headerStyle: React.CSSProperties = { padding: '1.2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const listStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '1rem' }
const itemStyle: React.CSSProperties = { display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #f9f9f9', paddingBottom: '1rem' }
const imgStyle: React.CSSProperties = { width: 60, height: 60, objectFit: 'contain', background: '#f9f9f9', borderRadius: 8 }
const titleStyle: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.2rem' }
const priceStyle: React.CSSProperties = { fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-medio-2)', margin: 0 }
const actionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }
const qtySelector: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f5f5f5', borderRadius: 8, padding: '2px 8px' }
const qtyBtn: React.CSSProperties = { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 800 }
const deleteBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer' }
const footerStyle: React.CSSProperties = { padding: '1.5rem', borderTop: '1px solid #eee', background: '#fafafa' }
const checkoutBtn: React.CSSProperties = { width: '100%', padding: '1rem', background: 'var(--color-medio-1)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }