'use client'

import { useEffect, useState } from 'react'
import { useCarrito } from '../context/CarritoContext'
import Carrusel from './carrusel'
import { C } from '@/styles/colores'

import { Producto } from '../context/CarritoContext'

type Seccion = {
  id: string
  nombre: string
  productos: Producto[]
}

export default function ProductosSection() {
  const { setModal } = useCarrito()
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => setSecciones(data.secciones))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: C.grisOscuro }}>
      Cargando productos...
    </div>
  )

  return (
    <main>
      {secciones.map(seccion => (
        <section
          key={seccion.id}
          id={seccion.id}
          style={{
            padding: '2.5rem 1.25rem',
            background: seccion.id === 'novedades' ? C.crema : C.fondo,
            borderBottom: `1px solid ${C.gris}`,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Título de sección */}
            <h2 style={{
              fontSize: '1.3rem', fontWeight: 800,
              color: C.vino, margin: '0 0 1.5rem',
              paddingBottom: '0.5rem',
              borderBottom: `3px solid ${C.naranja}`,
              display: 'inline-block',
            }}>
              {seccion.nombre}
            </h2>

            {/* Carrusel */}
            <Carrusel
              titulo={seccion.nombre}
              productos={seccion.productos}
              onVerProducto={(producto, indice, lista) => {
               setModal(producto)
              }}
            />
          </div>
        </section>
      ))}
    </main>
  )
}