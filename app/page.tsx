'use client'

import { useEffect, useState } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import Footer from './components/Footer'
import CarritoPanel from './components/CarritoPanel'
import ModalImagen from './components/ModalImagen'
import ConfigStyles from '@/components/ConfigStyles'
import ClientHydration from '@/components/ClientHydration'

export default function Home({ config }: any) {
  return (
    <ClientHydration initialConfig={config}>
      <div suppressHydrationWarning className="app-content">
        <ConfigStyles />
        <Header />
        <HeroSection />
        <CarritoPanel />
        <ModalImagen />
        <Footer />
      </div>
    </ClientHydration>
  )
}