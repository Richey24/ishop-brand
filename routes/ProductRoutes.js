const express = require('express');
const router = express.Router();

const { printifyCon, getShippingRates } = require('../controllers/PrintifyController');


router.get('/shops', printifyCon.fetchShops);
router.get("/shipping/:id", getShippingRates)

module.exports = router;
