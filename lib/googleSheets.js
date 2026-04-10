// lib/googleSheets.js

export async function getGoogleSheetsClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Carga de productos!A2:F'; 

  // REVISÁ ESTA LÍNEA: Tiene que tener las barras y los símbolos $
  const url = `https://googleapis.com{sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (data.error) {
      console.error("Error de Google API:", data.error.message);
      return [];
    }

    // Retornamos data.values que es el array con los productos
    return data.values || [];
  } catch (error) {
    console.error("Error de red al conectar con Sheets:", error);
    return [];
  }
}
