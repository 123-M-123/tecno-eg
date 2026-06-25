'use client'

import Header from '../components/Header'
import ProductosSection from '../components/ProductosSection'
import CarritoPanel from '../components/CarritoPanel'
import ModalImagen from '../components/ModalImagen'
import EnviosSection from '../components/EnviosSection'
import Footer from '../components/Footer'
import ConfigStyles from '@/components/ConfigStyles'
import { Truck, MapPin, Wallet, PackageCheck } from 'lucide-react'

export default function TiendaPage() {
  return (
    <div suppressHydrationWarning className="app-content">
      <ConfigStyles />
      <Header />
      <section style={{ padding: '3rem 1rem', textAlign: 'center', background: '#fff' }}>
        <h1 style={{ fontWeight: 900, fontSize: '2.5rem', color: 'var(--color-medio-1)' }}>Equipos y Componentes</h1>
        <p>Catálogo completo sincronizado en tiempo real.</p>
      </section>
      
      <ProductosSection />
      
      <section id="envios"><EnviosSection /></section>

      <CarritoPanel />
      <ModalImagen />
      <Footer />
    </div>
  )
}