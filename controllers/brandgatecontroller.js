const { default: axios } = require("axios");

const feedCategory = async (category, token) => {
    console.log(category);
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
    console.log(theCat);
    return theCat
}

const feedProduct = async (req, res) => {
    // try {
    const getUser = await axios.post(`https://market-server.azurewebsites.net/api/auth/login`, {
        email: "uahomorejoice@gmail.com",
        password: "Rejoice11#",
        status: "active"
    })
    const user = getUser.data
    const results = []
    const response = await axios.get(`https://nova.shopwoo.com/api/v1/products?store_id=2&per_page=5&lang=en`, {
        auth: {
            username: "info@dreamtechlabs.net",
            password: "Aim4$ucce$$"
        }
    })
    const products = response.data
    for (const product of products) {
        const categories = await feedCategory(product.categories[0], user.token)
        const body = {
            name: product.name,
            category_id: categories.toString(),
            uom_name: "1",
            published: "true",
            list_price: product.variations[0].sale_price.toString(),
            description: product.description,
            qty: product.stock_quantity,
            weight: product.weight,
            size: "",
            images: JSON.stringify(product.images.map((image) => image.src)),
            dimension: JSON.stringify(product.dimensions),
            standard_price: product.variations[0].regular_price.toString(),
            company_id: 139,
            variants: JSON.stringify(product.variations),
        };
        const check = await axios.post("https://market-server.azurewebsites.net/api/products/search", {
            "name": product.name,
            "company_id": 139
        })
        if (check.data.products?.length === 0) {
            const res = await axios.post("https://market-server.azurewebsites.net/api/products", body, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            const pro = res.data
            results.push(pro)
        } else {
            const res = await axios.put(`https://market-server.azurewebsites.net/api/products/${check.data.products[0]?.id}`, body, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            const pro = res.data
            results.push(pro)
        }
    }
    res.status(200).json({ status: true, results })
    // } catch (error) {
    //     res.status(500).json({ error: "Internal Server Error", status: false });
    // }
}

module.exports = {
    feedProduct
}