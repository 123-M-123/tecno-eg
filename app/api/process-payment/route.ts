import { NextRequest, NextResponse } from 'next/server';

// --- 1. FUNCIONES DE AYUDA PARA GOOGLE SHEETS ---

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
  const range = 'webhoock MP!A:F'; // Asegúrate de que la pestaña se llame así
  
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

// --- 2. HANDLER PRINCIPAL (POST) ---

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // --- LIMPIEZA DE DATOS ---
    // Sacamos vendedorEmail del objeto para que MP no se queje (Error 400)
    const { vendedorEmail, ...datosParaMP } = formData;

    console.log(">>>> [FRONTEND] Mail del Vendedor recibido:", vendedorEmail);

    const emailLimpio = vendedorEmail || "mguiyemo@gmail.com";

    // --- LLAMADA A MERCADO PAGO ---
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ 
        ...datosParaMP,              // Solo enviamos lo que MP reconoce
        external_reference: emailLimpio, // Ponemos el mail aquí (MP lo acepta perfecto)
        differential_pricing_id: undefined 
      }),
    });

    const data = await response.json();

    // --- LOGS PARA DEBUG ---
    console.log(">>>> [MERCADO PAGO] Estado del pago:", data.status);
    console.log(">>>> [MERCADO PAGO] ID de pago:", data.id);

    if (!response.ok) {
      console.error("❌ Error en MP:", data.message || data);
      return NextResponse.json(data, { status: response.status });
    }

    // --- ESCRITURA EN GOOGLE SHEETS ---
    // Solo si el pago fue aprobado
    if (data.status === 'approved') {
      try {
        console.log("⏳ Intentando escribir en Google Sheets para:", emailLimpio);
        const token = await getAccessToken();
        const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        
        // El orden de las columnas:
        // A: Vendedor | B: Fecha | C: Producto | D: Precio | E: Estado | F: Comprador
        const fila = [
          emailLimpio,                    // COLUMNA A
          fecha,                          // COLUMNA B
          data.description || 'Venta Online', // COLUMNA C
          data.transaction_amount,        // COLUMNA D
          'APROBADO',                     // COLUMNA E
          data.payer?.email || ''         // COLUMNA F
        ];
        
        await agregarEnSheet(token, fila);
        console.log('✅ EXCEL: Fila agregada con éxito');
      } catch (sheetError) {
        console.error('❌ EXCEL ERROR:', sheetError);
      }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN EL SERVIDOR:', error);
    return NextResponse.json(
      { error: 'Error interno en el servidor' },
      { status: 500 }
    );
  }
}