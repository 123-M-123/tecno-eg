'use client'

import Image from 'next/image'
import { useCartStore } from '@/store/useCartStore'
import { useConfigStore } from '@/store/useConfigStore'
import { X, ShoppingCart } from 'lucide-react'

export default function ModalImagen() {
  const { modalOpen, activeProduct, activeIndex, productList, closeModal, navigateModal, addItem } = useCartStore()
  const { config } = useConfigStore()

  if (!modalOpen || !activeProduct) return null

  const hasNext = activeIndex < productList.length - 1
  const hasPrev = activeIndex > 0
  const formatARS = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  
  const precioFinal = activeProduct.precio
  const precioLista = Math.round(precioFinal / 0.9)

  return (
    <div onClick={closeModal} style={overlayStyle}>
      <div onClick={e => e.stopPropagation()} style={modalStyle}>
        
        {/* Navegación */}
        {hasPrev && <button onClick={() => navigateModal('prev')} style={{...arrowBtn, left: 10}}>‹</button>}
        {hasNext && <button onClick={() => navigateModal('next')} style={{...arrowBtn, right: 10}}>›</button>}

        <button onClick={closeModal} style={closeBtn}><X size={20}/></button>

        <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
          <Image src={activeProduct.imagen} alt={activeProduct.nombre} fill style={{ objectFit: 'contain', padding: '20px' }} />
          {productList.length > 1 && <span style={counterTag}>{activeIndex + 1} / {productList.length}</span>}
        </div>

        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-medio-1)' }}>
            {activeProduct.nombre || activeProduct.titulo}
          </h3>
          
          <div style={{ margin: '1rem 0' }}>
            <span style={{ fontSize: '1rem', textDecoration: 'line-through', opacity: 0.5 }}>{formatARS(precioLista)}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-medio-2)' }}>{formatARS(precioFinal)}</span>
               <span style={descTag}>10% OFF</span>
            </div>
          </div>

          <button 
            disabled={activeProduct.stock === 0}
            onClick={() => {
              addItem({
                id: activeProduct.id || activeProduct.id_producto,
                nombre: activeProduct.nombre || activeProduct.titulo,
                precio: activeProduct.precio,
                precioTransfer: activeProduct.precio,
                imagen: activeProduct.imagen,
                cantidad: 1
              });
              closeModal();
            }}
            style={{...addBtn, background: activeProduct.stock === 0 ? '#ccc' : 'var(--color-medio-1)'}}
          >
            <ShoppingCart size={18} /> {activeProduct.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
          </button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }
const modalStyle: React.CSSProperties = { background: '#fff', width: '100%', maxWidth: 450, borderRadius: '20px', position: 'relative', overflow: 'hidden' }
const arrowBtn: React.CSSProperties = { position: 'absolute', top: '40%', zIndex: 10, background: 'var(--color-medio-1)', color: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '5px' }
const closeBtn: React.CSSProperties = { position: 'absolute', top: 15, right: 15, zIndex: 11, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer' }
const counterTag: React.CSSProperties = { position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }
const descTag: React.CSSProperties = { background: 'var(--color-medio-2)', color: '#fff', padding: '2px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800 }
const addBtn: React.CSSProperties = { width: '100%', padding: '1rem', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }