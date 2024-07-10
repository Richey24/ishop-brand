const express = require('express');
const { verifyKey, dropshipController } = require('../controllers/dropshipController');
const router = express.Router();

router.post("/verify", verifyKey)
router.post("products/add", dropshipController)

module.exports = router;
