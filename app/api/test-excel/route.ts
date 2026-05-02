import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;

  try {
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

    // FORZAMOS LA CELDA A2
    const resSheet = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent('webhoock MP!A2:F2')}?valueInputOption=RAW`,
      {
        method: 'PUT', // PUT sobreescribe, no agrega
        headers: {
          Authorization: `Bearer ${dataToken.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [["EXITO_A2", "FECHA_TEST", "PRODUCTO", "100", "OK", "test@test.com"]] }),
      }
    );

    const dataSheet = await resSheet.json();
    return NextResponse.json({ 
      nota: "Si esto da OK, tiene que aparecer en A2 SI O SI",
      ID_PLANILLA_USADO: SHEET_ID,
      dataSheet 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}