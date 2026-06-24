// lib/googleSheets.ts - ADAPTADO PARA TECNO-EG
import { google } from 'googleapis';

// Función utilitaria para slugify (incluila aquí o importala)
const slugify = (text: string) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const MASTER_ID = '16NcgTQ5N30wO7gywNh3JLjdMe676z5j4m3kIQ_PxT7w'; 
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID; 

// IMPORTANTE: El email que usa el scraper debe estar acá
const SOCIOS_AUTORIZADOS = ["tecnoeg@gmail.com", "tiendadtiendas@gmail.com"];

function getDriveDirectLink(url: string, version: string = "1") {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://lh3.googleusercontent.com/d/${fileId}=s1000?v=${version}`;
}

export async function getProductsFromSheets() {
  try {
    const range = "'Carga de productos'!A2:O"; 
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: CLIENT_ID, range });
    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase()))
      .map((row: any) => {
        const precioTransfer = Number(row[3]) || 0;
        const catRaw = row[6]?.toString().trim() || "General";
        const catSlug = slugify(catRaw);
        
        // LÓGICA TECNO-EG: 10% de descuento sobre el precio de lista
        // precioTransfer es el valor del excel, el precio de lista es / 0.9
        const precioLista = Math.round(precioTransfer / 0.9);

        const principal = row[5]?.includes('drive.google.com') 
          ? getDriveDirectLink(row[5], "1") 
          : row[5]; // Si es URL directa (como la del scraper), se deja así.

        const extras = [row[10], row[11], row[12], row[13], row[14]]
          .filter(url => url)
          .map(url => url.includes("drive.google.com") ? getDriveDirectLink(url, "1") : url);

        return {
          id: row[1]?.toString() || "",
          nombre: row[2]?.toString() || "",
          precio: precioLista,
          precioTransfer: precioTransfer,
          descripcion: row[4] || "",
          imagen: principal,
          galeria: [principal, ...extras].filter(Boolean),
          categoria: catRaw,
          categoriaSlug: catSlug,
          tipo: 'tecnologia', // En Tecno EG no diferenciamos indumentaria/accesorios
          stock: Number(row[7]) || 0,
          talles: row[8] || "",
          colores: row[9] || "",
        };
      });
  } catch (error: any) {
    console.error("❌ Error en getProductsFromSheets:", error.message);
    return [];
  }
}

export async function getBannersFromSheets() {
  try {
    const range = "'Baners Publicidad'!A2:E";
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: MASTER_ID, range });
    const rows = response.data.values;
    if (!rows) return [];

    return rows
      .filter((row: any) => {
        const emailEnFila = row[0]?.toString().trim().toLowerCase();
        return emailEnFila && SOCIOS_AUTORIZADOS.includes(emailEnFila);
      })
      .map((row: any) => {
        const urlOriginal = row[1] || "";
        const version = row[4] || "1";
        return {
          imagen: getDriveDirectLink(urlOriginal, version),
          ubicacion: row[2]?.toString().toLowerCase().trim() || "",
          linkDestino: row[3] || null
        };
      });
  } catch (error: any) { 
    console.error("❌ Error en getBannersFromSheets:", error.message);
    return []; 
  }
}

export async function getCategoriesFromSheets() {
  const products = await getProductsFromSheets();
  const uniqueMap = new Map();
  products.forEach(p => {
    if (!uniqueMap.has(p.categoriaSlug)) {
      uniqueMap.set(p.categoriaSlug, { label: p.categoria, slug: p.categoriaSlug, tipo: p.tipo });
    }
  });
  return Array.from(uniqueMap.values());
}

export async function savePaymentToMaster(paymentData: any[]) {
  try {
    const targetRange = 'webhoock MP!A:J'; // Cambiado a tu pestaña específica
    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_ID,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [paymentData] },
    });
    return { success: true };
  } catch (error: any) { 
    console.error("❌ Error escribiendo en Master Sheet:", error.message);
    throw error; 
  }
}