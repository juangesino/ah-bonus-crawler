const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

router.get('/products/bonus', function(req, res, next) {
  let options = {};
  if (req.headers.authorization) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')
    options = {
      user: login,
      password: password
    }
  }
  const products = getBonus(options, function (products) {
    console.log(products);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ products: products }));
  });
});

module.exports = router;

async function getBonus(options = {}, callback) {
  const browser = await puppeteer.launch({
    headless: false,
    args : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
  console.log(options);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36');
  await page.setViewport({ width: 1110, height: 740 });
  if (options.user && options.password) {
    console.log('Auth');
    await page.goto(`https://www.ah.nl/mijn/inloggen`, {waitUntil: 'networkidle2'});
    await page.type('input#username', options.user);
    await page.type('input#password', options.password);
    await page.click('button.login-form__submit')
  }
  await page.goto('https://www.ah.nl/bonus')
  await page.waitFor(5000);
  const result = await page.evaluate(() => {
    products = [];
    productsHtml = document.querySelectorAll('.product')
    productsHtml.forEach(function(productHtml, index) {
      const name = $(productHtml).find('.product-description h1')[0].innerText;
      let discount = '';
      if ($(productHtml).find('.discount-block')[0]) {
        discount = $(productHtml).find('.discount-block')[0].innerText;
      }
      const image = $(productHtml).find('img')[0].src;
      let newPrice = 0;
      let oldPrice = 0;
      if ($(productHtml).find('.price--discount')[0]) {
        newPrice = $(productHtml).find('.price--discount')[0].innerText;
        oldPrice = $(productHtml).find('.price--was')[0].innerText;
      } else if ($(productHtml).find('.product-price')[0]) {
        newPrice = $(productHtml).find('.product-price')[0].innerText;
        oldPrice = newPrice;
      }
      let sku = '';
      if ($(productHtml).data('sku')) {
        sku = $(productHtml).data('sku');
      }
      let type = 'unknown';
      if (sku !== '' && sku.toString().match(/wi/gi)) {
        type = 'product';
      } else {
        type = 'segment';
      }
      const link = $(productHtml).find('.product__content--link')[0].href;
      const product = {
        name,
        discount,
        image,
        newPrice,
        oldPrice,
        link,
        sku,
        type
      }
      products.push(product)
    });
    return products
  });
  await browser.close()
  callback(result);
}
