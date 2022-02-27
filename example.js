const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://stackshare.io/playwright/alternatives', {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({ path: './exported/example.png', fullPage: true });
  await page.pdf({ path: './exported/hn.pdf', format: 'tabloid', printBackground: true, preferCSSPageSize: true });
  

  await browser.close();
})();