const express = require("express");
const { feedProduct } = require("../controllers/brandgatecontroller");


const router = express.Router()

router.get("/feed/products", feedProduct)

module.exports = router