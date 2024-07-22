const { default: axios } = require('axios');
const Odoo = require("../odoo");
const { getComapnyCategoriesByName, createCategory, searchProductPrintful, deleteProduct, addProductVariant, updateProduct } = require("../services/ProductService");

const feedPrintfulCategory = async (category, companyLongId) => {
    const responseCat = await axios.get(`https://api.printful.com/categories/${category}`)
    let theCat;
    const checkCat = await getComapnyCategoriesByName(responseCat.data?.result?.category?.title, companyLongId)
    if (checkCat) {
        theCat = checkCat.id
    } else {
        const getCatID = await createCategory(responseCat.data?.result?.category?.title, companyLongId)
        console.log("created category", getCatID);
        theCat = getCatID
    }
    return theCat
}

const getPrintfulVariants = async (variants) => {
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.availability_status === "active") {
            return {
                attributeId: "Option",
                price_extra: (variant.retail_price - variants[0]?.retail_price).toFixed(2),
                value: `${variant.size}/${variant.color}`,
                quantity: 10
            }
        }
    }))
    return [res.filter((el) => el !== undefined)]
}

const feedPrintful = async (companyShortId, companyLongId, shopID, apiKey, productIds) => {
    await Odoo.connect();
    for (const id of productIds) {
        const result = await axios.get(`https://api.printful.com/store/products/${id}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "X-PF-Store-Id": shopID
            }
        })
        const productDetail = result.data.result
        const variantObj = {}
        productDetail.sync_variants.map((variant) => {
            if (variant.availability_status === "active") {
                variantObj[`${variant.size}/${variant.color}`] = variant.variant_id
            }
        })
        const category = await feedPrintfulCategory(productDetail.sync_variants[0].main_category_id, companyLongId)
        const variants = await getPrintfulVariants(productDetail.sync_variants)

        const body = {
            name: productDetail.sync_product.name,
            category_id: category.toString(),
            uom_name: "1",
            published: "true",
            list_price: Number(productDetail.sync_variants[0]?.retail_price).toFixed(2),
            description: "",
            qty: 10,
            weight: 1,
            images: JSON.stringify(productDetail.sync_variants[0]?.files.map((image) => image.preview_url)),
            standard_price: Number(productDetail.sync_variants[0]?.retail_price).toFixed(2),
            company_id: companyShortId,
            x_printful_id: productDetail.sync_product.id,
            x_printful_variant_id: productDetail.sync_variants[0]?.variant_id,
            x_printful_shop_id: shopID
        };

        if (Object.keys(variantObj).length > 0) {
            body.x_printful_variant_id = JSON.stringify(variantObj)
            body.variants = variants
        }
        console.log(body);
        const check = await searchProductPrintful(body.x_printful_id, companyShortId)
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

module.exports = feedPrintful