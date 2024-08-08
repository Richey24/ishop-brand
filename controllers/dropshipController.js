const { default: axios } = require("axios");
const Odoo = require("../odoo");
const Company = require("../model/company");
const feedGelato = require("../services/Gelato");
const feedPrintful = require("../services/Printful");
const { getProductsIDs } = require("../services/ProductService");
const feedPrintify = require("../services/Printify");


const dropshipController = async (req, res) => {
    try {
        const { companyShortId, companyLongId, shopID, apiKey, dropshipType, productIds } = req.body
        if (!shopID || !apiKey || !dropshipType || !companyLongId || !companyShortId) {
            return res.status(400).json({ message: "Send shopID, apiKey, dropshipType, companyShortId, companyLongId" })
        }
        if (dropshipType === "printful") {
            await feedPrintful(companyShortId, companyLongId, shopID, apiKey, productIds)
        } else if (dropshipType === "gelato") {
            await feedGelato(companyShortId, companyLongId, shopID, apiKey, productIds)
        } else if (dropshipType === "printify") {
            await feedPrintify(companyShortId, companyLongId, shopID, apiKey, productIds)
        }
        res.status(200).json({ message: "successful" })
    } catch (error) {
        console.log("500", error);
    }
}

const verifyKey = async (req, res) => {
    try {
        const { apiKey, dropshipType, shopID } = req.body
        if (!apiKey || !dropshipType) {
            return res.status(400).json({ message: "Send shopID, apiKey, dropshipType" })
        }
        if (dropshipType === "printful") {
            const responsePro = await axios.get(`https://api.printful.com/stores`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                validateStatus: false
            })
            return res.status(responsePro.status).json({ message: responsePro.data.error ? responsePro.data.error : responsePro.data.result })
        }
        if (dropshipType === "gelato") {
            const result = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products`, {
                headers: {
                    "X-API-KEY": apiKey
                },
                validateStatus: false
            })
            return res.status(result.status).json({ message: result.status !== 200 ? "Invalid Api Key Or Shop ID" : "Successful" })
        }
        if (dropshipType === "printify") {
            const response = await axios.get(`https://api.printify.com/v1/shops.json`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                },
                validateStatus: false
            })
            return res.status(response.status).json({ message: response.status === 200 ? response.data : response.data.error })
        }
        return res.status(400).json({ message: "send either printful or gelato or printify as dropshipType" })
    } catch (error) {
        res.status(500).json({ message: "error occur" })
    }
}

const getDropshipProducts = async (req, res) => {
    try {
        const { apiKey, shopID, dropshipType, offset = 1 } = req.body
        if (!shopID || !apiKey || !dropshipType) {
            return res.status(400).json({ message: "Send shopID, apiKey, dropshipType" })
        }
        if (dropshipType === "printful") {
            const theProducts = []
            const paginated = await axios.get(`https://api.printful.com/store/products?limit=10&offset=${offset - 1}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "X-PF-Store-Id": shopID
                }
            })
            const mainProducts = paginated.data
            await Odoo.connect();
            const productIds = await getProductsIDs("x_printful_shop_id", "x_printful_id", shopID)
            for (const product of mainProducts.result) {
                const result = await axios.get(`https://api.printful.com/store/products/${product.id}`, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "X-PF-Store-Id": shopID
                    }
                })
                const productDetail = result.data?.result
                theProducts.push({
                    name: product.name,
                    id: product.id,
                    price: productDetail.sync_variants[0]?.retail_price,
                    images: product.thumbnail_url,
                    shopID: shopID,
                    imported: productIds?.includes(product.id?.toString())
                })
            }
            res.status(200).json({ products: theProducts, total: mainProducts.paging?.total })
        } else if (dropshipType === "gelato") {
            const response = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products?offset=${offset}&limit=10`, {
                headers: {
                    "X-API-KEY": apiKey
                }
            })
            const products = response.data?.products
            const paginated = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products`, {
                headers: {
                    "X-API-KEY": apiKey
                }
            })
            const total = paginated.data?.products
            await Odoo.connect();
            const productIds = await getProductsIDs("x_gelato_shop_id", "x_gelato_id", shopID)
            let result = []
            for (const product of products) {
                const priceResult = await axios.get(`https://product.gelatoapis.com/v3/products/${product.variants[0]?.productUid}/prices`, {
                    headers: {
                        "X-API-KEY": apiKey
                    }
                })
                const price = priceResult.data
                result.push({
                    name: product.title,
                    id: product.id,
                    price: price[0].price,
                    images: product.previewUrl,
                    shopID: shopID,
                    imported: productIds?.includes(product.id)
                })
            }
            return res.status(200).json({ products: result, total: total?.length })
        } else if (dropshipType === "printify") {
            const responsePro = await axios.get(`https://api.printify.com/v1/shops/${shopID}/products.json?page=${offset}&limit=10`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            })
            const products = responsePro.data
            await Odoo.connect();
            const productIds = await getProductsIDs("x_printify_shop_id", "x_printify_id", shopID)
            const theProducts = products.data?.map((product) => ({
                name: product.title,
                id: product.id,
                price: (product.variants[0]?.price / 100).toFixed(2),
                images: product.images[0].src,
                shopID: shopID,
                imported: productIds?.includes(product.id.toString())
            }))
            res.status(200).json({ products: theProducts, total: products.total })
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
