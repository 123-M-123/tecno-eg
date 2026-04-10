const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE = 'https://www.integradosargentinos.com'

const SECCIONES = [

{
id: 'notebooks',
nombre: 'Notebooks',
urls: [
`${BASE}/notebooks/notebooks1/`,
`${BASE}/notebooks/accesorios/`,
`${BASE}/notebooks/cargadores/`,
],
},
{
id: 'monitores',
nombre: 'Monitores',
urls: [
`${BASE}/monitores/`,
`${BASE}/soportes/monitores1/`,
],
},
{
id: 'pc',
nombre: 'PCs Armadas',
urls: [
`${BASE}/pc2/pc-oficina/`,
`${BASE}/pc2/pc-gamer/`,
`${BASE}/pc2/pc-mini/`,
`${BASE}/kit-de-actualizacion-pc/`,
],
},
{
id: 'componentes',
nombre: 'Componentes',
urls: [
`${BASE}/procesadores/amd2/`,
`${BASE}/procesadores/intel2/`,
`${BASE}/mothers/amd/`,
`${BASE}/mothers/intel/`,
`${BASE}/memorias-ram/pc1/`,
`${BASE}/memorias-ram/notebook/`,
`${BASE}/placas-de-video/nvidia/`,
`${BASE}/placas-de-video/amd1/`,
`${BASE}/placas-de-video/intel1/`,
`${BASE}/fuentes/`,
`${BASE}/refrigeracion/coolers-procesador/`,
],
},
{
id: 'perifericos',
nombre: 'Periféricos',
urls: [
`${BASE}/mouses/mouses1/`,
`${BASE}/mouses/mouse-pads/`,
`${BASE}/teclados/`,
`${BASE}/auriculares/`,
`${BASE}/kit-de-teclado-mouse-y-otros/`,
`${BASE}/joysticks/`,
],
},
{
id: 'almacenamiento',
nombre: 'Almacenamiento',
urls: [
`${BASE}/almacenamiento/discos-solidos-ssd/`,
`${BASE}/almacenamiento/discos-externos/`,
`${BASE}/almacenamiento/discos-rigidos/`,
],
},
{
id: 'gabinetes',
nombre: 'Gabinetes y Fuentes',
urls: [
`${BASE}/gabinetes/`,
`${BASE}/fuentes/`,
`${BASE}/refrigeracion/coolers-fan-gabinetes/`,
],
},
{
id: 'redes',
nombre: 'Redes y Conectividad',
urls: [
`${BASE}/conectividad-y-redes/routers/`,
`${BASE}/conectividad-y-redes/cables/`,
`${BASE}/conectividad-y-redes/adaptadores-wifi/`,
`${BASE}/conectividad-y-redes/switches/`,
`${BASE}/conectividad-y-redes/access-point/`,
`${BASE}/conectividad-y-redes/placas-de-red/`,
],
},
{
id: 'cables',
nombre: 'Cables y Adaptadores',
urls: [
`${BASE}/cables-y-adaptadores/usb-c/`,
`${BASE}/cables-y-adaptadores/video/`,
`${BASE}/cables-y-adaptadores/usb/`,
`${BASE}/cables-y-adaptadores/adaptadores/`,
`${BASE}/cables-y-adaptadores/audio/`,
],
},
]

const LIMITE = 299

async function scrapearPagina(page, url, categoriaId) {
  console.log(`  Scrapeando: ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await new Promise(resolve => setTimeout(resolve, 6000))
  // Forzar carga de imágenes lazy
await page.evaluate(() => {
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.src = img.dataset.src
  })
  document.querySelectorAll('img[data-nimg]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src
  })
})
await new Promise(resolve => setTimeout(resolve, 2000))

  const productos = await page.evaluate((categoriaId) => {
    const items = []

    // Extraer datos del JSON-LD que Tienda Nube inyecta en cada página
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const productosJSON = []

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent)
        if (data['@type'] === 'ItemList' && data.itemListElement) {
          data.itemListElement.forEach(item => {
            if (item.item) productosJSON.push(item.item)
          })
        }
        if (data['@type'] === 'Product') {
          productosJSON.push(data)
        }
      } catch(e) {}
    })

    productosJSON.forEach(prod => {
      if (!prod.name || !prod.offers) return
console.log('imagen:', prod.image) /*agregado para debug*/
      const titulo = prod.name
      const imagenRaw = prod.image
const imagen = Array.isArray(imagenRaw) ? imagenRaw[0] : (imagenRaw || '')
      const href = prod.url || prod.offers?.url || ''
      const precio = Math.round(parseFloat(prod.offers?.price || '0'))
      const disponible = prod.offers?.availability?.includes('InStock')
      const stock = prod.offers?.inventoryLevel?.value || (disponible ? 1 : 0)

      if (!titulo || precio === 0 || !imagen) return

      const id = href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)

      items.push({
        id_producto: id,
        titulo,
        precio,
        categoria: categoriaId,
        etiqueta: parseInt(stock) === 0 ? 'Sin stock' : 'Disponible',
        descripcion: titulo,
        imagen: imagen.startsWith('http') ? imagen : 'https:' + imagen,
        stock: parseInt(stock) > 0 ? 1 : 0,
      })
    })

    return items
  }, categoriaId)

if (productos.length > 0) {
  console.log('  Ejemplo imagen:', productos[0].imagen)
}

  return productos
}
async function main() {
  console.log('🚀 Iniciando scraper Integrados Argentinos...\n')

  const browser = await puppeteer.launch({ headless: true })
  const resultado = { secciones: [] }

  for (const seccion of SECCIONES) {
    console.log(`\n📦 Sección: ${seccion.nombre}`)
    let todos = []

    for (const url of seccion.urls) {
      // Crear página nueva por cada URL
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
      
      try {
        const prods = await scrapearPagina(page, url, seccion.id)
        todos = [...todos, ...prods]
        console.log(`  → ${prods.length} productos en esta URL`)
        if (todos.length >= LIMITE) {
          await page.close()
          break
        }
      } catch (err) {
        console.log(`  ⚠️ Error en ${url}: ${err.message}`)
      }
      
      await page.close()
      if (todos.length >= LIMITE) break
    }

    const unicos = todos.filter(
      (p, i, arr) => arr.findIndex(x => x.id_producto === p.id_producto) === i
    )
    const final = unicos.slice(0, LIMITE)

    console.log(`  ✅ ${final.length} productos encontrados`)
    resultado.secciones.push({
      id: seccion.id,
      nombre: seccion.nombre,
      productos: final,
    })
  }

  await browser.close()

  const outputPath = path.join(__dirname, '../content/productos.json')
  fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2), 'utf-8')
  console.log('\n✅ productos.json generado!')
}

main().catch(console.error)