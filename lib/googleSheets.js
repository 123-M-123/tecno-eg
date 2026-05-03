// lib/googleSheets.js

export async function getGoogleSheetsClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  // Cambiamos el rango a G porque agregamos la columna Vendedor en la A
  const range = 'Carga de productos!A2:G'; 

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (data.error) {
      console.error("Error de Google API:", data.error.message);
      return [];
    }

    // Modificamos el mapeo: 
    // row[0] ahora es el Mail, así que empezamos a tomar los datos desde row[1]
    return (data.values || [])
      .filter(row => row.length > 0 && row[1]?.trim() !== '') // Chequeamos que el título (ahora en row[1]) no esté vacío
      .map(row => ({
        vendedor:    row[0], // Guardamos quién es el dueño por si lo necesitamos
        id_producto: row[1],
        titulo:      row[2],
        precio:      row[3],
        descripcion: row[4],
        imagen:      row[5],
        categoria:   row[6]
      }));
  } catch (error) {
    console.error("Error de red:", error);
    return [];
  }
}