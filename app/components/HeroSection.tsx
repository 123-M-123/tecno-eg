'use client'

import { useState } from 'react'
import Link from 'next/link'
import { C } from '@/styles/colores'
import {
  Wrench,
  ShoppingCart,
  Headset,
  ShieldCheck,
  Cpu,
  Truck,
  MessageCircle,
  Instagram,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BadgeCheck,
  Wifi,
  Camera,
} from 'lucide-react'

export default function HeroSection() {
  const [open, setOpen] = useState(true)

  const heroServicios = [
    { icon: Wrench, text: 'Servicio técnico especializado' },
    { icon: Cpu, text: 'Armado de PC a medida' },
    { icon: Headset, text: 'Asesoramiento real' },
  ]

  const servicios = [
    {
      icon: Wrench,
      titulo: 'Reparación PC / Notebook',
      texto: 'Diagnóstico, limpieza, formateo y reparación general.',
    },
    {
      icon: Cpu,
      titulo: 'Armado de Equipos',
      texto: 'PC gamer, oficina y uso profesional.',
    },
    {
      icon: Wifi,
      titulo: 'Redes y Conectividad',
      texto: 'WiFi, routers, cableado e instalación.',
    },
    {
      icon: Camera,
      titulo: 'Cámaras y Seguridad',
      texto: 'Instalación y configuración profesional.',
    },
  ]

  const ventajas = [
    'Más de 35 años de trayectoria',
    'Atención personalizada',
    'Precios competitivos',
    'Soluciones reales',
  ]

  return (
    <>
      {/* HERO */}
      <section
        id="inicio"
        style={{
          background: C.gris,
          padding: '3.2rem 1.2rem 3rem',
          textAlign: 'center',
          borderBottom: `3px solid ${C.naranjaPale}`,
        }}
      >
        <div style={{ maxWidth: 950, margin: '0 auto' }}>
          <h1
            style={{
              margin: 0,
              color: C.vino,
              fontWeight: 900,
              fontSize: 'clamp(2rem,6vw,3.5rem)',
              lineHeight: 1.05,
            }}
          >
            TECNO EG
          </h1>

          <p
            style={{
              margin: '.45rem 0 0',
              color: C.grisOscuro,
              fontWeight: 800,
              fontSize: 'clamp(1rem,2vw,1.2rem)',
            }}
          >
            Tecnología a otro Nivel
          </p>

          <p
            style={{
              margin: '1rem auto 0',
              maxWidth: 760,
              color: '#111',
              lineHeight: 1.65,
            }}
          >
            Más de 35 años brindando soluciones reales en informática,
            reparación de equipos, armado de PC, redes y venta de tecnología.
          </p>

          {/* BOTONES */}
          <div
            style={{
              marginTop: '1.8rem',
              display: 'flex',
              gap: '.8rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://wa.me/5491158081432"
              target="_blank"
              rel="noopener noreferrer"
              style={btnGreen}
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <Link href="/tienda" style={btnOrange}>
              Ir a la Tienda
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* MINI SERVICIOS */}
        <div
          style={{
            marginTop: '2.2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: '.9rem',
            maxWidth: 980,
            marginInline: 'auto',
          }}
        >
          {heroServicios.map((item, i) => {
            const Icon = item.icon

            return (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '1rem',
                  boxShadow: '0 10px 24px rgba(0,0,0,.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.7rem',
                }}
              >
                <Icon size={22} color={C.vino} />
                <span style={{ fontWeight: 700 }}>{item.text}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* QUIENES SOMOS */}
      <section
        id="quienes"
        style={{
          background: '#ffffff',
          padding: '4rem 1.2rem',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '.55rem',
              border: `2px solid ${C.vino}`,
              background: '#fff',
              color: C.vino,
              padding: '.85rem 1.3rem',
              borderRadius: 999,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            QUIÉNES SOMOS
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {open && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
                gap: '1rem',
              }}
            >
              <div style={box}>
                <h3 style={title}>Nuestra Historia</h3>
                <p style={text}>
                  Empresa dedicada a brindar soluciones tecnológicas reales.
                  Trayectoria, experiencia y atención personalizada.
                </p>
              </div>

              <div style={box}>
                <h3 style={title}>Qué Hacemos</h3>
                <p style={text}>
                  Servicio técnico, upgrades, redes, cámaras,
                  armado de PC y venta de componentes seleccionados.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SERVICIOS RESTAURADOS */}
      <section
        style={{
          background: '#fff',
          padding: '0 1.2rem 4rem',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              color: C.vino,
              marginBottom: '2rem',
              fontSize: '2rem',
            }}
          >
            Servicios Especializados
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: '1rem',
            }}
          >
            {servicios.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.titulo} style={box}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: C.gris,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={24} color={C.vino} />
                  </div>

                  <h3 style={title}>{item.titulo}</h3>
                  <p style={text}>{item.texto}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        style={{
          background: C.gris,
          padding: '4rem 1.2rem',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: '1rem',
          }}
        >
          <div style={boxWhite}>
            <h2 style={title}>Contacto</h2>

            <div
              style={{
                display: 'flex',
                gap: '.7rem',
                flexWrap: 'wrap',
                marginTop: '1rem',
              }}
            >
              <a
                href="https://wa.me/5491158081432"
                target="_blank"
                rel="noopener noreferrer"
                style={btnGreen}
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>

              <a
                href="https://instagram.com/tecnoeg"
                target="_blank"
                rel="noopener noreferrer"
                style={btnDark}
              >
                <Instagram size={18} />
                Instagram
              </a>
            </div>
          </div>

          <div style={boxWhite}>
            <h2 style={title}>¿Por qué elegirnos?</h2>

            <div
              style={{
                display: 'grid',
                gap: '.75rem',
                marginTop: '1rem',
              }}
            >
              {ventajas.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.55rem',
                  }}
                >
                  <BadgeCheck size={18} color={C.naranja} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const box = {
  background: '#fafafa',
  border: '1px solid #ececec',
  borderRadius: 18,
  padding: '1.4rem',
}

const boxWhite = {
  background: '#fff',
  borderRadius: 20,
  padding: '1.5rem',
  boxShadow: '0 12px 28px rgba(0,0,0,.06)',
}

const title = {
  marginTop: 0,
  color: '#4b1f1f',
}

const text = {
  margin: 0,
  color: '#333',
  lineHeight: 1.7,
}

const btnGreen = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '.55rem',
  background: '#25D366',
  color: '#fff',
  padding: '.85rem 1.2rem',
  borderRadius: 999,
  textDecoration: 'none',
  fontWeight: 800,
}

const btnOrange = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '.55rem',
  background: '#e67e22',
  color: '#fff',
  padding: '.85rem 1.2rem',
  borderRadius: 999,
  textDecoration: 'none',
  fontWeight: 800,
}

const btnDark = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '.55rem',
  background: '#111',
  color: '#fff',
  padding: '.85rem 1.2rem',
  borderRadius: 999,
  textDecoration: 'none',
  fontWeight: 800,
}