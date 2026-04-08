import { getGoogleSheetsClient } from './googleSheets';

export async function leerProductos() {
  const sheets = await getGoogleSheetsClient();
  const range = 'Pestaña 2!A2:F'; // Lee desde la fila 2 para saltar los encabezados

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
    });
    
    return response.data.values; // Esto devuelve un array con tus productos
  } catch (error) {
    console.error("Error leyendo Sheets:", error);
  }
}
