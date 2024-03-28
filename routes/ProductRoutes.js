const express = require('express');
const router = express.Router();

const { printifyCon } = require('../controllers/PrintifyController');


// POST route to create a new product
// router.post('/', printifyCon.saveProduct);
router.put('/details/:id/update', printifyCon.updateProduct);
router.get('/', printifyCon.fetchProducts);
router.get('/shops', printifyCon.fetchShops);
router.get('/shop-products', printifyCon.fetchProductByShop);
router.post('/order/create/:id', printifyCon.createOrder)
// router.get('/user', printifyCon.getAllProducts);

module.exports = router;
