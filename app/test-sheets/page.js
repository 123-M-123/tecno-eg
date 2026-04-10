import { getGoogleSheetsClient } from '../../lib/googleSheets';

export default async function TestSheetsPage() {
  try {
    const sheets = await getGoogleSheetsClient();
    const range = 'Pestaña 2!A2:F'; // Lee desde la columna A hasta la F

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
    });

    const productos = response.data.values || [];

    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4">Productos desde Google Sheets:</h1>
        {productos.length > 0 ? (
          <ul className="space-y-2">
            {productos.map((prod, index) => (
              <li key={index} className="border p-2 rounded shadow-sm">
                <strong>{prod[1]}</strong> - ${prod[3]} (Stock: {prod[4]})
              </li>
            ))}
          </ul>
        ) : (
          <p>No se encontraron productos o la pestaña está vacía.</p>
        )}
      </div>
    );
  } catch (error) {
    return <div className="p-10 text-red-500">Error: {error.message}</div>;
  }
}
