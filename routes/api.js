var express = require('express');
var router = express.Router();
const HeadlessChrome = require('simple-headless-chrome')
const browser = new HeadlessChrome({
  headless: true
})

router.get('/segments/url', function(req, res, next) {
  let url = req.query.url
  const product = getProductsByUrl(url, function (product) {
    console.log(product);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ product: product }));
  });
});

router.get('/products/url', function(req, res, next) {
  let url = req.query.url
  const product = getProductByUrl(url, function (product) {
    console.log(product);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ product: product }));
  });
});

router.get('/products/search', function(req, res, next) {
  let query = req.query.q
  const products = search(query, function (products) {
    console.log(products);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ products: products }));
  });
});

router.get('/products/bonus/next', function(req, res, next) {
  let options = {};
  if (req.headers.authorization) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')
    options = {
      user: login,
      password: password
    }
  }
  const products = getNextBonus(options, function (products) {
    console.log(products);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ products: products }));
  });
});

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

router.get('/products/:sku', function(req, res, next) {
  let sku = req.params.sku
  console.log(sku);
  const product = getProductBySku(sku, function (product) {
    console.log(product);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ product: product }));
  });
});

module.exports = router;

async function getProductBySku(sku, callback) {
  try {
    await browser.init()
    const mainTab = await browser.newTab({ privateTab: false })
    console.log('Crawling');
    await mainTab.goTo(`https://www.ah.nl/producten/product/${sku}`)
    await mainTab.wait(1000)
    const selectorHtml = await mainTab.evaluate(function(selector) {
      productHtml = document.querySelectorAll('.product')[0]
      const name = $(productHtml).find('.product-description__title')[0].innerText;
      const image = $(productHtml).find('img')[0].src;
      let price = 0;
      if ($(productHtml).find('.product-price')[0]) {
        price = $(productHtml).find('.product-price')[0].innerText;
      }
      const link = window.location.href;
      const sku = $(productHtml).data('sku');
      const product = {
        name,
        image,
        price,
        link,
        sku
      }
      return product
    }, '.product');
    await browser.close()
    callback(selectorHtml.result.value);
  } catch (err) {
    console.log('ERROR!', err)
  }
}

async function getProductByUrl(url, callback) {
  try {
    await browser.init()
    const mainTab = await browser.newTab({ privateTab: false })
    console.log('Crawling');
    await mainTab.goTo(`${url}`)
    await mainTab.wait(1000)
    const selectorHtml = await mainTab.evaluate(function(selector) {
      productHtml = document.querySelectorAll('.product')[0]
      const name = $(productHtml).find('.product-description__title')[0].innerText;
      const image = $(productHtml).find('img')[0].src;
      let price = 0;
      if ($(productHtml).find('.product-price')[0]) {
        price = $(productHtml).find('.product-price')[0].innerText;
      }
      const link = window.location.href;
      const sku = $(productHtml).data('sku');
      const product = {
        name,
        image,
        price,
        link,
        sku
      }
      return product
    }, '.product');
    await browser.close()
    callback(selectorHtml.result.value);
  } catch (err) {
    console.log('ERROR!', err)
  }
}

async function getProductsByUrl(url, callback) {
  try {
    await browser.init()
    const mainTab = await browser.newTab({ privateTab: false })
    console.log('Crawling');
    await mainTab.goTo(`${url}`)
    await mainTab.injectScript("function pageScroll() { window.scrollBy(0, 200); scrolldelay = setTimeout('pageScroll()', 100); }")
    const htmlTag = await mainTab.evaluate(function() {
      pageScroll();
    });
    await mainTab.wait(5000)
    const selectorHtml = await mainTab.evaluate(function(selector) {
      products = [];
      productsHtml = document.querySelectorAll('.product')
      productsHtml.forEach(function(productHtml, index) {
        const name = $(productHtml).find('.product-description__title')[0].innerText;
        const image = $(productHtml).find('img')[0].src;
        let price = 0;
        if ($(productHtml).find('.product-price')[0]) {
          price = $(productHtml).find('.product-price')[0].innerText;
        }
        const link = $(productHtml).find('.product__content--link')[0].href;
        const sku = $(productHtml).data('sku');
        const product = {
          name,
          image,
          price,
          link,
          sku
        }
        console.log(product);
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

async function search(query, callback) {
  try {
    await browser.init()
    const mainTab = await browser.newTab({ privateTab: false })
    console.log('Crawling');
    await mainTab.goTo(`https://www.ah.nl/zoeken?rq=${query}&searchType=global`)
    await mainTab.injectScript("function pageScroll() { window.scrollBy(0, 200); scrolldelay = setTimeout('pageScroll()', 100); }")
    const htmlTag = await mainTab.evaluate(function() {
      pageScroll();
    });
    await mainTab.wait(10000)
    const selectorHtml = await mainTab.evaluate(function(selector) {
      products = [];
      productsHtml = document.querySelectorAll('.product')
      productsHtml.forEach(function(productHtml, index) {
        const name = $(productHtml).find('.product-description__title')[0].innerText;
        const image = $(productHtml).find('img')[0].src;
        let price = 0;
        if ($(productHtml).find('.product-price')[0]) {
          price = $(productHtml).find('.product-price')[0].innerText;
        }
        const link = $(productHtml).find('.product__content--link')[0].href;
        const sku = $(productHtml).data('sku');
        const product = {
          name,
          image,
          price,
          link,
          sku
        }
        console.log(product);
        products.push(product)
      });
      return products
    }, '.product');
    // await browser.close()
    callback(selectorHtml.result.value);
  } catch (err) {
    console.log('ERROR!', err)
  }
}

async function getNextBonus(options = {}, callback) {
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
        let sku = '';
        if ($(productHtml).data('sku')) {
          sku = $(productHtml).data('sku');
        }
        let type = 'unknown';
        if (sku !== '' && sku.match(/wi/gi)) {
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
    }, '.product');
    await browser.close()
    callback(selectorHtml.result.value);
  } catch (err) {
    console.log('ERROR!', err)
  }
}

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
    await mainTab.goTo('https://www.ah.nl/bonus')
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
    }, '.product');
    await browser.close()
    callback(selectorHtml.result.value);
  } catch (err) {
    console.log('ERROR!', err)
  }
}
