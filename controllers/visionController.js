const { default: axios } = require('axios');
const Odoo = require("../odoo");
const cron = require("node-cron");
const visionCat = require('../services/VisionCat');
const { getComapnyCategoriesByName, createCategory, addProductVariant, updateProduct, deleteProduct, searchProductVision } = require('../services/ProductService');


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


const fetchVisionProduct = async () => {
    const result = await axios.get("https://secure.chinavasion.com/api/getProductList.php", {
        data: {
            key: "Zs6U7tiYqvCFL2BhcCPmNF6EvH4xphbLkPUB6lbs8i8.",
            categories: [
                "US Local Warehouse",
            ]
        }
    })
    const productLength = result.data.pagination.total
    console.log(productLength);
    for (let i = 1; i <= Math.ceil(productLength / 50); i++) {
        const pro = await axios.get("https://secure.chinavasion.com/api/getProductList.php", {
            data: {
                key: "Zs6U7tiYqvCFL2BhcCPmNF6EvH4xphbLkPUB6lbs8i8.",
                categories: [
                    "US Local Warehouse",
                ],
                pagination: {
                    count: 50,
                    start: (i - 1) * 50
                }
            }
        })
        for (const product of pro.data?.products) {
            if (!visionCat.includes(product.subcategory_name)) continue
            await Odoo.connect();

            const category = await feedCategory(product.subcategory_name, "667594ef4cfba01a5843593f")

            const body = {
                name: product.full_product_name,
                category_id: category.toString(),
                uom_name: "1",
                published: "true",
                list_price: Number(product.price),
                description: product.specification,
                qty: 10,
                weight: product.package?.weight_kg,
                images: JSON.stringify([product.main_picture, ...product.additional_images?.slice(0, 6)]),
                standard_price: Number(product.retail_price.replace(/,/g, '')),
                company_id: 119,
                x_vision_id: product.product_id,
                x_vision_model: product.model_code,
                x_free_shipping: false,
            };

            const check = await searchProductVision(product.product_id, 119)
            if (check?.length > 1) {
                const arr = check.shift()
                check.forEach(async (che) => {
                    await deleteProduct(che?.id)
                    console.log("duplicate product deleted");
                })
                check.unshift(arr)
            }
            const checkImage = await axios.get(product.main_picture, { validateStatus: false })
            if ((product.status === "Out of Stock" || checkImage.status !== 200) && check?.length === 0) continue

            if ((product.status === "Out of Stock" || checkImage.status !== 200) && check?.length > 0) {
                await deleteProduct(check[0]?.id)
                console.log("product deleted");
            } else {
                if (check?.length === 0) {
                    const res = await addProductVariant({ product: body })
                    console.log("created-->", res)
                } else {
                    await updateProduct({ product: body, productId: check[0]?.id })
                }
            }
        }
    }
}

const runVisionDaily = () => {
    cron.schedule("0 13 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
        fetchVisionProduct()
    })
}

module.exports = runVisionDaily