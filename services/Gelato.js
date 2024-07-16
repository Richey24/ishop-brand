const { default: axios } = require('axios');
const Odoo = require("../odoo");
const { getComapnyCategoriesByName, createCategory, deleteProduct, addProductVariant, updateProduct, searchProductGelato } = require("../services/ProductService");

const feedGelatoCategory = async (category, companyLongId) => {
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

const getGelatoVariants = async (variants, defaultPrice) => {
    const res = await Promise.all(variants.map(async (variant) => {
        const priceResult = await axios.get(`https://product.gelatoapis.com/v3/products/${variant.productUid}/prices`, {
            headers: {
                "X-API-KEY": company.gelateApiKey
            }
        })
        const price = priceResult.data
        return {
            attributeId: "Option",
            price_extra: (price - defaultPrice).toFixed(2),
            value: variant.title,
            quantity: 10
        }
    }))
    return [res]
}


const feedGelato = async (shopID, apiKey, productIds) => {
    // const result = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${company.gelatoStoreID}/products`, {
    //     headers: {
    //         "X-API-KEY": company.gelateApiKey
    //     }
    // })
    // const products = result.data
    await Odoo.connect();
    for (const id of productIds) {
        const result = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products/${id}`, {
            headers: {
                "X-API-KEY": apiKey
            }
        })
        const product = result.data
        const priceResult = await axios.get(`https://product.gelatoapis.com/v3/products/${product.variants[0]?.productUid}/prices`, {
            headers: {
                "X-API-KEY": apiKey
            }
        })
        const price = priceResult.data

        const variantObj = {}
        product.variants.map((variant) => {
            variantObj[variant.title] = variant.productUid
        })

        const category = await feedGelatoCategory(product.category, company._id)
        const variants = await getGelatoVariants(product.variants, price)

        const body = {
            name: product.title,
            category_id: category.toString(),
            uom_name: "1",
            published: "true",
            list_price: price.toFixed(2),
            description: product.description,
            qty: 10,
            weight: 1,
            images: JSON.stringify(images.productImages?.map((image) => image.fileUrl)),
            standard_price: price.toFixed(2),
            company_id: company.company_id,
            x_gelato_id: product.id,
            x_gelato_variant_id: product.variants[0]?.productUid,
            x_gelato_shop_id: company.gelatoStoreID
        };

        if (Object.keys(variantObj).length > 0) {
            body.x_gelato_variant_id = JSON.stringify(variantObj)
            body.variants = variants
        }

        const check = await searchProductGelato(product.id, company.company_id)
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
            console.log("created-->", res, company.company_id)
        } else {
            await updateProduct({ product: body, productId: check[0]?.id })
        }

    }
}

module.exports = feedGelato