const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE = 'https://www.integradosargentinos.com'
const OUTPUT = path.join(__dirname, '../content/productos.json')
const LIMITE = 299

const PLACEHOLDER =
  'https://via.placeholder.com/600x600/111111/ffffff?text=Sin+Imagen'

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
    urls: [`${BASE}/monitores/`, `${BASE}/soportes/monitores1/`],
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function normalizarImagen(url) {
  if (!url) return ''

  let img = Array.isArray(url) ? url[0] : url
  img = String(img).trim()

  if (!img) return ''
  if (img.startsWith('//')) return 'https:' + img
  if (img.startsWith('/')) return BASE + img
  if (img.startsWith('http')) return img

  return ''
}

function esImagenValida(url) {
  if (!url) return false

  const limpia = url.toLowerCase()

  return (
    limpia.includes('.jpg') ||
    limpia.includes('.jpeg') ||
    limpia.includes('.png') ||
    limpia.includes('.webp') ||
    limpia.includes('.gif') ||
    limpia.includes('cdn')
  )
}

async function verificarImagen(page, url) {
  if (!url) return false

  try {
    const ok = await page.evaluate(async (img) => {
      try {
        const res = await fetch(img, { method: 'HEAD' })
        return res.ok
      } catch {
        return false
      }
    }, url)

    return ok
  } catch {
    return false
  }
}

async function scrapearPagina(page, url, categoriaId) {
  console.log(`  Scrapeando: ${url}`)

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 45000,
  })

  await sleep(4000)

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })

  await sleep(2000)

  const productos = await page.evaluate((categoriaId) => {
    const salida = []

    const productosJSON = []

    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )

    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent)

        if (Array.isArray(data)) {
          data.forEach((x) => productosJSON.push(x))
        } else {
          productosJSON.push(data)
        }
      } catch {}
    })

    const expandir = []

    productosJSON.forEach((item) => {
      if (item['@type'] === 'ItemList' && item.itemListElement) {
        item.itemListElement.forEach((p) => {
          if (p.item) expandir.push(p.item)
        })
      } else if (item['@type'] === 'Product') {
        expandir.push(item)
      }
    })

    expandir.forEach((prod) => {
      const titulo = prod.name || ''
      const precio = Math.round(parseFloat(prod?.offers?.price || '0'))
      const href = prod.url || prod?.offers?.url || ''
      const disponible =
        prod?.offers?.availability?.includes('InStock') || false

      const imagenJson = prod.image || ''

      if (!titulo || precio <= 0) return

      const id =
        href.split('/').filter(Boolean).pop() ||
        Math.random().toString(36).slice(2)

      salida.push({
        id_producto: id,
        titulo,
        precio,
        categoria: categoriaId,
        etiqueta: disponible ? 'Disponible' : 'Sin stock',
        descripcion: titulo,
        imagen: imagenJson,
        stock: disponible ? 1 : 0,
      })
    })

    return salida
  }, categoriaId)

  for (let i = 0; i < productos.length; i++) {
    let img = normalizarImagen(productos[i].imagen)

    if (!esImagenValida(img)) {
      img = ''
    }

    if (img) {
      const ok = await verificarImagen(page, img)
      if (!ok) img = ''
    }

    // Rescate automático buscando imagen parecida en DOM
    if (!img) {
      const rescue = await page.evaluate((titulo) => {
        const imgs = [...document.querySelectorAll('img')]

        const candidata = imgs.find((x) => {
          const alt = (x.alt || '').toLowerCase()
          return alt.includes(titulo.toLowerCase().slice(0, 12))
        })

        if (candidata) {
          return (
            candidata.src ||
            candidata.dataset.src ||
            candidata.getAttribute('src') ||
            ''
          )
        }

        const primera = imgs.find(
          (x) =>
            x.src &&
            !x.src.includes('logo') &&
            !x.src.includes('icon') &&
            !x.src.includes('banner')
        )

        return primera?.src || ''
      }, productos[i].titulo)

      img = normalizarImagen(rescue)
    }

    // Último fallback
    if (!img) {
      img = PLACEHOLDER
    }

    productos[i].imagen = img
  }

  return productos
}

function deduplicar(lista) {
  const mapa = new Map()

  for (const item of lista) {
    if (!mapa.has(item.id_producto)) {
      mapa.set(item.id_producto, item)
    }
  }

  return [...mapa.values()]
}

async function main() {
  console.log('🚀 Iniciando scraper PRO...\n')

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1400,
      height: 900,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const resultado = { secciones: [] }

  for (const seccion of SECCIONES) {
    console.log(`📦 ${seccion.nombre}`)

    let todos = []

    for (const url of seccion.urls) {
      const page = await browser.newPage()

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'
      )

      try {
        const productos = await scrapearPagina(page, url, seccion.id)

        console.log(`   → ${productos.length} productos`)

        todos.push(...productos)
      } catch (err) {
        console.log(`   ⚠ Error: ${err.message}`)
      }

      await page.close()

      if (todos.length >= LIMITE) break
    }

    todos = deduplicar(todos).slice(0, LIMITE)

    console.log(`   ✅ Final: ${todos.length}\n`)

    resultado.secciones.push({
      id: seccion.id,
      nombre: seccion.nombre,
      productos: todos,
    })
  }

  await browser.close()

  fs.writeFileSync(OUTPUT, JSON.stringify(resultado, null, 2), 'utf8')

  console.log('✅ productos.json generado correctamente')
}

main().catch(console.error)