const express = require('express');
const { verifyKey, dropshipController, getDropshipProducts } = require('../controllers/dropshipController');
const router = express.Router();

router.post("/verify", verifyKey)
router.post("/products/add", dropshipController)
router.post("/products/get", getDropshipProducts)

module.exports = router;
