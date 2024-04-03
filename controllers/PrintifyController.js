
const { default: axios } = require('axios');
const cron = require("node-cron");
const PrintifyService = require('../services/PrintifyService');
const { searchProductPrintify, deleteProduct, addProduct, getComapnyCategoriesByName, createCategory, updateProduct, getVariant, addProductVariant } = require('../services/ProductService');

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

const stockQty = async (variants) => {
    const qty = variants.reduce((a, b) => a + b.quantity, 0)
    return qty;
}

const getVariants = async (variants) => {
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.is_available) {
            const checkVar = await getVariant(4)
            const varia = checkVar.find((val) => val.name === variant.title)
            if (varia) {
                return [{
                    attributeId: 4,
                    price_extra: (variant.price - variants[0]?.price) / 100,
                    valueId: varia.id
                }]
            } else {
                return [{
                    attributeId: 4,
                    price_extra: (variant.price - variants[0]?.price) / 100,
                    value: variant.title
                }]
            }
        }
    }))
    return res
}

class PrintifyController {

    constructor() {
        this.service = new PrintifyService();
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
     * This function getch product by shop
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    fetchProductByShop = async (shopId, companyLongId, companyShortId) => {
        // const attr = params.shopId;

        try {
            const products = await this.service.getShopProducts(shopId);
            for (const product of products.data) {
                const variantObj = {}
                product.variants.map((variant) => {
                    if (variant.is_available) {
                        variantObj[`${variant.title}`] = variant.id
                    }
                })
                const category = await feedCategory(product.tags[0], companyLongId)
                const qty = await stockQty(product.variants)
                const variants = await getVariants(product.variants)

                const body = {
                    name: product.title,
                    category_id: category.toString(),
                    uom_name: "1",
                    published: "true",
                    list_price: (product.variants[0]?.cost / 100)?.toString(),
                    description: product.description,
                    qty: qty,
                    weight: product.variants[0]?.gram,
                    images: JSON.stringify(product.images.map((image) => image.src)),
                    standard_price: (product.variants[0]?.price / 100)?.toString(),
                    company_id: companyShortId,
                    x_printify_id: product.id,
                    x_printify_variant_id: product.variants[0]?.id,
                    x_printify_shop_id: product.shop_id.toString()
                };

                if (Object.keys(variantObj).length > 0) {
                    body.x_printify_variant_id = JSON.stringify(variantObj)
                    body.variants = variants
                }

                console.log(body);
                const check = await searchProductPrintify(product.id, companyShortId)
                if (product.variants[0].is_available === false && check?.length > 0) {
                    await deleteProduct(check[0]?.id)
                    console.log("product deleted");
                } else {
                    if (check?.length === 0 && product.variants[0].is_available !== false) {
                        const res = await addProductVariant({ product: body })
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

}

const printifyCon = new PrintifyController

const runPrintifyDaily = () => {
    // cron.schedule("0 3 * * *", () => {
    //     console.log(`running field product daily at ${new Date().toLocaleString()}`);
    //     printifyCon.fetchProductByShop("15141891", "66055c3608bece50ea82bca0", 304)
    // })
    cron.schedule("0 6 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033405", "660c41884106500891da5e88", 7)
    })
    // cron.schedule("0 9 * * *", () => {
    //     console.log(`running field product daily at ${new Date().toLocaleString()}`);
    //     printifyCon.fetchProductByShop("15141701", "66054bda08bece50ea829206", 301)
    // })
    cron.schedule("0 12 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033377", "660c453e4106500891da63ad", 8)
    })
    // cron.schedule("0 15 * * *", () => {
    //     console.log(`running field product daily at ${new Date().toLocaleString()}`);
    //     printifyCon.fetchProductByShop("15145610", "660543b108bece50ea827aa5", 300)
    // })
    cron.schedule("0 18 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("14761883", "660c3ca14106500891da5954", 5)
    })
    // cron.schedule("0 21 * * *", () => {
    //     console.log(`running field product daily at ${new Date().toLocaleString()}`);
    //     printifyCon.fetchProductByShop("15149110", "660562ce08bece50ea82cfb6", 305)
    // })
}

module.exports = {
    printifyCon,
    runPrintifyDaily
}


