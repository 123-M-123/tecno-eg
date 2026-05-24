import { NextResponse } from 'next/server';
import productosData from '@/content/productos.json';

export const revalidate = 3600; // Se actualiza cada 1 hora

/**
 * 🛡️ HELPER: Limpieza de caracteres para XML
 * Meta rechaza el XML si tiene símbolos como &, <, > sueltos.
 */
function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

export async function GET() {
  try {
    const baseUrl = 'https://tecno-eg.vercel.app';
    
    // 1. Unificamos todos los productos de todas las secciones en un solo array
    const allProducts = productosData.secciones.flatMap(seccion => seccion.productos);

    // 2. Encabezado del Feed RSS 2.0 con el namespace de Google (g:)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Tecno-EG - Catálogo Oficial</title>
    <link>${baseUrl}</link>
    <description>Venta de Notebooks, Monitores y Componentes</description>`;

    // 3. Generación de cada ítem
    allProducts.forEach((p) => {
      const title = escapeXml(p.titulo);
      const description = escapeXml(p.descripcion || p.titulo);
      const availability = p.stock > 0 ? 'in stock' : 'out of stock';
      
      // Formateamos el precio (Meta prefiere '1250.00 ARS')
      const precioFormateado = `${p.precio}.00 ARS`;

      xml += `
    <item>
      <g:id>${p.id_producto}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${baseUrl}/producto/${p.id_producto}</g:link>
      <g:image_link>${p.imagen}</g:image_link>
      <g:brand>Tecno-EG</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${precioFormateado}</g:price>
      <g:google_product_category>Electronics &gt; Computers</g:google_product_category>
      <g:shipping>
        <g:country>AR</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ARS</g:price>
      </g:shipping>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    // 4. Retornamos con el Content-Type correcto para que el navegador lo vea como XML
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error: any) {
    console.error("🔥 Error en Catálogo Meta:", error.message);
    return NextResponse.json({ error: 'Fallo al generar el XML' }, { status: 500 });
  }
}