import { NextRequest, NextResponse } from 'next/server'

// --- CONFIGURACIÓN ---
// Te recomiendo crear una carpeta nueva en Drive para "Fotos de Productos" 
// y poner el ID aquí, o podés usar la misma de los comprobantes.
const FOLDER_ID      = '1oMY4j8SkKqgDmE3LzGEp1K2SqcarXY_G' 
const SHEET_ID       = process.env.GOOGLE_SHEET_ID!
const CLIENT_ID      = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET!
const REFRESH_TOKEN  = process.env.GOOGLE_REFRESH_TOKEN!

// ── Obtener access token ──────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
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

// ── Subir foto del producto a Google Drive ────────────────────────────
async function subirFotoProducto(token: string, archivo: File, nombre: string): Promise<string> {
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
  if (!data.id) throw new Error('Error al subir foto a Drive')

  // Hacer la foto pública para que se vea en la web
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  })

  return data.webViewLink
}

// ── Agregar producto en la Pestaña 3 ──────────────────────────────────
async function agregarProductoSheet(token: string, fila: any[]): Promise<void> {
  const range = 'Carga de productos!A:G' // Rango ajustado para incluir el vendedor
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [fila] }),
    }
  )
}

// ── Handler Principal ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    
    // Capturamos los campos del producto
    const vendedorEmail = form.get('vendedorEmail') as string || 'mguiyemo@gmail.com'
    const titulo        = form.get('titulo')        as string | null
    const precio        = form.get('precio')        as string | null
    const descripcion   = form.get('descripcion')   as string | null
    const categoria     = form.get('categoria')     as string | null
    const archivo       = form.get('foto')          as File   | null

    if (!archivo || !titulo || !precio) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const token = await getAccessToken()
    
    // 1. Subir la foto
    const nombreArchivo = `prod_${Date.now()}_${titulo.slice(0,20)}`
    const linkFoto = await subirFotoProducto(token, archivo, nombreArchivo)

    // 2. Preparar la fila para la Pestaña 3
    // Estructura: Vendedor | ID/Fecha | Título | Precio | Descripción | Link Imagen | Categoría
    const fila = [
      vendedorEmail,
      new Date().toLocaleDateString('es-AR'),
      titulo,
      precio,
      descripcion || '',
      linkFoto,
      categoria || 'General'
    ]

    await agregarProductoSheet(token, fila)

    console.log('✅ Nuevo producto cargado por:', vendedorEmail)
    return NextResponse.json({ ok: true, link: linkFoto })

  } catch (err: any) {
    console.error('Error cargando producto:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}