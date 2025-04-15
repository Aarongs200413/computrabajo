const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://pe.computrabajo.com', { waitUntil: 'networkidle2' });

  await page.waitForSelector('#prof-cat-search-input');
  await page.waitForSelector('#place-search-input');

  await page.type('#prof-cat-search-input', 'laravel php');
  await page.type('#place-search-input', 'lima');

  await page.click('#search-button');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Extraer resultados (lista)
  const resultados = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.box_offer'));
    return items.map(item => {
      const titulo = item.querySelector('h2.fs18 a.js-o-link.fc_base');
      const empresa = item.querySelector('p.fs16 a.fc_base.t_ellipsis');
      const ubicacion = item.querySelector('p.fs16.fc_base.mt5 span.mr10')?.parentElement?.innerText.trim();
      const salario = item.querySelector('div.fs13 span.dIB.mr10')?.parentElement?.innerText.trim();

      return {
        titulo: titulo?.innerText.trim(),
        link: titulo?.href,
        empresa: empresa?.innerText.trim(),
        ubicacion,
        salario,
      };
    });
  });

  console.log('\nLista de empleos:\n');
  resultados.forEach((item, i) => {
    console.log(`[${i}] ${item.titulo} - ${item.empresa}`);
  });

  // Simulamos hacer clic en el primero (puedes cambiar el índice)
  const index = 0;
  const urlDetalle = resultados[index].link;

  console.log(`\nObteniendo detalles de: ${urlDetalle}\n`);

  // Abrimos nueva pestaña con el detalle
  const detailPage = await browser.newPage();
  await detailPage.goto(urlDetalle, { waitUntil: 'networkidle2' });

  const detalle = await detailPage.evaluate(() => {  
    const titulo = document.querySelector('div.mb40.pb40.bb1')?.innerText;
    const descripcion = document.querySelector('p.fwB.fs16')?.innerText;
    const requisitos = document.querySelector('div.bRequ')?.innerText.trim();
  
    return {
      titulo,
      descripcion,
      requisitos
    };
  });

  console.log(`Detalles del empleo:\n`, detalle);

  await browser.close();
})();
