import { NextRequest, NextResponse } from 'next/server';

// --- CONFIGURACIÓN DE GOOGLE (Funciones de ayuda) ---

async function getAccessToken(): Promise<string> {
  const client_id = process.env.GOOGLE_CLIENT_ID || '';
  const client_secret = process.env.GOOGLE_CLIENT_SECRET || '';
  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN || '';

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('No se pudo obtener access token de Google');
  return data.access_token;
}

async function agregarEnSheet(token: string, fila: any[]) {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
  const range = 'webhoock MP!A:F'; // Asegúrate que el nombre de la pestaña sea idéntico
  
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [fila] }),
    }
  );
  return res.json();
}

// --- HANDLER PRINCIPAL (POST) ---

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // --- LOG ESTRATÉGICO 1: Ver qué llega del frontend ---
    console.log(">>>> [FRONTEND] Mail del Vendedor recibido:", formData.vendedorEmail);

    const vendedorEmail = formData.vendedorEmail || "mail_no_identificado@gmail.com";

    // Llamada a Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ 
        ...formData, 
        external_reference: vendedorEmail, // Aquí inyectamos el mail para recuperarlo luego
        differential_pricing_id: undefined 
      }),
    });

    const data = await response.json();

    // --- LOG ESTRATÉGICO 2: Ver respuesta de Mercado Pago ---
    console.log(">>>> [MERCADO PAGO] Estado del pago:", data.status);
    console.log(">>>> [MERCADO PAGO] ID de pago:", data.id);
    console.log(">>>> [MERCADO PAGO] External Reference devuelto:", data.external_reference);

    if (!response.ok) {
      console.error("❌ Error en MP:", data);
      return NextResponse.json(data, { status: response.status });
    }

    // Si el pago fue aprobado, escribimos en el Excel inmediatamente
    if (data.status === 'approved') {
      try {
        console.log("⏳ Iniciando escritura en Google Sheets...");
        const token = await getAccessToken();
        const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        
        const fila = [
          vendedorEmail,            // COLUMNA A
          fecha,                    // COLUMNA B
          data.description || 'Venta Online', // COLUMNA C
          data.transaction_amount,  // COLUMNA D
          'APROBADO',               // COLUMNA E
          data.payer?.email || ''   // COLUMNA F
        ];
        
        await agregarEnSheet(token, fila);
        console.log('✅ EXCEL: Fila agregada correctamente para', vendedorEmail);
      } catch (sheetError) {
        console.error('❌ EXCEL ERROR:', sheetError);
      }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN ROUTE:', error);
    return NextResponse.json(
      { error: 'Error interno en el servidor' },
      { status: 500 }
    );
  }
}