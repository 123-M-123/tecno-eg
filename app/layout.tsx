import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TECNO EG — Tecnología a otro Nivel",
  description:
    "Service, Armado y Mantenimiento de PC. Ventas de Componentes Electronicos. Asesoramiento Personalizado.",
  generator: "Tecno EG",
  metadataBase: new URL("https://tecno-eg.vercel.app"),

  keywords: [
    "pc gamer",
    "armado de pc",
    "reparación pc",
    "hardware argentina",
    "tecnología",
  ],

  // 🔵 FACEBOOK / WHATSAPP PREVIEW
  openGraph: {
    title: "TECNO EG — Tecnología a otro Nivel",
    description:
      "Service, Armado y Mantenimiento de PC. Ventas de Componentes Electronicos. Asesoramiento Personalizado.",
    url: "https://tecno-eg.vercel.app",
    siteName: "Tecno EG",
    images: [
      {
        url: "/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Tecno EG",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  // 🔵 TWITTER
  twitter: {
    card: "summary_large_image",
    title: "TECNO EG — Tecnología a otro Nivel",
    description:
      "Service, Armado y Mantenimiento de PC. Ventas de Componentes Electronicos.",
    images: ["/preview.jpg"],
  },

  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },

  manifest: "/manifest.json",
  themeColor: "#000000",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tecno EG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" translate="no">
      <head>
        {/* 🔥 MANIFEST */}
        <link rel="manifest" href="/manifest.json" />

        {/* 🔥 THEME */}
        <meta name="theme-color" content="#000000" />

        {/* 🔥 APPLE */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="Tecno EG"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* 🔥 GOOGLE SEARCH CONSOLE */}
        <meta
          name="google-site-verification"
          content="c43EWcKPaKQuTZ0w9M0U0iLPzJEgoEQmVTxKVhzfn8I"
        />

        {/* 🔥 GOOGLE ANALYTICS (G4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2BM207D9R8"
          strategy="afterInteractive"
        />
        <Script id="gtag-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2BM207D9R8');
          `}
        </Script>
      </head>

      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}