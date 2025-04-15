const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

// Ruteamos el API
app.get('/ofertas', async (req, res) => {
    const termino = req.query.q || 'atencion';
    const ubicacion = req.query.ubi || 'lima';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://pe.computrabajo.com', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#prof-cat-search-input');
    await page.waitForSelector('#place-search-input');

    await page.type('#place-search-input', ubicacion);
    await page.type('#prof-cat-search-input', termino);
    await page.click('#search-button');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

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
    // Cerramos el navegador
    await browser.close();
    res.json({ resultados });
});

// Llamamos al server
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});
