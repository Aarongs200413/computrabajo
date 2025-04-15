const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://pe.computrabajo.com', { waitUntil: 'networkidle2' });

    // Esperar al input de búsqueda
    await page.waitForSelector('#prof-cat-search-input');
    await page.waitForSelector('#place-search-input');

    // Escribir la búsqueda
    await page.type('#prof-cat-search-input', 'laravel php');
    await page.type('#place-search-input','lima');

    // Hacer clic en el botón de buscar
    await page.click('#search-button');

    // Esperar a que cargue la siguiente página con resultados
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Extraer resultados
    const resultados = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.box_offer'));
        return items.map(item => {
            const data = {};

            const titulo = item.querySelector('h2.fs18 a.js-o-link.fc_base')?.innerText.trim();
            titulo ? data.titulo = titulo : null;

            const empresa = item.querySelector('p.fs16 a.fc_base.t_ellipsis')?.innerText.trim();
            empresa ? data.empresa = empresa : null;

            const ubicacion = item.querySelector('p.fs16.fc_base.mt5 span.mr10')?.parentElement?.innerText.trim();
            ubicacion ? data.ubicacion = ubicacion : null;

            const salario = item.querySelector('div.fs13 span.dIB.mr10')?.parentElement?.innerText.trim();
            salario ? data.salario = salario : null;

            return data;
        });
    });

    console.log(resultados);
    await browser.close();
})();
