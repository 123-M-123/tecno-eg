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
  const range = 'webhoock MP!A:F';
  
  await fetch(
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
}

// --- 2. HANDLER PRINCIPAL (POST) ---

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Separamos el vendedorEmail para que no ensucie el objeto de MP
    const { vendedorEmail, ...datosParaMP } = formData;
    const emailLimpio = vendedorEmail || "mguiyemo@gmail.com";

    console.log(">>>> [FRONTEND] Mail del Vendedor recibido:", emailLimpio);

    // --- CONSTRUCCIÓN DEL OBJETO LIMPIO PARA MP ---
    const payloadMP = {
      ...datosParaMP,
      // IMPORTANTE: Forzamos que el monto sea un Número. A veces llega como String y MP tira Error 500.
      transaction_amount: Number(datosParaMP.transaction_amount),
      external_reference: emailLimpio,
    };

    // Quitamos campos que puedan dar ruido si vienen vacíos
    if (payloadMP.differential_pricing_id === undefined) {
      delete (payloadMP as any).differential_pricing_id;
    }

    console.log(">>>> [DEBUG] Enviando monto:", payloadMP.transaction_amount);

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        // Generamos un ID de seguridad único para esta transacción
        'X-Idempotency-Key': Math.random().toString(36).substring(7),
      },
      body: JSON.stringify(payloadMP),
    });

    const data = await response.json();

    console.log(">>>> [MERCADO PAGO] Estado final:", data.status);

    if (!response.ok) {
      // Si MP tira error, lo logueamos completo para ver la causa
      console.error("❌ Error de MP detallado:", JSON.stringify(data));
      return NextResponse.json(data, { status: response.status });
    }

    // --- SI ES APROBADO, ESCRIBIMOS EN GOOGLE SHEETS ---
    if (data.status === 'approved') {
      try {
        const token = await getAccessToken();
        const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        
        const fila = [
          emailLimpio,              // Columna A
          fecha,                    // Columna B
          data.description || 'Venta Online', 
          data.transaction_amount,  
          'APROBADO',               
          data.payer?.email || ''   
        ];
        
        await agregarEnSheet(token, fila);
        console.log('✅ EXCEL: Fila agregada con éxito');
      } catch (sheetError) {
        console.error('❌ EXCEL ERROR:', sheetError);
      }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}