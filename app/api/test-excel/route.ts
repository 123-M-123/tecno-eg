import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;

  try {
    // 1. Obtener Token
    const resToken = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: client_id || '',
        client_secret: client_secret || '',
        refresh_token: refresh_token || '',
        grant_type: 'refresh_token',
      }),
    });
    const dataToken = await resToken.json();

    if (!dataToken.access_token) {
        return NextResponse.json({ error: "Error de Google Auth", detalle: dataToken }, { status: 400 });
    }

    // 2. Escribir fila de prueba
    const range = 'webhoock MP!A:F';
    const resSheet = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${dataToken.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [["TEST_FINAL", new Date().toLocaleString(), "Venta de $1", "1", "OK", "test@test.com"]] }),
      }
    );

    const dataSheet = await resSheet.json();
    return NextResponse.json({ mensaje: "Si ves esto, la planilla DEBE tener una fila nueva", dataSheet });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}