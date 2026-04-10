import { getGoogleSheetsClient } from '../../lib/googleSheets';

export default async function TestSheetsPage() {
  try {
    const productos = await getGoogleSheetsClient();

    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4">Productos desde Google Sheets:</h1>
        {productos.length > 0 ? (
          <ul className="space-y-2">
            {productos.map((prod, index) => (
              <li key={index} className="border p-2 rounded shadow-sm">
                <strong>{prod[1]}</strong> — ${prod[3]} (Stock: {prod[4]})
              </li>
            ))}
          </ul>
        ) : (
          <p>No se encontraron productos.</p>
        )}
      </div>
    );
  } catch (error) {
    return <div className="p-10 text-red-500">Error: {error.message}</div>;
  }
}