const express = require('express');
const router = express.Router();

const { printifyCon } = require('../controllers/PrintifyController');


router.get('/shops', printifyCon.fetchShops);

module.exports = router;
