// scripts/scraper-tecno.js
const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const path = require('path');
// Carga el .env desde la raíz del proyecto
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runScraper() {
  // 1. CONFIGURACIÓN DE GOOGLE SHEETS
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const CLIENT_SHEET_ID = process.env.CLIENT_CONTENT_SHEET_ID;
  const TAB_NAME = 'Carga de script'; // <--- CAMBIADO A TU PETICIÓN
  const VENDEDOR_EMAIL = 'tecnoeg@gmail.com'; 

  const BASE = 'https://www.integradosargentinos.com';
  const LIMITE_POR_SECCION = 299;

  const SECCIONES = [
    { id: 'notebooks', nombre: 'Notebooks', urls: [`${BASE}/notebooks/notebooks1/`] },
    { id: 'monitores', nombre: 'Monitores', urls: [`${BASE}/monitores/`] },
    { id: 'pc', nombre: 'PCs Armadas', urls: [`${BASE}/pc2/pc-oficina/`, `${BASE}/pc2/pc-gamer/`] },
    { id: 'componentes', nombre: 'Componentes', urls: [`${BASE}/procesadores/amd2/`, `${BASE}/procesadores/intel2/`, `${BASE}/placas-de-video/nvidia/`] },
    { id: 'perifericos', nombre: 'Periféricos', urls: [`${BASE}/mouses/mouses1/`, `${BASE}/teclados/`, `${BASE}/auriculares/`] },
    { id: 'almacenamiento', nombre: 'Almacenamiento', urls: [`${BASE}/almacenamiento/discos-solidos-ssd/`] },
  ];

  console.log('🚀 Iniciando scraper TECNO-EG...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  let todosLosProductos = [];

  for (const seccion of SECCIONES) {
    console.log(`📦 Procesando: ${seccion.nombre}`);
    const page = await browser.newPage();
    
    for (const url of seccion.urls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        await new Promise(r => setTimeout(r, 3000)); // Sleep

        const productos = await page.evaluate((catName, email) => {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          const found = [];
          
          scripts.forEach(s => {
            try {
              const data = JSON.parse(s.textContent);
              const items = Array.isArray(data) ? data : [data];
              
              items.forEach(item => {
                // Si es una lista de productos
                if (item.itemListElement) {
                  item.itemListElement.forEach(el => {
                    const p = el.item;
                    if (p && p.name) {
                      found.push({
                        vendedor: email,
                        id: p.url?.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2),
                        nombre: p.name,
                        precio: Math.round(parseFloat(p.offers?.price || 0)),
                        descripcion: p.name,
                        imagen: p.image || '',
                        categoria: catName,
                        stock: p.offers?.availability?.includes('InStock') ? 99 : 0
                      });
                    }
                  });
                } 
                // Si es un producto individual
                else if (item['@type'] === 'Product') {
                  found.push({
                    vendedor: email,
                    id: item.url?.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2),
                    nombre: item.name,
                    precio: Math.round(parseFloat(item.offers?.price || 0)),
                    descripcion: item.name,
                    imagen: item.image || '',
                    categoria: catName,
                    stock: item.offers?.availability?.includes('InStock') ? 99 : 0
                  });
                }
              });
            } catch (e) {}
          });
          return found;
        }, seccion.nombre, VENDEDOR_EMAIL);

        todosLosProductos.push(...productos);
        console.log(`   → Encontrados ${productos.length} en esta URL`);
      } catch (err) {
        console.log(`   ⚠ Error en ${url}: ${err.message}`);
      }
    }
    await page.close();
  }

  await browser.close();

  // Deduplicar
  const unique = [...new Map(todosLosProductos.map(p => [p.id, p])).values()];

  // 2. ESCRIBIR EN GOOGLE SHEETS
  try {
    const range = `'${TAB_NAME}'!A2:O`;
    const values = unique.map(p => [
      p.vendedor, p.id, p.nombre, p.precio, p.descripcion, p.imagen, p.categoria, p.stock, '', '', '', '', '', '', ''
    ]);

    // Limpiamos la pestaña antes de escribir
    await sheets.spreadsheets.values.clear({
      spreadsheetId: CLIENT_SHEET_ID,
      range: range,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: CLIENT_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`✅ ¡Éxito! ${unique.length} productos guardados en la pestaña "${TAB_NAME}"`);
  } catch (err) {
    console.error('❌ Error en Google Sheets:', err.message);
  }
}

runScraper();