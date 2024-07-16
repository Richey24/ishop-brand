const { default: axios } = require("axios");
const Odoo = require("../odoo");
const Company = require("../model/company");
const feedGelato = require("../services/Gelato");
const feedPrintful = require("../services/Printful");
const { getPrintfulProductsIDs } = require("../services/ProductService");
const feedPrintify = require("../services/Printify");


const dropshipController = async (req, res) => {
    try {
        const { shopID, apiKey, dropshipType, productIds } = req.body
        if (!shopID || !apiKey || !dropshipType) {
            return res.status(400).json({ message: "Send shopID, apiKey, dropshipType" })
        }
        if (dropshipType === "printful") {
            await feedPrintful(shopID, apiKey, productIds)
        } else if (dropshipType === "gelato") {
            await feedGelato(shopID, apiKey, productIds)
        } else if (dropshipType === "printify") {
            await feedPrintify(shopID, apiKey, productIds)
        }
        res.status(200).json({ message: "successful" })
    } catch (error) {
        console.log("500", error);
    }
}

const verifyKey = async (req, res) => {
    try {
        const { shopID, apiKey, dropshipType } = req.body
        if (!shopID || !apiKey || !dropshipType) {
            return res.status(400).json({ message: "Send shopID, apiKey, dropshipType" })
        }
        if (dropshipType === "printful") {
            const responsePro = await axios.get(`https://api.printful.com/store/products`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "X-PF-Store-Id": shopID
                },
                validateStatus: false
            })
            return res.status(responsePro.status).json({ message: responsePro.data.error ? responsePro.data.error : "Successful" })
        }
        if (dropshipType === "gelato") {
            const result = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products`, {
                headers: {
                    "X-API-KEY": apiKey
                },
                validateStatus: false
            })
            return res.status(result.status).json({ message: responsePro.data.message ? responsePro.data.message : "Successful" })
        }
        if (dropshipType === "printify") {
            const response = await axios.get(`https://api.printify.com/v1/shops/${shopID}/products.json`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            })
            return res.status(response.status).json({ message: response.status === 200 ? "Successful" : response.data.error })
        }
        return res.status(400).json({ message: "send either printful or gelato or printify as dropshipType" })
    } catch (error) {
        res.status(500).json({ message: "error occur" })
    }
}

const getDropshipProducts = async (req, res) => {
    try {
        const { apiKey, shopID, dropshipType, offset, notImported } = req.body
        if (dropshipType === "printful") {
            const theProducts = []
            const responsePro = await axios.get(`https://api.printful.com/store/products`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "X-PF-Store-Id": shopID
                }
            })
            const products = responsePro.data
            for (let i = 0; i <= Math.ceil(products.paging.total / 100); i++) {
                const paginated = await axios.get(`https://api.printful.com/store/products?limit=100&offset=${i}`, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "X-PF-Store-Id": shopID
                    }
                })
                const mainProducts = paginated.data
                await Odoo.connect();
                const productIds = await getPrintfulProductsIDs(shopID)
                for (const product of mainProducts.result) {
                    const result = await axios.get(`https://api.printful.com/store/products/${product.id}`, {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "X-PF-Store-Id": shopID
                        }
                    })
                    const productDetail = result.data
                    if (notImported && !productIds?.includes(product.id)) {
                        notImportedProducts.push({
                            id: product.id,
                            price: productDetail.variants[0]?.retail_price.toFixed(2),
                            images: product.thumbnail_url,
                            shopID: shopID,
                            imported: productIds?.includes(product.id)
                        })
                    } else {
                        notImportedProducts.push({
                            id: product.id,
                            price: productDetail.variants[0]?.retail_price.toFixed(2),
                            images: product.thumbnail_url,
                            shopID: shopID,
                            imported: productIds?.includes(product.id)
                        })
                    }
                    if (theProducts.length >= 10) break
                }
                if (theProducts.length >= 10) break
            }
            res.status(200).json(theProducts)
        } else if (dropshipType === "gelato") {
            const response = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products`, {
                headers: {
                    "X-API-KEY": apiKey
                }
            })
            const products = response.data
            await Odoo.connect();
            const productIds = await getPrintfulProductsIDs(shopID)
            let result = []
            for (const product of products) {
                const priceResult = await axios.get(`https://product.gelatoapis.com/v3/products/${product.variants[0]?.productUid}/prices`, {
                    headers: {
                        "X-API-KEY": apiKey
                    }
                })
                const price = priceResult.data
                result.push({
                    id: product.id,
                    price: price,
                    images: product.previewUrl,
                    shopID: shopID,
                    imported: productIds?.includes(product.id)
                })
            }
            if (notImported) {
                result = result.filter((resu) => resu.imported !== true)
            }
            return res.status(200).json(result?.slice((offset * 10) - 10, offset * 10))
        } else if (dropshipType === "printify") {
            const theProducts = []
            const responsePro = await axios.get(`https://api.printify.com/v1/shops/${shopID}/products.json`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            })
            const products = responsePro.data
            for (let i = 0; i <= Math.ceil(products.paging.total / 100); i++) {
                const paginated = await axios.get(`https://api.printify.com/v1/shops/${shopID}/products.json?page=${i}`, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`
                    }
                })
                const mainProducts = paginated.data
                await Odoo.connect();
                const productIds = await getPrintfulProductsIDs(shopID)
                for (const product of mainProducts.result) {
                    if (notImported && !productIds?.includes(product.id)) {
                        notImportedProducts.push({
                            id: product.id,
                            price: (product.variants[0]?.price / 100).toFixed(2),
                            images: product.images[0].src,
                            shopID: shopID,
                            imported: productIds?.includes(product.id)
                        })
                    } else {
                        notImportedProducts.push({
                            id: product.id,
                            price: (product.variants[0]?.price / 100).toFixed(2),
                            images: product.images[0].src,
                            shopID: shopID,
                            imported: productIds?.includes(product.id)
                        })
                    }
                    if (theProducts.length >= 10) break
                }
                if (theProducts.length >= 10) break
            }
            res.status(200).json(theProducts)
        }
    } catch (error) {
        res.status(500).json({ message: "error occur" })
    }
}

module.exports = {
    dropshipController,
    verifyKey,
    getDropshipProducts
}