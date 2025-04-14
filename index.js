const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Usa true para que sea invisible
    const page = await browser.newPage();
    await page.goto('https://pe.computrabajo.com', { waitUntil: 'networkidle2' });

    // Esperar al input de búsqueda
    await page.waitForSelector('#prof-cat-search-input');

    // Escribir la búsqueda
    await page.type('#prof-cat-search-input', 'call center');

    // Hacer clic en el botón de buscar
    await page.click('#search-button');

    // Esperar a que cargue la siguiente página con resultados
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Extraer resultados
    const resultados = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.box_offer'));
        return items.map(item => {
            const titulo = item.querySelector('.fs18')?.innerText.trim() || '';
            const empresa = item.querySelector('.fs16')?.innerText.trim() || '';
            const ubicacion = item.querySelector('.icon-location')?.parentElement?.innerText.trim() || '';
            return { titulo, empresa, ubicacion };
        });
    });

    console.log(resultados);

    await browser.close();
})();
