const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

// Ruteamos el API
app.get('/ofertas', async (req, res) => {
    const termino = req.query.q || 'atencion';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://pe.computrabajo.com', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#prof-cat-search-input');
    await page.type('#prof-cat-search-input', termino);
    await page.click('#search-button');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const resultados = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.box_offer'));
        return items.map(item => {
            const titulo = item.querySelector('.fs18')?.innerText.trim() || '';
            const empresa = item.querySelector('.fs16')?.innerText.trim() || '';
            return { titulo, empresa };
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
