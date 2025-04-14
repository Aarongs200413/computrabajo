const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Usa true para que sea invisible
    const page = await browser.newPage();
    await page.goto('https://pe.computrabajo.com', { waitUntil: 'networkidle2' });

    // Esperar al input de búsqueda
    await page.waitForSelector('#prof-cat-search-input');

    // Escribir la búsqueda
    await page.type('#prof-cat-search-input', 'atencion al cliente');

    // Hacer clic en el botón de buscar
    await page.click('#search-button');

    // Esperar a que cargue la siguiente página con resultados
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Extraer resultados
    const resultados = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.box_offer'));
        return items.map(item => {
            const titulo = item.querySelector('h2.fs18 a.js-o-link.fc_base')?.innerText.trim() || '';
            const empresa = item.querySelector('p.fs16 a.fc_base.t_ellipsis')?.innerText.trim() || '';
            const ubicacion = item.querySelector('p.fs16.fc_base.mt5 span.mr10')?.parentElement?.innerText.trim() || '';
            const salario = item.querySelector('div.fs13 span.dIB.mr10')?.parentElement?.innerText.trim() || '';
            return { titulo, empresa, ubicacion, salario };
        });
    });

    console.log(resultados);

    //Convertir a csv:
    const parser = new Parser(); 
    const csv = parser.parse(resultados);
    fs.writeFileSync('resultados.csv', csv, 'utf8');
    console.log('Se genero csv');

    await browser.close();
})();
