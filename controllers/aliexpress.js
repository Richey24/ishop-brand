const { default: axios } = require("axios");
const cron = require("node-cron");
const aliDatas = require("../services/AliData");
const Odoo = require("../odoo");
const signApiRequest = require("../services/Hashing");
const { searchProducAli, getVariant, getComapnyCategoriesByName, createCategory, deleteProduct, addProductVariant, updateProduct } = require("../services/ProductService");


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

const getVariantName = (variants) => {
    const res = variants.map(item => item.sku_property_value).join('/')
    return res
}

const getVariants = async (variants) => {
    const checkVar = await getVariant(4)
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.sku_stock) {
            const title = getVariantName(variant.ae_sku_property_dtos.ae_sku_property_d_t_o)
            const varia = checkVar.find((val) => val.name === title)
            if (varia) {
                return [{
                    attributeId: 4,
                    price_extra: (variant.sku_price - variants[0]?.sku_price),
                    valueId: varia.id
                }]
            } else {
                return [{
                    attributeId: 4,
                    price_extra: (variant.sku_price - variants[0]?.sku_price),
                    value: title
                }]
            }
        } else {
            return
        }
    }))
    return res
}



const fetchALiExpressProducts = async () => {
    for (const alidata of aliDatas) {
        const timestamp = Date.now()
        const hash = signApiRequest({
            app_key: 507142,
            timestamp: timestamp,
            method: "aliexpress.ds.recommend.feed.get",
            feed_name: alidata.feed,
            category_id: alidata.category,
            target_currency: "USD",
            page_no: 1,
            sign_method: "sha256"
        }, "EsFpY0hPU6YVVMIPR1WqdfckfwEEQXPh", "sha256", "");

        const aliproducts = await axios.get(`https://api-sg.aliexpress.com/sync?category_id=${alidata.category}&target_currency=USD&page_no=1&feed_name=${alidata.path}&method=aliexpress.ds.recommend.feed.get&app_key=507142&sign_method=sha256&timestamp=${timestamp}&sign=${hash}`)
        const totalCount = aliproducts.data.aliexpress_ds_recommend_feed_get_response.result.total_record_count
        await Odoo.connect();
        for (let i = 2; i < Math.ceil(totalCount / 60); i++) {
            const timestamp = Date.now()
            const hash = signApiRequest({
                app_key: 507142,
                timestamp: timestamp,
                method: "aliexpress.ds.recommend.feed.get",
                feed_name: alidata.feed,
                category_id: alidata.category,
                target_currency: "USD",
                page_no: i,
                sign_method: "sha256"
            }, "EsFpY0hPU6YVVMIPR1WqdfckfwEEQXPh", "sha256", "");
            const aliproducts = await axios.get(`https://api-sg.aliexpress.com/sync?category_id=${alidata.category}&target_currency=USD&page_no=${i}&feed_name=${alidata.path}&method=aliexpress.ds.recommend.feed.get&app_key=507142&sign_method=sha256&timestamp=${timestamp}&sign=${hash}`)
            const products = aliproducts.data.aliexpress_ds_recommend_feed_get_response.result.products.traffic_product_d_t_o

            for (const product of products) {
                const timestamp = Date.now()
                const hash = signApiRequest({
                    app_key: 507142,
                    timestamp: timestamp,
                    method: "aliexpress.ds.product.get",
                    product_id: product.product_id,
                    target_currency: "USD",
                    ship_to_country: "US",
                    sign_method: "sha256"
                }, "EsFpY0hPU6YVVMIPR1WqdfckfwEEQXPh", "sha256", "");
                const result = await axios.get(`https://api-sg.aliexpress.com/sync?target_currency=USD&product_id=${product.product_id}&ship_to_country=US&method=aliexpress.ds.product.get&app_key=507142&sign_method=sha256&timestamp=${timestamp}&sign=${hash}`)

                if (result.data.aliexpress_ds_product_get_response.rsp_code !== 200) continue

                const productDetails = result.data.aliexpress_ds_product_get_response.result

                const variantObj = {}
                productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.map((variant) => {
                    if (variant.sku_stock) {
                        const title = getVariantName(variant.ae_sku_property_dtos.ae_sku_property_d_t_o)
                        variantObj[`${title}`] = variant.sku_attr
                    }
                })
                const category = await feedCategory(product.second_level_category_name, "66552b3a3db4bb153f409eb8")
                const variants = await getVariants(productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o)

                const body = {
                    name: product.product_title,
                    category_id: category.toString(),
                    uom_name: "1",
                    published: "true",
                    list_price: Number(productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_price),
                    description: productDetails.ae_item_base_info_dto.detail,
                    qty: product.lastest_volume,
                    weight: productDetails.package_info_dto.gross_weight,
                    images: JSON.stringify(product.product_small_image_urls.productSmallImageUrl),
                    standard_price: ((Number(productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_price) * 1.4) + (Number(productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_price) * 1.4) * 1.5).toFixed(2),
                    company_id: 48,
                    x_aliexpress_id: product.product_id,
                    x_free_shipping: true,
                    discount: {
                        amount: (Number(productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_price) * 1.4).toFixed(2),
                        type: "fixed",
                        start_date: new Date().toISOString(),
                        end_date: new Date(new Date().setMonth(new Date().getMonth() + 24)).toISOString(),
                        discountedAmount: (Number(productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_price) * 1.4).toFixed(2),
                    },
                };

                if (Object.keys(variantObj).length > 0) {
                    body.x_aliexpress_variant_id = JSON.stringify(variantObj)
                    body.variants = variants
                }

                const check = await searchProducAli(product.product_id, 48)
                if (check?.length > 1) {
                    const arr = check.shift()
                    check.forEach(async (che) => {
                        await deleteProduct(che?.id)
                        console.log("duplicate product deleted");
                    })
                    check.unshift(arr)
                }
                if (productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.sku_stock === false && check?.length > 0) {
                    await deleteProduct(check[0]?.id)
                    console.log("product deleted");
                } else {
                    if (check?.length === 0 && body.variants.length !== 0) {
                        const res = await addProductVariant({ product: body })
                        console.log("created-->", res)
                    } else {
                        await updateProduct({ product: body, productId: check[0]?.id })
                    }
                }

            }
        }
    }
}

const runAliExpressDaily = () => {
    cron.schedule("0 10 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
    })
    fetchALiExpressProducts()
}


module.exports = runAliExpressDaily