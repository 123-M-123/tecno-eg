import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceso Remoto Particular | Tecno EG - Soluciones IT',
  description: 'Solucionamos tus problemas técnicos de forma remota. Soporte especializado, configuración de redes y asistencia inmediata de Tecno EG.',
  keywords: ['acceso remoto', 'soporte técnico', 'Tecno EG', 'asistencia técnica remota', 'computación'],
  
  // Open Graph (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: 'Acceso Remoto Particular | Solución Técnica Inmediata',
    description: '¿Problemas con tu PC o Red? Tecno EG lo soluciona de forma remota. ¡Contactanos!',
    url: 'https://tecno-eg.com.ar/acceso-remoto',
    siteName: 'Tecno EG',
    images: [
      {
        url: '/preview-acceso.jpg', // Ruta corregida según tu archivo en public/
        width: 1200,
        height: 1150,
        alt: 'Soporte Técnico Acceso Remoto Tecno EG',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },

  // Twitter (X)
  twitter: {
    card: 'summary_large_image',
    title: 'Acceso Remoto Particular | Tecno EG',
    description: 'Solución a tus problemas técnicos ahora. Soporte remoto profesional.',
    images: ['/preview-acceso.jpg'], // Ruta corregida
  },

  // Metadata Adicional y Robots
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://tecno-eg.com.ar/acceso-remoto',
  }
};

export default function AccesoRemotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}