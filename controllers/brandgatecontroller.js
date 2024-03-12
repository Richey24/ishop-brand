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
    const checkCat = await axios.post(`https://market-server.azurewebsites.net/api/categories/company/name/64e7f7c571179976adeea75d`, {
        name: cat.name
    })
    const result = checkCat.data
    if (result.category) {
        theCat = result.category.id
    } else {
        const getCatID = await axios.post(`https://https://market-server.azurewebsites.net/api/categories`, {
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

const feedProduct = async () => {
    try {
        for (let i = 1; i < 101; i++) {
            const getUser = await axios.post(`https://market-server.azurewebsites.net/api/auth/login`, {
                email: "uahomorejoice@gmail.com",
                password: "Rejoice11#",
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
                const categories = await feedCategory(product.categories[0], user.token)
                const qty = await stockQty(product.variations)
                const body = {
                    name: product.name,
                    category_id: categories.toString(),
                    uom_name: "1",
                    published: "true",
                    list_price: product.variations[0].sale_price.toString(),
                    description: product.description,
                    qty: qty,
                    weight: product.weight,
                    size: "",
                    images: JSON.stringify(product.images.map((image) => image.src)),
                    dimension: product.dimensions.width + product.dimensions.height + product.dimensions.length,
                    standard_price: product.variations[0].regular_price.toString(),
                    company_id: 226,
                    variants: JSON.stringify(product.variations),
                };
                const check = await axios.post("https://market-server.azurewebsites.net/api/products/search", {
                    "name": product.name,
                    "company_id": 226
                })
                if (check.data.products?.length === 0) {
                    const res = await axios.post("https://market-server.azurewebsites.net/api/products", body, {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    })
                    const pro = res.data
                    console.log(pro)
                } else {
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
    } catch (error) {
        console.log(error);
    }
}

const runFeedProductDaily = () => {
    cron.schedule("0 0 * * *", () => {
        feedProduct()
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
    })
}

module.exports = {
    runFeedProductDaily
}