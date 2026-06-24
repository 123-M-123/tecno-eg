// lib/googleSheets.ts - REFACTORIZACIÓN FINAL PARA TECNO-EG
import { google } from 'googleapis';

const slugify = (text: string) => 
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// IDs DE PLANILLAS
const MASTER_ID = '16NcgTQ5N30wO7gywNh3JLjdMe676z5j4m3kIQ_PxT7w'; 
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID; 

// CONFIGURACIÓN TECNO-EG
const SOCIOS_AUTORIZADOS = ["tecnoeg@gmail.com", "tiendadtiendas@gmail.com", "gla_142@hotmail.com"];
const DESCUENTO_FACTOR = 0.9; // 10% OFF

function getDriveDirectLink(url: string, version: string = "1") {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  return `https://lh3.googleusercontent.com/d/${fileId}=s1000?v=${version}`;
}

/**
 * LÓGICA HÍBRIDA: Lee del Scraper y de la Carga Manual
 */
export async function getProductsFromSheets() {
  try {
    // 1. Definimos las pestañas a leer
    const pestañas = ["'Carga de productos'!A2:O", "'Carga de script'!A2:O"];
    let allRows: any[] = [];

    for (const range of pestañas) {
      const response = await sheets.spreadsheets.values.get({ spreadsheetId: CLIENT_ID, range });
      if (response.data.values) {
        allRows = [...allRows, ...response.data.values];
      }
    }

    if (allRows.length === 0) return [];

    return allRows
      .filter((row: any) => row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase()))
      .map((row: any) => {
        const precioTransfer = Number(row[3]) || 0;
        const catRaw = row[6]?.toString().trim() || "General";
        
        // Imagen: Si es Drive la convierte, si es link de Mitre/Integrados (scraper) la deja igual
        const principal = row[5]?.includes('drive.google.com') 
          ? getDriveDirectLink(row[5], "1") 
          : row[5] || "";

        const extras = [row[10], row[11], row[12], row[13], row[14]]
          .filter(url => url)
          .map(url => url.includes("drive.google.com") ? getDriveDirectLink(url, "1") : url);

        return {
          id: row[1]?.toString() || Math.random().toString(36).slice(2),
          nombre: row[2]?.toString() || "",
          precio: Math.round(precioTransfer / DESCUENTO_FACTOR),
          precioTransfer: precioTransfer,
          descripcion: row[4] || "",
          imagen: principal,
          galeria: [principal, ...extras].filter(Boolean),
          categoria: catRaw,
          categoriaSlug: slugify(catRaw),
          tipo: 'tecnologia',
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
      .map((row: any) => ({
        imagen: getDriveDirectLink(row[1] || "", row[4] || "1"),
        ubicacion: row[2]?.toString().toLowerCase().trim() || "",
        linkDestino: row[3] || null
      }));
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

/**
 * SISTEMA MAESTRO DE 10 COLUMNAS (A-J)
 */
export async function savePaymentToMaster(paymentData: any[]) {
  try {
    const targetRange = 'webhoock MP!A:J'; 
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