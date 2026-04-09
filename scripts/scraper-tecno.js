const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE = 'https://www.integradosargentinos.com'

const SECCIONES = [
  {
    id: 'novedades',
    nombre: '🔥 Más Vendidos',
    urls: [`${BASE}/productos/`],
  },
  {
    id: 'notebooks',
    nombre: 'Notebooks',
    urls: [`${BASE}/notebooks/notebooks1/`],
  },
  {
    id: 'monitores',
    nombre: 'Monitores',
    urls: [`${BASE}/monitores/`],
  },
  {
    id: 'pc',
    nombre: 'PCs Armadas',
    urls: [
      `${BASE}/pc2/pc-oficina/`,
      `${BASE}/pc2/pc-gamer/`,
    ],
  },
  {
    id: 'perifericos',
    nombre: 'Periféricos',
    urls: [
      `${BASE}/mouses/mouses1/`,
      `${BASE}/teclados/`,
      `${BASE}/auriculares/`,
    ],
  },
  {
    id: 'componentes',
    nombre: 'Componentes',
    urls: [
      `${BASE}/memorias-ram/`,
      `${BASE}/almacenamiento/discos-solidos-ssd/`,
      `${BASE}/placas-de-video/`,
    ],
  },
  {
    id: 'electrodomesticos',
    nombre: 'Electrodomésticos',
    urls: [
      `${BASE}/electrodomesticos/freidoras-de-aire/`,
      `${BASE}/electrodomesticos/ventiladores/`,
      `${BASE}/electrodomesticos/aspiradoras/`,
    ],
  },
]

const LIMITE = 20

async function scrapearPagina(page, url, categoriaId) {
  console.log(`  Scrapeando: ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await new Promise(resolve => setTimeout(resolve, 6000))

  // DEBUG
  const html = await page.content()
  fs.writeFileSync('debug-tecno.html', html)
  console.log('HTML guardado en debug-tecno.html')
  return []


  const productos = await page.evaluate((categoriaId) => {
    const items = []
    const cards = document.querySelectorAll('.item-list .item')

    cards.forEach(card => {
      const imgEl = card.querySelector('img.photo')
      const tituloEl = card.querySelector('.item-name')
      const precioEl = card.querySelector('.price')
      const linkEl = card.querySelector('a.item-link')
      const stockEl = card.querySelector('.stock-available')

      if (!imgEl || !tituloEl || !precioEl) return

      const imagen = imgEl.getAttribute('src') || imgEl.getAttribute('data-src')
      const titulo = tituloEl.textContent.trim()
      const precioTxt = precioEl.textContent.trim()
      const href = linkEl ? linkEl.getAttribute('href') : ''

      const precioNum = Math.round(
        parseFloat(
          precioTxt.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')
        )
      )
      if (!imagen || !titulo || isNaN(precioNum) || precioNum === 0) return

      const stockTxt = stockEl ? stockEl.textContent.trim() : ''
      const stockNum = stockTxt.match(/\d+/) ? parseInt(stockTxt.match(/\d+/)[0]) : 1

      const id = href.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2)

      items.push({
        id_producto: id,
        titulo,
        precio: precioNum,
        categoria: categoriaId,
        etiqueta: stockNum === 0 ? 'Sin stock' : 'Disponible',
        descripcion: titulo,
        imagen: imagen.startsWith('http') ? imagen : 'https:' + imagen,
        stock: stockNum > 0 ? 1 : 0,
      })
    })

    return items
  }, categoriaId)

  return productos
}

async function main() {
  console.log('🚀 Iniciando scraper Integrados Argentinos...\n')

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

  const resultado = { secciones: [] }

  for (const seccion of SECCIONES) {
    console.log(`\n📦 Sección: ${seccion.nombre}`)
    let todos = []

    for (const url of seccion.urls) {
      try {
        const prods = await scrapearPagina(page, url, seccion.id)
        todos = [...todos, ...prods]
        console.log(`  → ${prods.length} productos en esta URL`)
        if (todos.length >= LIMITE) break
      } catch (err) {
        console.log(`  ⚠️ Error en ${url}: ${err.message}`)
      }
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