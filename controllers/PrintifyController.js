
const { default: axios } = require('axios');
const cron = require("node-cron");
const PrintifyService = require('../services/PrintifyService');
const { searchProductPrintify, deleteProduct, addProduct, getComapnyCategoriesByName, createCategory, updateProduct } = require('../services/ProductService');

const feedCategory = async (category, companyLongId) => {
    let theCat;
    const checkCat = await getComapnyCategoriesByName(category, companyLongId)
    if (checkCat) {
        theCat = checkCat.id
    } else {
        console.log("creating category");
        const getCatID = await createCategory(category, companyLongId)
        theCat = getCatID
    }
    return theCat
}

class PrintifyController {

    constructor() {
        this.service = new PrintifyService();
    }

    fetchProducts = async (req, res) => {
        try {
            const catalogs = await this.service.getCatalogs();
            return res.status(200).json({ status: true, catalogs });
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Something when wrong while trying to catalogs' })
        }
    }

    /**
     * This function fetch shops
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    fetchShops = async (req, res) => {
        try {
            const shops = await this.service.getAllShops();
            return res.status(200).json({ status: true, shops })
        } catch (err) {
            return res.status(500).json({ status: false, message })
        }
    }

    /**
     * This function getch product by ship
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    fetchProductByShop = async (shopId, companyLongId, companyShortId) => {
        // const attr = params.shopId;

        try {
            const products = await this.service.getShopProducts(shopId);
            console.log(products);
            for (const product of products.data) {
                const category = await feedCategory(product.tags[0], companyLongId)
                const body = {
                    name: product.title,
                    category_id: category.toString(),
                    uom_name: "1",
                    published: "true",
                    list_price: product.variants[0]?.cost?.toString(),
                    description: product.description,
                    qty: product.variants[0]?.quantity,
                    weight: product.variants[0]?.gram,
                    images: JSON.stringify(product.images.map((image) => image.src)),
                    standard_price: product.variants[0]?.price?.toString(),
                    company_id: companyShortId,
                    x_printify_id: product.id,
                    x_printify_variant_id: product.variants[0]?.id,
                    x_printify_shop_id: product.shop_id.toString()
                    // variants: JSON.stringify(product.variants),
                };
                const check = await searchProductPrintify(product.id, companyShortId)
                if (product.variants[0].is_available === false && check?.length > 0) {
                    await deleteProduct(check[0]?.id)
                    console.log("product deleted");
                } else {
                    if (check?.length === 0) {
                        const res = await addProduct({ product: body })
                        console.log(res, companyShortId)
                    } else {
                        await updateProduct({ product: body, productId: check[0]?.id })
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Update Shop Product
     * @param {*} req 
     * @param {*} res 
     */
    updateProduct = async (req, res) => {

        const attributes = {
            data: req.body,
            shopId: shopId,
            productId: req.params.productId
        }

        try {
            const products = this.service.updateProduct(attributes);
            return res.status(200).json({ status: true, products });
        } catch (error) {
            console.error('Something when wrong while trying update sop products', error)
            return res.status(500).json({ status: false, error });
        }
    }

    createOrder = async (req, res) => {
        try {
            const body = req.body
            const shopId = req.params.id
            if (!body) {
                return res.status(200).json({ message: "send request body" })
            }
            const order = await this.service.createOrder(shopId, body)
            console.log(order);
            res.status(200).json(order)
        } catch (error) {

        }
    }

}

const printifyCon = new PrintifyController

const runPrintifyDaily = () => {
    cron.schedule("0 3 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15141891", "66055c3608bece50ea82bca0", 304)
    })
    cron.schedule("0 6 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033405", "65fa2e797ac9c593c0c32cce", 286)
    })
    cron.schedule("0 9 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15141701", "66054bda08bece50ea829206", 301)
    })
    cron.schedule("0 12 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033377", "65fafa76c51e02de041b2f7f", 288)
    })
    cron.schedule("0 15 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15145610", "660543b108bece50ea827aa5", 300)
    })
    cron.schedule("0 18 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("14761883", "65fa0bf718cfd854f818a1a8", 285)
    })
    cron.schedule("0 21 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15149110", "660562ce08bece50ea82cfb6", 305)
    })
}

module.exports = {
    printifyCon,
    runPrintifyDaily
}


