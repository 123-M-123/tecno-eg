import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Mercado Pago envía notificaciones de varios tipos, filtramos por 'payment'
    if (body.type === "payment") {
      const paymentId = body.data.id;

      // 1. Consultar el detalle del pago a Mercado Pago
      const mpResponse = await fetch(`https://mercadopago.com{paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });
      const paymentData = await mpResponse.json();

      // 2. Si el pago está aprobado, lo mandamos a Google Sheets
      if (paymentData.status === "approved") {
        const sheets = await getGoogleSheetsClient();
        
        const filaNueva = [
          paymentId,
          new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
          paymentData.payer.email,
          paymentData.description || "Compra Tienda Online",
          paymentData.transaction_amount,
          "PAGADO"
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Aviso de compra y Pago!A:F',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [filaNueva] },
        });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ error: "Ocurrió un error" }, { status: 500 });
  }
}
