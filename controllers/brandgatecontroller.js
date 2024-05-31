const { default: axios } = require("axios");
const cron = require("node-cron");
const Odoo = require("../odoo");
const { getComapnyCategoriesByName, createCategory, getVariant, searchProduct, deleteProduct, addProductVariant, updateProduct } = require("../services/ProductService");

const feedCategory = async (category) => {
    let theCat;
    const response = await axios.get(`https://nova.shopwoo.com/api/v1/categories/${category}?store_id=2&lang=en`, {
        auth: {
            username: "info@dreamtechlabs.net",
            password: "Aim4$ucce$$"
        }
    })
    const cat = response.data
    const checkCat = await getComapnyCategoriesByName(cat.name, "660c24924106500891da4c07")

    if (checkCat) {
        theCat = checkCat.id
    } else {
        console.log("creating category");
        const getCatID = await createCategory(cat.name, "660c24924106500891da4c07")
        theCat = getCatID
    }
    return theCat
}

const stockQty = async (variants) => {
    const qty = variants.reduce((a, b) => a + b.stock_quantity, 0)
    return qty;
}

const getVariants = async (variants) => {
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.in_stock) {
            const checkVar = await getVariant(2)
            const varia = checkVar.find((val) => val.name === variant.attributes[0].option)
            if (varia) {
                return [{
                    attributeId: 2,
                    price_extra: variant.regular_price - variants[0].regular_price,
                    valueId: varia.id
                }]
            } else {
                return [{
                    attributeId: 2,
                    price_extra: variant.regular_price - variants[0].regular_price,
                    value: variant.attributes[0].option
                }]
            }
        }
    }))
    return res
}

const calculateDiscountedPrice = (product) => {
    return Number((product.regular_price ? product.regular_price.toString() : product.variations[0]?.regular_price?.toString())) + Number((product.sale_price ? product.sale_price.toString() : product.variations[0]?.sale_price?.toString()))
}

const feedProduct = async () => {
    try {
        for (let i = 1; i < 101; i++) {
            const response = await axios.get(`https://nova.shopwoo.com/api/v1/products?store_id=2&page=${i}&per_page=100&lang=en`, {
                auth: {
                    username: "info@dreamtechlabs.net",
                    password: "Aim4$ucce$$"
                }
            })
            await Odoo.connect();
            const products = response.data
            for (const product of products) {
                if (product.regular_price <= 0 && product.variations[0]?.regular_price <= 0) continue
                const variantObj = {}
                product.variations.map((variant) => {
                    if (variant.in_stock) {
                        variantObj[`${variant.attributes[0].option}`] = variant.id
                    }
                })
                const qty = await stockQty(product.variations)
                const variations = await getVariants(product.variations)
                const body = {
                    name: product.name,
                    uom_name: "1",
                    published: "true",
                    list_price: product.sale_price ? product.sale_price.toString() : product.variations[0]?.sale_price?.toString(),
                    description: product.description,
                    qty: qty,
                    weight: product.weight,
                    size: 1,
                    images: JSON.stringify(product.images.map((image) => image.src)),
                    dimension: product.dimensions?.width + product.dimensions?.height + product.dimensions?.length,
                    standard_price: calculateDiscountedPrice(product) + 20,
                    company_id: 2,
                    brand_gate_id: product.id,
                    x_free_shipping: true,
                    discount: {
                        amount: Number((product.sale_price ? product.sale_price.toString() : product.variations[0]?.sale_price?.toString())) + 20,
                        type: "fixed",
                        start_date: new Date().toISOString(),
                        end_date: new Date(new Date().setMonth(new Date().getMonth() + 24)).toISOString(),
                        discountedAmount: Number((product.sale_price ? product.sale_price.toString() : product.variations[0]?.sale_price?.toString())) + 20,
                    },
                };
                const check = await searchProduct(product.name, 2)
                if (Object.keys(variantObj).length > 0) {
                    body.brand_gate_variant_id = JSON.stringify(variantObj)
                    body.variants = variations
                }
                if (check?.length > 1) {
                    const arr = check.shift()
                    check.forEach(async (che) => {
                        await deleteProduct(che?.id)
                        console.log("duplicate product deleted");
                    })
                    check.unshift(arr)
                }
                if ((product.in_stock === false && check?.length > 0) || (product.images.length <= 0 && check?.length > 0)) {
                    await deleteProduct(check[0]?.id)
                    console.log("product deleted");
                } else {
                    if (check?.length === 0 && product.in_stock !== false && product.images.length > 0) {
                        const categories = await feedCategory(product.categories[0])
                        body.category_id = categories.toString()
                        const res = await addProductVariant({ product: body })
                        console.log(res);
                    } else if (check?.length > 0) {
                        await updateProduct({ product: body, productId: check[0]?.id })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const runFeedProductDaily = () => {
    cron.schedule("0 0 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
    })
    feedProduct()
}

const createOrder = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "send order body" })
        }
        await axios.post("https://nova.shopwoo.com/api/v1/orders?store_id=2", req.body, {
            auth: {
                username: "info@dreamtechlabs.net",
                password: "Aim4$ucce$$"
            }
        })
        res.status(200).json({ message: "order created on brandgateway" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}

module.exports = {
    runFeedProductDaily,
    createOrder
}
