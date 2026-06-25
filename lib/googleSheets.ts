import { google } from 'googleapis';

/**
 * UTILS & HELPER FUNCTIONS
 */
const slugify = (text: string) => 
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

function getDriveDirectLink(url: string, version: string = "1") {
  if (!url || !url.includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)(?:\/|$)|\/file\/d\/(.+?)\/|id=(.+?)(?:&|$)/);
  const fileId = match ? (match[1] || match[2] || match[3]) : null;
  if (!fileId) return url;
  // Cache Busting con el parámetro v=
  return `https://lh3.googleusercontent.com/d/${fileId}=s1000?v=${version}`;
}

/**
 * CONFIGURACIÓN DE AUTH
 */
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * CONSTANTES DE IDENTIFICACIÓN (TECNO-EG)
 */
const MASTER_ID = '16NcgTQ5N30wO7gywNh3JLjdMe676z5j4m3kIQ_PxT7w'; 
const CLIENT_ID = process.env.CLIENT_CONTENT_SHEET_ID; 
const SOCIOS_AUTORIZADOS = ["tecnoeg@gmail.com", "tiendadtiendas@gmail.com", "gla_142@hotmail.com"];
const SOCIO_PRINCIPAL = "tecnoeg@gmail.com";
const DESCUENTO_FACTOR = 0.9; // 10% OFF nativo de Tecno-EG

/**
 * 🛡️ ESCUDO 1: LÓGICA DE CONFIGURACIÓN DINÁMICA (FILA CERO)
 * Lee desde Config!A10 hasta DQ (111+ variables)
 */
export async function getConfigFromSheets() {
  try {
    const range = "Config!A10:DQ"; 
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: MASTER_ID, range });
    const rows = response.data.values;
    if (!rows) return null;

    // Buscamos la fila que coincida con el mail del dueño (Columna A)
    const clientRow = rows.find(row => row[0]?.toLowerCase().trim() === SOCIO_PRINCIPAL);
    if (!clientRow) return null;

    // MAPEADO EXPLÍCITO BLUEPRINT V2.6
    return {
      Email_Duenio: clientRow[0],
      Nombre_Corto: clientRow[1],
      Nombre_Medio: clientRow[2],
      Nombre_Largo: clientRow[3],
      Meta_Descripcion: clientRow[4],
      Logo_URL: clientRow[5],
      Logo_Size: clientRow[6],
      Preview_URL: clientRow[7],
      Version: clientRow[8] || "1",
      Color_Oscuro1: clientRow[9],
      Color_Oscuro2: clientRow[10],
      Color_Oscuro3: clientRow[11],
      Color_Medio1: clientRow[12],
      Color_Medio2: clientRow[13],
      Color_Medio3: clientRow[14],
      Color_Claro1: clientRow[15],
      Color_Claro2: clientRow[16],
      Color_Claro3: clientRow[17],
      WhatsApp: clientRow[18],
      Instagram: clientRow[19],
      TikTok: clientRow[20],
      Email_Publico: clientRow[21],
      Alias: clientRow[22],
      CBU: clientRow[23],
      CVU: clientRow[24],
      Descuento_Efectivo: clientRow[25],
      Envio_Local: clientRow[26],
      Envio_Nacional: clientRow[27],
      Categorias_Landing: clientRow[28],
      Button_Radius: clientRow[29],
      Nav_Button_Size: clientRow[30],
      Page_Button_Size: clientRow[31],
      H1_Size_Home: clientRow[32],
      SubTitle_Size_Home: clientRow[33],
      Text_Welcome: clientRow[34],
      Text_About: clientRow[35],
      Modal_Width: clientRow[36],
      Header_Icon_Size: clientRow[37],
      Modal_Button_Size: clientRow[38],
      Cart_Height: clientRow[39],
      Cart_Width: clientRow[40],
      Grid_Border_Size: clientRow[41],
      Grid_Shadow_Intensity: clientRow[42],
      H1_Page_Size: clientRow[43],
      H2_Page_Size: clientRow[44],
      Modal_Title_Size: clientRow[45],
      Modal_Body_Size: clientRow[46],
      Floating_WA_Size: clientRow[47],
      Icon_Stroke_Width: clientRow[48],
      Letter_Spacing: clientRow[49],
      Line_Height: clientRow[50],
      Card_Opacity: clientRow[51],
      Max_Container_Width: clientRow[52],
      Button_Padding_Y: clientRow[53],
      Button_Border_Size: clientRow[54],
      Font_Size_Global: clientRow[55],
      Header_Opacity: clientRow[56],
      Blur_Intensity: clientRow[57],
      Category_Home_Size: clientRow[58],
      Image_Radius: clientRow[59],
      Grid_Gap: clientRow[60],
      Price_Size: clientRow[61],
      Animation_Speed: clientRow[62],
      Hover_Scale: clientRow[63],
      Envio_Zona1: clientRow[64],
      Envio_Zona2: clientRow[65],
      Envio_Zona3: clientRow[66],
      Envio_Zona4: clientRow[67],
      OG_Image_Url: clientRow[68],
      Favicon_Url: clientRow[69],
      Icon_192_Url: clientRow[70],
      Icon_512_Url: clientRow[71],
      // ... Variables intermedias libres ...
      Logo_X_Offset: clientRow[101],
      Footer_Font_Size: clientRow[102],
      Footer_Height: clientRow[103],
      Z_Index_Header: clientRow[104],
      Z_Index_Hero: clientRow[105],
      Z_Index_Wa: clientRow[106],
      Z_Index_Modal: clientRow[107],
      Modal_Height: clientRow[108],
      Back_Button_Size: clientRow[109],
      Back_Button_Y: clientRow[110],
      Wa_Button_Y: clientRow[111],
      Wa_Float_Speed: clientRow[112],
    };
  } catch (error: any) {
    console.error("❌ Error en getConfigFromSheets:", error.message);
    return null;
  }
}

