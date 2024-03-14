const express = require('express');
const { createOrder } = require('../controllers/brandgatecontroller');
const router = express.Router();

router.post("/order/creater", createOrder)

module.exports = router