// scripts/scraper-auto-mac.js - VERSION INDUSTRIAL (400+ PRODUCTOS + GALERIA)
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

  // URL inicial del vendedor
  let urlActual = 'https://listado.mercadolibre.com.ar/_CustId_170366657_NoIndex_True';

  console.log('🚀 INICIANDO SCRAPER INDUSTRIAL - AUTO-MAC');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'] 
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    console.log(`🔎 Entrando a la tienda...`);
    await page.goto(urlActual, { waitUntil: 'networkidle2' });

    console.log('\n------------------------------------------------------------');
    console.log('1. Logueate si es necesario y resolvé Captchas.');
    console.log('2. Asegurate de que estás viendo los productos.');
    console.log('3. Apretá ENTER para iniciar el ciclo de 450 productos.');
    console.log('------------------------------------------------------------\n');

    await esperarEnter('¿Listo para empezar el escaneo largo? ENTER...');

    let todosLosLinks = [];
    let tieneSiguiente = true;
    let numPagina = 1;

    // FASE 1: RECOLECTAR TODOS LOS LINKS (PAGINACIÓN)
    while (tieneSiguiente) {
      console.log(`📄 Escaneando página ${numPagina}...`);
      
      // Scroll para asegurar carga
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 2000));

      const linksPagina = await page.evaluate(() => {
        const items = document.querySelectorAll('.ui-search-layout__item, .poly-card');
        return Array.from(items).map(item => {
          const a = item.querySelector('a[href*="MLA"]');
          const t = item.querySelector('h2, .poly-component__title');
          const p = item.querySelector('.andes-money-amount__fraction');
          return {
            link: a?.href,
            titulo: t?.innerText.trim(),
            precio: p?.innerText.replace(/\./g, '')
          };
        }).filter(x => x.link);
      });

      todosLosLinks.push(...linksPagina);
      console.log(`   ✅ +${linksPagina.length} links encontrados (Total: ${todosLosLinks.length})`);

      // Buscar botón "Siguiente"
      const siguienteBtn = await page.$('.andes-pagination__button--next a');
      if (siguienteBtn && todosLosLinks.length < 500) { // Límite de seguridad
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          siguienteBtn.click()
        ]);
        numPagina++;
        await new Promise(r => setTimeout(r, 2000));
      } else {
        tieneSiguiente = false;
      }
    }

    // Deduplicar links por las dudas
    const linksUnicos = [...new Map(todosLosLinks.map(item => [item.link, item])).values()];
    console.log(`\n🎯 Fase 1 terminada. Total único: ${linksUnicos.length} productos.`);

    // FASE 2: ENTRAR UNO POR UNO PARA SACAR FOTOS
    const productosFinales = [];
    
    for (let i = 0; i < linksUnicos.length; i++) {
      const p = linksUnicos[i];
      console.log(`📸 [${i + 1}/${linksUnicos.length}] Procesando: ${p.titulo.slice(0, 40)}...`);

      try {
        await page.goto(p.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const dataExtra = await page.evaluate(() => {
          // Buscamos fotos de la galería principal
          const imgs = document.querySelectorAll('.ui-pdp-gallery__figure img, .ui-pdp-gallery__thumbnail img');
          const urls = Array.from(imgs)
            .map(img => img.getAttribute('data-zoom') || img.getAttribute('data-src') || img.src)
            .filter(u => u && u.includes('http'))
            .map(u => u.replace(/-O\.webp|-O\.jpg/, '-F.webp')); // Calidad Alta
          
          return {
            fotos: [...new Set(urls)].slice(0, 5),
            descripcion: document.querySelector('.ui-pdp-description__content')?.innerText.trim() || ""
          };
        });

        productosFinales.push({
          id: p.link.split('/MLA-')[1]?.split('-')[0] || Math.random().toString(36).slice(2),
          titulo: p.titulo,
          precio: p.precio,
          descripcion: dataExtra.descripcion || p.titulo,
          fotos: dataExtra.fotos
        });

      } catch (e) {
        console.log(`   ⚠ Error en este producto, saltando...`);
      }

      // Pausa cada 5 productos para que ML no nos mate
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 1500));
      
      // Guardado parcial cada 50 productos por si se corta la luz o internet
      if (productosFinales.length % 50 === 0) {
        console.log('💾 Guardado parcial en Sheets por seguridad...');
        await saveToSheets(sheets, CLIENT_SHEET_ID, TAB_NAME, productosFinales, VENDEDOR_EMAIL);
      }
    }

    // FASE 3: GUARDADO FINAL
    await saveToSheets(sheets, CLIENT_SHEET_ID, TAB_NAME, productosFinales, VENDEDOR_EMAIL);
    console.log('✨ PROCESO COMPLETADO CON ÉXITO.');

  } catch (err) {
    console.error('❌ Error fatal:', err.message);
  } finally {
    await esperarEnter('ENTER para cerrar navegador...');
    await browser.close();
  }
}

async function saveToSheets(sheets, spreadsheetId, tab, data, email) {
  const range = `'${tab}'!A2:O`;
  const values = data.map(p => [
    email, p.id, p.titulo, p.precio, p.descripcion.slice(0, 500), 
    p.fotos[0] || '', 'Multimedia', 10, '', '', 
    p.fotos[1] || '', p.fotos[2] || '', p.fotos[3] || '', p.fotos[4] || '', ''
  ]);

  try {
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
    await sheets.spreadsheets.values.update({
      spreadsheetId, range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  } catch (err) {
    console.log('⚠ Error al escribir en Sheets:', err.message);
  }
}

runScraper();