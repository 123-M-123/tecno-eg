'use client'

import { useEffect, useState } from 'react'
import Carrusel from './carrusel'
import { useCartStore } from '@/store/useCartStore'

export default function ProductosSection() {
  const [secciones, setSecciones] = useState<any[]>([])
  const openModal = useCartStore((state) => state.openModal)

  useEffect(() => {
    // Traemos los datos de la API Route unificada
    fetch('/api/catalog/header')
      .then(res => res.json())
      .then(data => {
        // Agrupamos productos por categoría para los carruseles independientes
        const agrupados: Record<string, any[]> = {}
        
        data.products.forEach((p: any) => {
          if (!agrupados[p.categoria]) agrupados[p.categoria] = []
          agrupados[p.categoria].push(p)
        })

        const seccionesFormateadas = Object.keys(agrupados).map(catName => ({
          titulo: catName,
          productos: agrupados[catName]
        }))

        setSecciones(seccionesFormateadas)
      })
      .catch(e => console.error("Error al cargar productos", e))
  }, [])

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '1rem' }}>
      {secciones.map((seccion) => (
        <Carrusel 
          key={seccion.titulo}
          titulo={seccion.titulo}
          productos={seccion.productos}
          // Usamos la nueva acción de Zustand para abrir el modal con el listado y el índice
          onVerProducto={(prod) => {
            const index = seccion.productos.findIndex((item: any) => item.id === prod.id)
            openModal(prod, seccion.productos, index)
          }}
        />
      ))}
    </div>
  )
}