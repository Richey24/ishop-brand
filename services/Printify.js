const { default: axios } = require('axios');
const Odoo = require("../odoo");
const { searchProductPrintify, deleteProduct, getComapnyCategoriesByName, createCategory, updateProduct, addProductVariant } = require('../services/ProductService');

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
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.is_available) {
            return {
                attributeId: "Option",
                price_extra: ((variant.price - variants[0]?.price) / 100).toFixed(2),
                value: variant.title,
                quantity: 10
            }
        }
    }))
    return [res.filter((el) => el !== undefined)]
}


const feedPrintify = async (companyShortId, companyLongId, shopID, apiKey, productIds) => {
    await Odoo.connect();
    for (const id of productIds) {
        const response = await axios.get(`https://api.printify.com/v1/shops/${shopID}/products/${id}.json`, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        })
        const product = response.data

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
            x_printify_shop_id: shopID
        };

        if (Object.keys(variantObj).length > 0) {
            body.x_printify_variant_id = JSON.stringify(variantObj)
            body.variants = variants
        }
        console.log(body);

        const check = await searchProductPrintify(product.id, companyShortId)
        if (check?.length > 1) {
            const arr = check.shift()
            check.forEach(async (che) => {
                await deleteProduct(che?.id)
                console.log("duplicate product deleted");
            })
            check.unshift(arr)
        }
        if (check?.length === 0 && body.variants.length !== 0) {
            const res = await addProductVariant({ product: body })
            console.log("created-->", res, companyShortId)
        } else {
            await updateProduct({ product: body, productId: check[0]?.id })
        }
    }
}

module.exports = feedPrintify