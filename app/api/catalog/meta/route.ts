import { NextResponse } from 'next/server';
import productosData from '@/content/productos.json';

export const revalidate = 3600; // Se actualiza cada 1 hora

/**
 * 🛡️ HELPER: Limpieza de caracteres para XML
 */
function escapeXml(unsafe: string) {
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
    
    // 1. Aplastamos las secciones para tener una lista única de productos
    const allProducts = productosData.secciones.flatMap(seccion => seccion.productos);

    // 2. Construcción del encabezado XML RSS 2.0
    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Tecno-EG - Catálogo de Tecnología</title>
    <link>${baseUrl}</link>
    <description>Notebooks, Monitores y Componentes de PC de alta gama</description>`;

    // 3. Mapeo de productos al formato de Meta
    allProducts.forEach((p) => {
      const title = escapeXml(p.titulo);
      const description = escapeXml(p.descripcion || p.titulo);
      const availability = p.stock > 0 ? 'in stock' : 'out of stock';

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
      <g:price>${p.precio} ARS</g:price>
      <g:google_product_category>Electronics &gt; Computers</g:google_product_category>
      <g:shipping>
        <g:country>AR</g:country>
        <g:service>Standard</g:service>
        <g:price>0 ARS</g:price>
      </shipping>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error: any) {
    console.error("Error generando catálogo XML:", error.message);
    return NextResponse.json({ error: 'Error generating catalog' }, { status: 500 });
  }
}