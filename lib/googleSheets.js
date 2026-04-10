// lib/googleSheets.js

export async function getGoogleSheetsClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Carga de productos!A2:F';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    console.log('STATUS:', res.status)
    console.log('DATA:', JSON.stringify(data))

    if (data.error) {
      console.error("Error de Google API:", data.error.message);
      return [];
    }

  return (data.values || []).filter(row => row.length > 0 && row[0]?.trim() !== '')
  } catch (error) {
    console.error("Error de red:", error);
    return [];
  }
}