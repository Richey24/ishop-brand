
const { default: axios } = require('axios');
const cron = require("node-cron");
const PrintifyService = require('../services/PrintifyService')

const feedCategory = async (category, token, companyLongId) => {
    let theCat;
    const checkCat = await axios.post(`https://market-server.azurewebsites.net/api/categories/company/name/${companyLongId}`, {
        name: category
    })
    const result = checkCat.data
    if (result.category) {
        theCat = result.category.id
    } else {
        console.log("creating category");
        const getCatID = await axios.post(`https://market-server.azurewebsites.net/api/categories`, {
            name: category
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
    fetchProductByShop = async (shopId, email, password, companyLongId, companyShortId) => {
        // const attr = params.shopId;

        try {
            const getUser = await axios.post(`https://market-server.azurewebsites.net/api/auth/login`, {
                email: email,
                password: password,
                status: "active"
            })
            const user = getUser.data
            const products = await this.service.getShopProducts(shopId);
            console.log(products);
            for (const product of products.data) {
                const category = await feedCategory(product.tags[0], user.token, companyLongId)
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
                    x_printify_blueprint_id: product.blueprint_id,
                    x_printify_provider_id: product.print_provider_id,
                    x_printify_variant_id: product.variants[0]?.id,
                    x_printify_print_areas: JSON.stringify(product.print_areas),
                    // variants: JSON.stringify(product.variants),
                };
                const check = await axios.post("https://market-server.azurewebsites.net/api/products/search", {
                    "x_printify_id": product.id,
                    "company_id": companyShortId
                })
                if (product.variants[0].is_available === false && check.data.products?.length > 0) {
                    await axios.delete(`https://market-server.azurewebsites.net/api/products/delete/${check.data.products[0]?.id}`)
                    console.log("product deleted");
                } else {
                    if (check.data.products?.length === 0) {
                        const res = await axios.post("https://market-server.azurewebsites.net/api/products", body, {
                            headers: {
                                Authorization: `Bearer ${user.token}`
                            }
                        })
                        const pro = res.data
                        console.log(pro, companyShortId)
                    } else {
                        const res = await axios.put(`https://market-server.azurewebsites.net/api/products/${check.data.products[0]?.id}`, body, {
                            headers: {
                                Authorization: `Bearer ${user.token}`
                            }
                        })
                        const pro = res.data
                        console.log(pro, companyShortId)
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
            if (!body) {
                return res.status(200).json({ message: "send request body" })
            }
            const attr = '13408821';
            const order = this.service.createOrder(attr, body)
            res.status(200).json(order)
        } catch (error) {

        }
    }

    // saveProduct = async (req, res) => {
    //     const product = Product(req.body);
    //     try {

    //     } catch (error) {
    //         return res.status(400).send(error);
    //     }
    // }
}

const printifyCon = new PrintifyController

const runPrintifyDaily = () => {
    cron.schedule("0 6 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033405", "lilysblossom@gmail.com", "@Lilysblossom", "65fa2e797ac9c593c0c32cce", 286)
    })
    cron.schedule("0 12 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("15033377", "thehebrewstore@gmail.com", "@Thehebrewstore", "65fafa76c51e02de041b2f7f", 288)
    })
    cron.schedule("0 18 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        printifyCon.fetchProductByShop("14761883", "aboveallnations02@gmail.com", "@Aboveallnations", "65fa0bf718cfd854f818a1a8", 285)
    })
}

module.exports = {
    printifyCon,
    runPrintifyDaily
}


