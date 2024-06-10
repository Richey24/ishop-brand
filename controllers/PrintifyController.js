
const { default: axios } = require('axios');
const cron = require("node-cron");
const PrintifyService = require('../services/PrintifyService');
const Odoo = require("../odoo");
const { searchProductPrintify, deleteProduct, getComapnyCategoriesByName, createCategory, updateProduct, getVariant, addProductVariant } = require('../services/ProductService');

const feedCategory = async (category, companyLongId) => {
    let theCat;
    const checkCat = await getComapnyCategoriesByName(category, companyLongId)
    if (checkCat) {
        theCat = checkCat.id
    } else {
        const getCatID = await createCategory(category, companyLongId)
        console.log("created category", getCatID);
        theCat = getCatID
    }
    return theCat
}

const stockQty = async (variants) => {
    const qty = variants.reduce((a, b) => a + b.quantity, 0)
    return qty;
}

const getVariants = async (variants) => {
    const checkVar = await getVariant(4)
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.is_available) {
            const varia = checkVar.find((val) => val.name === variant.title)
            if (varia) {
                return [{
                    attributeId: 4,
                    price_extra: ((variant.price - variants[0]?.price) / 100).toFixed(2),
                    valueId: varia.id
                }]
            } else {
                return [{
                    attributeId: 4,
                    price_extra: ((variant.price - variants[0]?.price) / 100).toFixed(2),
                    value: variant.title
                }]
            }
        } else {
            return
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
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
            const products = await this.service.getShopProducts(shopId);
            for (let i = 1; i <= Math.ceil(products.total / products.to); i++) {
                console.log("sad");
                const paginated = await axios.get(`https://api.printify.com/v1/shops/${shopId}/products.json?page=${i}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const mainProducts = paginated.data
                await Odoo.connect();
                for (const product of mainProducts.data.slice(16)) {
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
                        list_price: (product.variants[0]?.cost / 100).toFixed(2),
                        description: product.description,
                        qty: qty,
                        weight: product.variants[0]?.grams,
                        images: JSON.stringify(product.images.map((image) => image.src)),
                        standard_price: (product.variants[0]?.price / 100).toFixed(2),
                        company_id: companyShortId,
                        x_printify_id: product.id,
                        x_printify_variant_id: product.variants[0]?.id,
                        x_printify_shop_id: product.shop_id.toString()
                    };

                    if (Object.keys(variantObj).length > 0) {
                        body.x_printify_variant_id = JSON.stringify(variantObj)
                        body.variants = variants
                    }
                    // console.log(body);
                    const check = await searchProductPrintify(product.id, companyShortId)
                    if (check?.length > 1) {
                        const arr = check.shift()
                        check.forEach(async (che) => {
                            await deleteProduct(che?.id)
                            console.log("duplicate product deleted");
                        })
                        check.unshift(arr)
                    }
                    if (product.variants[0].is_available === false && check?.length > 0) {
                        await deleteProduct(check[0]?.id)
                        console.log("product deleted");
                    } else {
                        if (check?.length === 0 && body.variants.length !== 0) {
                            const res = await addProductVariant({ product: body })
                            console.log("created-->", res, companyShortId)
                        } else {
                            await updateProduct({ product: body, productId: check[0]?.id })
                        }
                    }
                }
            }
        } catch (err) {
            console.log("500", err);
        }
    }

}

const printifyCon = new PrintifyController

const runPrintifyDaily = () => {
    cron.schedule("0 3 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15141891", "6646216042dd2e1a7f467689", 36)
    })
    cron.schedule("0 6 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033405", "660c41884106500891da5e88", 7)
    })
    cron.schedule("0 9 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15141701", "660c9b2c03307982e1f4e328", 10)
    })
    cron.schedule("0 10 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("16114630", "6663546f2f485d2bfacd5aba", 93)
    })
    cron.schedule("0 12 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033377", "660c453e4106500891da63ad", 8)
    })
    cron.schedule("0 15 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15145610", "660eda16880f6552fe3ff895", 19)
    })
    cron.schedule("0 17 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15173375", "6621bfd6c933d827cc9c4ef7", 23)
    })
    cron.schedule("0 18 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("14761883", "660c3ca14106500891da5954", 5)
    })
    cron.schedule("0 21 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15149110", "660ec736880f6552fe3fe6bb", 18)
    })
    cron.schedule("0 23 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15308540", "6617047419e2fef9a8d0b58e", 22)
    })
}

const getShippingRates = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "Send order id" })
        }
        const order = await axios.get(`https://market-server.azurewebsites.net/api/orders/${id}`)
        const theOrder = order.data.order[0].order_lines
        const checkBrand = await axios.get(`https://market-server.azurewebsites.net/api/products/details/${theOrder[0].product_template_id[0]}`)
        const brand = checkBrand.data.product[0]
        if (brand.x_printify_id) {
            const lineItems = await Promise.all(theOrder.map(async (item) => {
                const product = await axios.get(`https://market-server.azurewebsites.net/api/products/details/${item.product_template_id[0]}`)
                const pro = product.data.product[0]
                return {
                    product_id: pro.x_printify_id,
                    variant_id: JSON.parse(pro.x_printify_variant_id)[JSON.parse(item.x_variant).product_template_value_ids_data[0][0]?.name],
                    quantity: item.product_uom_qty
                }
            }))
            const theAddress = await axios.post(`https://market-server.azurewebsites.net/api/orders/address/get`, {
                partnerID: order.data.order[0]?.partner_id[0],
                addressID: order.data.order[0]?.partner_shipping_id[0]
            })
            const address = theAddress.data
            if (address.state_id) {
                const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                const body = {
                    line_items: lineItems,
                    address_to: {
                        first_name: address.name.split(" ")[0],
                        last_name: address.name.split(" ")[1],
                        address1: address.street,
                        city: address.city,
                        region: address.state_id[1],
                        zip: address.zip,
                        country: countryCode,
                        phone: address.phone,
                        email: address.email
                    }
                }
                const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
                const rates = await axios.post(`https://api.printify.com/v1/shops/${brand.x_printify_shop_id}/orders/shipping.json`, body, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const keys = Object.keys(rates.data)
                const obj = keys.map((key, i) => {
                    return {
                        rate_id: i,
                        service_type: key,
                        shipping_amount: {
                            amount: (rates.data[key] / 100).toFixed(2)
                        }
                    }
                })
                res.status(200).json({ rate_response: { rates: obj } })
            } else {
                return res.status(400).json({ message: "State not recognized" })
            }
        } else {
            return res.status(400).json({ message: "Not a printify order" })
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {
    printifyCon,
    runPrintifyDaily,
    getShippingRates
}


