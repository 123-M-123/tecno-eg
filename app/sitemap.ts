import { MetadataRoute } from "next";

// 🔥 base SEO dinámico
const servicios = [
  "armado-pc",
  "reparacion-pc",
  "mantenimiento-pc",
  "pc-gamer",
];

const ciudades = [
  "caba",
  "buenos-aires",
  "zona-sur",
];

const baseUrl = "https://tecno-eg.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // 🔵 páginas fijas
  const staticPages = [
    "",
    "/contacto",
  ];

  const staticUrls = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  // 🔥 SLUGS AUTOMÁTICOS
  const slugUrls = servicios.flatMap((servicio) =>
    ciudades.map((ciudad) => ({
      url: `${baseUrl}/${servicio}-${ciudad}`,
      lastModified: new Date(),
    }))
  );

  return [...staticUrls, ...slugUrls];
}