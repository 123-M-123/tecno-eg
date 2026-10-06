// tecno-eg/lib/googleSheets.ts - BYPASS ULTRA-RÁPIDO A SUPABASE (0% CPU SHEETS)
import { google } from 'googleapis';
import { slugify } from './utils';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const MASTER_ID = process.env.MASTER_PAYMENTS_SHEET_ID;
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID;

// Identificadores de Tecno EG
const GA_ID_TECNO = "534564663";
const EMAIL_VENDEDOR_TECNO = "mguiyemo@gmail.com"; 

/**
 * 🖼️ Helper para miniaturas de Google Drive
 */
function getDriveDirectLink(url: string, version: string = "1") {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://lh3.googleusercontent.com/d/${fileId}=s1000?v=${version}`;
}

/**
 * 💻 PRODUCTOS TECNO EG: Lectura ultrarrápida desde Supabase vía tdt.ar
 */
export async function getProductsFromSheets() {
  try {
    const res = await fetch(`https://tdt.ar/api/test-supa-productos?gaId=${GA_ID_TECNO}`, {
      next: { revalidate: 60 } // 👈 Caché de 60 segundos
    });

    if (!res.ok) {
      console.error("❌ Error consultando productos Tecno EG:", res.status);
      return [];
    }

    const data = await res.json();
    const rawProductos = data.productos || [];

    return rawProductos.map((p: any) => {
      const precioBase = Number(p.precioTransfer || p.precio) || 0;
      const catRaw = p.categoria || "Hardware";
      const catSlug = slugify(catRaw.replace('*', ''));

      return {
        id: p.id?.toString() || "",
        nombre: p.nombre || "",
        precio: precioBase,
        precioTransfer: precioBase,
        precioOferta: p.precioOferta ? Number(p.precioOferta) : null,
        descripcion: p.descripcion || "",
        imagen: p.imagen || "",
        categoria: catRaw.replace('*', '').trim(),
        categoriaSlug: catSlug,
        stock: Number(p.stock) || 0,
      };
    });
  } catch (error: any) {
    console.error("🔥 Error conexión Tecno EG:", error.message);
    return [];
  }
}

/**
 * 🚩 BANNERS TECNO EG: Lectura desde Supabase
 */
export async function getBannersFromSheets() {
  try {
    const res = await fetch(`https://tdt.ar/api/tienda/banners?vendedor=${EMAIL_VENDEDOR_TECNO}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    
    return (data.banners || []).map((b: any) => ({
      imagen: b.imagen,
      ubicacion: b.ubicacion,
      linkDestino: b.linkDestino && b.linkDestino !== "#" ? b.linkDestino : null,
      version: b.version || "1",
    }));
  } catch (error) {
    return [];
  }
}

/**
 * 📂 CATEGORÍAS TECNO EG
 */
export async function getCategoriesFromSheets() {
  const products = await getProductsFromSheets();
  const uniqueMap = new Map();

  products.forEach((p: any) => {
    if (!uniqueMap.has(p.categoriaSlug)) {
      uniqueMap.set(p.categoriaSlug, { label: p.categoria, slug: p.categoriaSlug });
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * 💳 REGISTRO DE PAGOS EN MASTER
 */
export async function savePaymentToMaster(paymentData: any[]) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_ID,
      range: "'webhoock MP'!A:J",
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [paymentData] },
    });
    return { success: true };
  } catch (error: any) { 
    throw error; 
  }
}