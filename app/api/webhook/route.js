import { NextResponse } from 'next/server'

const SHEET_ID      = process.env.GOOGLE_SHEET_ID
const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const ACCESS_TOKEN  = process.env.MP_ACCESS_TOKEN

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('No se pudo obtener access token')
  return data.access_token
}

async function agregarEnSheet(token, fila) {
  // Aumentamos el rango a G por si agregamos más columnas en el futuro
  const range = 'webhoock MP!A:G' 
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [fila] }),
    }
  )
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.type !== 'payment') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ status: 'no payment id' }, { status: 200 })
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    )
    const pago = await mpRes.json();
console.log("EXTERNAL REFERENCE DESDE MP:", pago.external_reference);

    if (pago.status !== 'approved') {
      return NextResponse.json({ status: 'not approved' }, { status: 200 })
    }

    const fecha = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires'
    })

    // --- NUEVO: EXTRAEMOS EL MAIL DEL VENDEDOR QUE GUARDAMOS EN EXTERNAL_REFERENCE ---
    const emailVendedor = pago.external_reference || 'Sin Identificar';

    // REORGANIZAMOS LA FILA:
    // Col A: Mail Vendedor | Col B: Fecha | Col C: Producto | Col D: Precio | Col E: Estado | Col F: Mail Comprador
    const fila = [
      emailVendedor,             // COLUMNA A (La que necesitás para el panel)
      fecha,                     // COLUMNA B
      pago.description || 'Compra Online', // COLUMNA C
      pago.transaction_amount || 0,        // COLUMNA D
      'PAGADO',                  // COLUMNA E
      pago.payer?.email || '',   // COLUMNA F (Mail del que compró)
    ]

    const token = await getAccessToken()
    await agregarEnSheet(token, fila)

    console.log('Pago registrado para el vendedor:', emailVendedor)
    return NextResponse.json({ status: 'ok' }, { status: 200 })

  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}