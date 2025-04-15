const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 3000;

// Ruta del API
app.get('/ofertas', async (req, res) => {
    const termino = req.query.q || 'atencion';
    const ubicacion = req.query.ubi || 'lima';

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    await page.goto('https://pe.computrabajo.com', { waitUntil: 'load' });

    // Espera adicional por JS en modo headless
    await page.waitForTimeout(5000);

    try {
        await page.waitForSelector('#prof-cat-search-input', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('#place-search-input', { state: 'visible', timeout: 15000 });

        await page.fill('#place-search-input', ubicacion);
        await page.fill('#prof-cat-search-input', termino);

        // Esperamos navegación tras clic
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('#search-button')
        ]);

        const resultados = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.box_offer'));
            return items.map(item => {
                const data = {};

                const titulo = item.querySelector('h2.fs18 a.js-o-link.fc_base')?.innerText.trim();
                titulo ? data.titulo = titulo : null;

                const empresa = item.querySelector('p.fs16 a.fc_base.t_ellipsis')?.innerText.trim();
                empresa ? data.empresa = empresa:null;

                const ubicacion = item.querySelector('p.fs16.fc_base.mt5 span.mr10')?.parentElement?.innerText.trim();
                ubicacion ? data.ubicacion = ubicacion:null;

                const salario = item.querySelector('div.fs13 span.dIB.mr10')?.parentElement?.innerText.trim();
                salario ? data.salario = salario:null;

                return data;
            });
        });

        res.json({ resultados });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ error: 'No se pudieron obtener resultados' });
    } finally {
        await browser.close();
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});
