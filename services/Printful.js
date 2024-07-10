const { default: axios } = require('axios');
const Odoo = require("../odoo");
const { getComapnyCategoriesByName, createCategory, searchProductPrintful, deleteProduct, addProductVariant, updateProduct } = require("../services/ProductService");

const feedPrintfulCategory = async (category, companyLongId) => {
    const responseCat = await axios.get(`https://api.printful.com/categories/${category}`)
    let theCat;
    const checkCat = await getComapnyCategoriesByName(responseCat.data, companyLongId)
    if (checkCat) {
        theCat = checkCat.id
    } else {
        const getCatID = await createCategory(responseCat.data, companyLongId)
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

const feedPrintful = async (company) => {
    const responsePro = await axios.get(`https://api.printful.com/store/products`, {
        headers: {
            Authorization: `Bearer ${company.printfulToken}`,
            "X-PF-Store-Id": company.printfulStoreID
        }
    })
    const products = responsePro.data
    for (let i = 1; i <= Math.ceil(products.paging.total / 100); i++) {
        const paginated = await axios.get(`https://api.printful.com/store/products?limit=100&offset=${i}`, {
            headers: {
                Authorization: `Bearer ${company.printfulToken}`,
                "X-PF-Store-Id": company.printfulStoreID
            }
        })
        const mainProducts = paginated.data
        await Odoo.connect();
        for (const product of mainProducts.result) {
            const result = await axios.get(`https://api.printful.com/store/products/${product.id}`, {
                headers: {
                    Authorization: `Bearer ${company.printfulToken}`,
                    "X-PF-Store-Id": company.printfulStoreID
                }
            })
            const productDetail = result.data
            const variantObj = {}
            productDetail.sync_variants.map((variant) => {
                if (variant.availability_status === "active") {
                    variantObj[`${variant.size}/${variant.color}`] = variant.id
                }
            })
            const category = await feedPrintfulCategory(productDetail.sync_variants[0].main_category_id, company._id)
            const variants = await getPrintfulVariants(productDetail.sync_variants)

            const body = {
                name: product.sync_product.name,
                category_id: category.toString(),
                uom_name: "1",
                published: "true",
                list_price: product.variants[0]?.retail_price.toFixed(2),
                description: "",
                qty: 10,
                weight: 1,
                images: JSON.stringify(productDetail.sync_variants[0]?.files.map((image) => image.preview_url)),
                standard_price: product.variants[0]?.retail_price.toFixed(2),
                company_id: company.company_id,
                x_printful_id: product.id,
                x_printful_variant_id: product.variants[0]?.id,
                x_printful_shop_id: company.printfulStoreID
            };

            if (Object.keys(variantObj).length > 0) {
                body.x_printful_variant_id = JSON.stringify(variantObj)
                body.variants = variants
            }
            // console.log(body);
            const check = await searchProductPrintful(product.id, company.company_id)
            if (check?.length > 1) {
                const arr = check.shift()
                check.forEach(async (che) => {
                    await deleteProduct(che?.id)
                    console.log("duplicate product deleted");
                })
                check.unshift(arr)
            }
            if (product.sync_variants[0].availability_status === "active" && check?.length > 0) {
                await deleteProduct(check[0]?.id)
                console.log("product deleted");
            } else {
                if (check?.length === 0 && body.variants.length !== 0) {
                    const res = await addProductVariant({ product: body })
                    console.log("created-->", res, company.company_id)
                } else {
                    await updateProduct({ product: body, productId: check[0]?.id })
                }
            }
        }
    }
}

module.exports = feedPrintful