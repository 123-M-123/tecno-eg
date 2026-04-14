import { NextRequest, NextResponse } from 'next/server'

const FOLDER_ID      = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G'
const SHEET_ID       = process.env.GOOGLE_SHEET_ID!
const CLIENT_ID      = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET!
const REFRESH_TOKEN  = process.env.GOOGLE_REFRESH_TOKEN!

// ── Obtener access token desde refresh token ──────────────────────────
async function getAccessToken(): Promise<string> {
  
  console.log('CLIENT_ID existe:', !!CLIENT_ID)
  console.log('CLIENT_SECRET existe:', !!CLIENT_SECRET)  
  console.log('REFRESH_TOKEN existe:', !!REFRESH_TOKEN)

  
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

 // LOG - ver respuesta completa de Google
  console.log('Google OAuth response:', JSON.stringify(data))




  if (!data.access_token) throw new Error('No se pudo obtener access token de Google')
  return data.access_token
}

// ── Subir archivo a Google Drive ──────────────────────────────────────
async function subirADrive(
  token:    string,
  archivo:  File,
  nombre:   string,
): Promise<string> {

// LOG TEMPORAL - borralo después
  console.log('TOKEN obtenido:', token ? 'SÍ' : 'NO')
  console.log('Archivo:', archivo.name, archivo.size)
  console.log('FOLDER_ID:', FOLDER_ID)


  const metadata = JSON.stringify({
    name:    nombre,
    parents: [FOLDER_ID],
  })

  const form = new FormData()
  form.append('metadata', new Blob([metadata], { type: 'application/json' }))
  form.append('file',     archivo)

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    }
  )
  const data = await res.json()

console.log('Drive response:', JSON.stringify(data)) // ← agregá esto



  if (!data.id) throw new Error('Error al subir archivo a Drive')

  // Hacer el archivo público para poder verlo con el link
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  })

  return data.webViewLink


  
}

// ── Agregar fila en Google Sheets ─────────────────────────────────────
async function agregarEnSheet(
  token:        string,
  titulo:       string,
  precio:       string,
  linkDrive:    string,
  fecha:        string,
): Promise<void> {
  const range = 'Pedidos!A:F'
  const values = [[fecha, titulo, precio, 'COMPROBANTE_ENVIADO', linkDrive, '']]

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  )
}

// ── Handler principal ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const form      = await req.formData()
    const archivo   = form.get('archivo')   as File   | null
    const titulo    = form.get('titulo')    as string | null
    const precio    = form.get('precio')    as string | null

    if (!archivo || !titulo || !precio) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const fecha  = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
    const nombre = `${fecha.replace(/[/:, ]/g, '-')}_${titulo.slice(0, 30)}.${archivo.name.split('.').pop()}`

    const token    = await getAccessToken()
    const linkDrive = await subirADrive(token, archivo, nombre)
    await agregarEnSheet(token, titulo, precio, linkDrive, fecha)

    return NextResponse.json({ ok: true, link: linkDrive })
  } catch (err: any) {
    console.error('Error upload-comprobante:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}