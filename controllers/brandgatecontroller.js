const { default: axios } = require("axios");
const cron = require("node-cron");

const feedCategory = async (category, token) => {
    let theCat;
    const response = await axios.get(`https://nova.shopwoo.com/api/v1/categories/${category}?store_id=2&lang=en`, {
        auth: {
            username: "info@dreamtechlabs.net",
            password: "Aim4$ucce$$"
        }
    })
    const cat = response.data
    const checkCat = await axios.post(`https://market-server.azurewebsites.net/api/categories/company/name/65efbcf32f64e5621d536c68`, {
        name: cat.name
    })
    const result = checkCat.data
    if (result.category) {
        theCat = result.category.id
    } else {
        console.log("creating category");
        const getCatID = await axios.post(`https://market-server.azurewebsites.net/api/categories`, {
            name: cat.name
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const catID = getCatID.data
        theCat = catID.id
    }
    return theCat
}

const stockQty = async (variants) => {
    const qty = variants.reduce((a, b) => a + b.stock_quantity, 0)
    return qty;
}

const getVariants = async (variants) => {
    const res = await Promise.all(variants.map(async (variant) => {
        const checkVar = await axios("https://market-server.azurewebsites.net/api/products/attribute-values/3")
        const varia = checkVar.data.values.find((val) => val.name === variant.attributes[0].option)
        if (varia) {
            return [{
                attributeId: 3,
                price_extra: 0,
                valueId: varia.id
            }]
        } else {
            return [{
                attributeId: 3,
                price_extra: 0,
                value: variant.attributes[0].option
            }]
        }
    }))
    return res
}

const feedProduct = async () => {
    try {
        for (let i = 1; i < 101; i++) {
            const getUser = await axios.post(`https://market-server.azurewebsites.net/api/auth/login`, {
                email: "theblackmarket@gmail.com",
                password: "@Theblackmarket",
                status: "active"
            })
            const user = getUser.data
            const response = await axios.get(`https://nova.shopwoo.com/api/v1/products?store_id=2&page=${i}&per_page=100&lang=en`, {
                auth: {
                    username: "info@dreamtechlabs.net",
                    password: "Aim4$ucce$$"
                }
            })
            const products = response.data
            for (const product of products) {
                const variantObj = {}
                product.variations.map((variant) => {
                    variantObj[`${variant.attributes[0].option}`] = variant.id
                })
                const categories = await feedCategory(product.categories[0], user.token)
                const qty = await stockQty(product.variations)
                const variations = await getVariants(product.variations)
                console.log(variations);
                const body = {
                    name: product.name,
                    category_id: categories.toString(),
                    uom_name: "1",
                    published: "true",
                    list_price: product.sale_price ? product.sale_price.toString() : product.variations[0]?.sale_price?.toString(),
                    description: product.description,
                    qty: qty,
                    weight: product.weight,
                    size: 1,
                    images: JSON.stringify(product.images.map((image) => image.src)),
                    dimension: product.dimensions?.width + product.dimensions?.height + product.dimensions?.length,
                    standard_price: product.regular_price ? product.regular_price.toString() : product.variations[0]?.regular_price?.toString(),
                    company_id: 226,
                    variants: JSON.stringify(variations),
                    brand_gate_id: product.id,
                    brand_gate_variant_id: JSON.stringify(variantObj)
                };
                const check = await axios.post("https://market-server.azurewebsites.net/api/products/search", {
                    "name": product.name,
                    "company_id": 226
                })
                if ((product.in_stock === false || product.variations[0]?.in_stock === false || product.variations.length === 0) && check.data.products?.length > 0) {
                    await axios.delete(`https://market-server.azurewebsites.net/api/products/delete/${check.data.products[0]?.id}`)
                    console.log("product deleted");
                } else {
                    if (check.data.products?.length === 0 && product.in_stock !== false && product.variations[0]?.in_stock !== false && product.variations.length > 0) {
                        const res = await axios.post("https://market-server.azurewebsites.net/api/products/variants", body, {
                            headers: {
                                Authorization: `Bearer ${user.token}`
                            }
                        })
                        const pro = res.data
                        console.log(pro)
                    } else if (check.data.products?.length > 0) {
                        const res = await axios.put(`https://market-server.azurewebsites.net/api/products/${check.data.products[0]?.id}`, body, {
                            headers: {
                                Authorization: `Bearer ${user.token}`
                            }
                        })
                        const pro = res.data
                        console.log(pro)
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const runFeedProductDaily = () => {
    feedProduct()
    cron.schedule("0 0 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
    })
}

const createOrder = async (req, res) => {
    try {
        console.log(req.body);
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