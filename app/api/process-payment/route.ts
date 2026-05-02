import { NextRequest, NextResponse } from 'next/server';

// --- FUNCIONES GOOGLE ---
async function getAccessToken(): Promise<string> {
  const client_id = process.env.GOOGLE_CLIENT_ID || '';
  const client_secret = process.env.GOOGLE_CLIENT_SECRET || '';
  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN || '';
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id, client_secret, refresh_token, grant_type: 'refresh_token' }),
  });
  const data = await res.json();
  return data.access_token;
}

async function agregarEnSheet(token: string, fila: any[]) {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/webhoock%20MP!A:F:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [fila] }),
  });
}

// --- HANDLER ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { vendedorEmail, ...datosParaMP } = formData;
    const emailLimpio = vendedorEmail || "mguiyemo@gmail.com";

    // 1. CONSTRUCCIÓN DEL PAYLOAD (Limpiando basurita)
    const payloadMP = {
      token: datosParaMP.token,
      issuer_id: datosParaMP.issuer_id,
      payment_method_id: datosParaMP.payment_method_id,
      transaction_amount: Number(datosParaMP.transaction_amount),
      installments: Number(datosParaMP.installments) || 1, // Si falla, que al menos sea 1
      description: datosParaMP.description || "Compra en TECNO EG",
      external_reference: emailLimpio,
      payer: {
        email: datosParaMP.payer?.email || 'test_user_123@testuser.com', // Mail distinto al vendedor
        identification: {
          type: datosParaMP.payer?.identification?.type || "DNI",
          number: datosParaMP.payer?.identification?.number || "12345678"
        }
      }
    };

    // --- LOG PARA VER EXACTAMENTE QUÉ VIAJA ---
    console.log(">>>> [OBJETO ENVIADO A MP]:", JSON.stringify(payloadMP, null, 2));

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': Math.random().toString(36).substring(7),
      },
      body: JSON.stringify(payloadMP),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ ERROR DETALLADO DE MP:", JSON.stringify(data));
      return NextResponse.json(data, { status: response.status });
    }

    console.log("✅ PAGO EXITOSO - ESTADO:", data.status);

    if (data.status === 'approved') {
      try {
        const token = await getAccessToken();
        const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        const fila = [emailLimpio, fecha, payloadMP.description, payloadMP.transaction_amount, 'APROBADO', payloadMP.payer.email];
        await agregarEnSheet(token, fila);
        console.log('✅ EXCEL ACTUALIZADO');
      } catch (e) { console.error('❌ ERROR EXCEL:', e); }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}