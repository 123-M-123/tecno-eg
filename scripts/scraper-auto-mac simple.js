// scripts/scraper-auto-mac.js
const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

function esperarEnter(mensaje) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(mensaje, answer => {
    rl.close();
    resolve(answer);
  }));
}

async function runScraper() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const CLIENT_SHEET_ID = '1VACTJ1jWoIe6kzpHN1X7lIrfYIoxwaaH8TIcOmnvThQ';
  const TAB_NAME = 'Carga de script'; 
  const VENDEDOR_EMAIL = 'auto-mac@gmail.com'; 

  const URL_OBJETIVO = 'https://listado.mercadolibre.com.ar/_CustId_710524102';

  console.log('🚀 Iniciando scraper UNIVERSAL para AUTO-MAC...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'] 
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    console.log(`🔎 Navegando a: ${URL_OBJETIVO}`);
    await page.goto(URL_OBJETIVO, { waitUntil: 'networkidle2' });

    console.log('\n------------------------------------------------------------');
    console.log('👉 ESPERANDO A QUE ESTÉS LISTO:');
    console.log('1. En la ventana de Chrome, asegurate de VER LOS PRODUCTOS.');
    console.log('2. Si te logueaste, perfecto.');
    console.log('3. Volvé a esta terminal y apretá ENTER.');
    console.log('------------------------------------------------------------\n');

    await esperarEnter('¿Ya ves los productos en pantalla? Apretá ENTER...');

    console.log('⏬ Extrayendo datos con selectores universales...');
    
    // Scroll para cargar imágenes
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        let distance = 400;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) { clearInterval(timer); resolve(); }
        }, 150);
      });
    });

    const productos = await page.evaluate((email) => {
      // Buscamos cualquier contenedor que parezca un producto (Layout viejo, nuevo o Polycard)
      const items = document.querySelectorAll('.ui-search-layout__item, .poly-card, .ui-search-result__wrapper');
      const data = [];

      items.forEach((item) => {
        try {
          // 1. Título: Buscamos en varias etiquetas posibles
          const tituloElement = item.querySelector('h2, .ui-search-item__title, .poly-component__title');
          
          // 2. Precio: Buscamos la fracción del precio
          const precioElement = item.querySelector('.andes-money-amount__fraction');
          
          // 3. Imagen: La primera que aparezca en el contenedor
          const imgElement = item.querySelector('img');
          
          // 4. Link: El primer link que contenga "MLA"
          const linkElement = item.querySelector('a[href*="MLA"]');

          if (tituloElement && precioElement) {
            const titulo = tituloElement.innerText.trim();
            const precioStr = precioElement.innerText.replace(/\./g, '');
            const link = linkElement ? linkElement.href : '';
            const idMatch = link.match(/MLA-?(\d+)/);

            data.push({
              vendedor: email,
              id: idMatch ? `MLA${idMatch[1]}` : Math.random().toString(36).slice(2),
              nombre: titulo,
              precio: parseInt(precioStr, 10),
              descripcion: titulo,
              imagen: imgElement?.getAttribute('data-src') || imgElement?.src || '',
              categoria: 'Multimedia',
              stock: 10
            });
          }
        } catch (e) {}
      });
      return data;
    }, VENDEDOR_EMAIL);

    console.log(`📊 Total detectado: ${productos.length} productos.`);

    if (productos.length > 0) {
      const range = `'${TAB_NAME}'!A2:O`;
      const values = productos.map(p => [
        p.vendedor, p.id, p.nombre, p.precio, p.descripcion, p.imagen, p.categoria, p.stock, '', '', '', '', '', '', ''
      ]);

      console.log('📝 Limpiando y escribiendo en Sheets...');
      await sheets.spreadsheets.values.clear({ spreadsheetId: CLIENT_SHEET_ID, range });
      await sheets.spreadsheets.values.update({
        spreadsheetId: CLIENT_SHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      console.log('✨ ¡LISTO! Revisá la planilla de Auto-Mac.');
    } else {
      console.log('❌ Error: No se capturó nada. ML bloqueó el acceso a los datos.');
    }

  } catch (err) {
    console.error('❌ Error en el script:', err.message);
  } finally {
    await esperarEnter('\nPresioná ENTER para cerrar el navegador...');
    await browser.close();
  }
}

runScraper();