/**
 * LÓGICA HÍBRIDA: Lee de "Carga de productos" (manual) y "Carga de script" (scraper)
 */
export async function getProductsFromSheets() {
  try {
    const pestañas = ["'Carga de productos'!A2:O", "'Carga de script'!A2:O"];
    let allRows: any[] = [];

    for (const range of pestañas) {
      const response = await sheets.spreadsheets.values.get({ spreadsheetId: CLIENT_ID, range });
      if (response.data.values) {
        allRows = [...allRows, ...response.data.values];
      }
    }

    if (allRows.length === 0) return [];

    // Deduplicación por ID de producto (Columna B)
    const seenIds = new Set();

    return allRows
      .filter((row: any) => {
        const id = row[1]?.toString();
        if (!id || seenIds.has(id)) return false;
        seenIds.add(id);
        return row[0] && SOCIOS_AUTORIZADOS.includes(row[0].trim().toLowerCase());
      })
      .map((row: any) => {
        const precioTransfer = Number(row[3]) || 0;
        const catRaw = row[6]?.toString().trim() || "General";
        
        // Conversión a HD si es Drive o respeto de URL si es Scraper (Integrados/ML)
        const principal = row[5]?.includes('drive.google.com') 
          ? getDriveDirectLink(row[5], "1") 
          : row[5] || "";

        const extras = [row[10], row[11], row[12], row[13], row[14]]
          .filter(url => url)
          .map(url => url.includes("drive.google.com") ? getDriveDirectLink(url, "1") : url);

        return {
          id: row[1]?.toString(),
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

/**
 * BANNERS DINÁMICOS CON CACHE BUSTING
 */
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

/**
 * CATEGORÍAS DINÁMICAS (Para el Header)
 */
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
 * ✅ SISTEMA MAESTRO DE 10 COLUMNAS (A-J) PARA PEDIDOS
 * Mapeo: Vendedor (A), Fecha (B), Productos (C), Precio (D), Estado (E), ID (F), Notas (G), Nombre (H), WA (I), Entrega (J)
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
// Al final de lib/googleSheets.ts agrega esto:
export const getGoogleSheetsClient = getProductsFromSheets;