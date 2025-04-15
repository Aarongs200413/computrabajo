const { chromium } = require('playwright');

(async () => {
    // Lanzamos navegador con emulación de navegador real
    const browser = await chromium.launch({
        headless: true, // ✅ Modo sin cabeza
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    await page.goto('https://pe.computrabajo.com', { waitUntil: 'load' });

    // Esperamos por si tarda en cargar JS en modo headless
    await page.waitForTimeout(5000);

    // Esperamos a que aparezcan los campos de búsqueda
    await page.waitForSelector('#prof-cat-search-input', { state: 'visible', timeout: 15000 });
    await page.waitForSelector('#place-search-input', { state: 'visible', timeout: 15000 });

    // Escribimos términos
    await page.fill('#prof-cat-search-input', 'laravel php');
    await page.fill('#place-search-input', 'lima');

    // Hacemos clic en el botón de búsqueda
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('#search-button')
    ]);

    // Extraemos los resultados
    const resultados = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.box_offer'));
        return items.map(item => {
            const data = {};

            const titulo = item.querySelector('h2.fs18 a.js-o-link.fc_base')?.innerText.trim();
            if (titulo) data.titulo = titulo;

            const empresa = item.querySelector('p.fs16 a.fc_base.t_ellipsis')?.innerText.trim();
            if (empresa) data.empresa = empresa;

            const ubicacion = item.querySelector('p.fs16.fc_base.mt5 span.mr10')?.parentElement?.innerText.trim();
            if (ubicacion) data.ubicacion = ubicacion;

            const salario = item.querySelector('div.fs13 span.dIB.mr10')?.parentElement?.innerText.trim();
            if (salario) data.salario = salario;

            return data;
        });
    });

    console.log(resultados);
    await browser.close();
})();
