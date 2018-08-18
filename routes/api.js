var express = require('express');
var router = express.Router();
const HeadlessChrome = require('simple-headless-chrome')
const browser = new HeadlessChrome({
  headless: true
})

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
  console.log(options);
  try {
    await browser.init()
    const mainTab = await browser.newTab({ privateTab: false })
    if (options.user && options.password) {
      console.log('Auth');
      await mainTab.goTo('https://www.ah.nl/mijn/inloggen')
      await mainTab.waitForSelectorToLoad('input#username')
      await mainTab.wait(500)
      await mainTab.type('input#username', options.user)
      await mainTab.type('input#password', options.password)
      await mainTab.click('button.login-form__submit')
      await mainTab.wait(1000)
    }
    console.log('Crawling');
    await mainTab.goTo('https://www.ah.nl/bonus/volgende-week')
    await mainTab.injectScript("function pageScroll() { window.scrollBy(0, 200); scrolldelay = setTimeout('pageScroll()', 100); }")
    const htmlTag = await mainTab.evaluate(function() {
      pageScroll();
    });
    await mainTab.wait(10000)
    const selectorHtml = await mainTab.evaluate(function(selector) {
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
        const link = $(productHtml).find('.product__content--link')[0].href;
        const product = {
          name,
          discount,
          image,
          newPrice,
          oldPrice,
          link
        }
        products.push(product)
      });
      return products
    }, '.product');
    await browser.close()
    callback(selectorHtml.result.value);
  } catch (err) {
    console.log('ERROR!', err)
  }
}
