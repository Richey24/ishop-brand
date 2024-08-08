const { default: axios } = require("axios");
const cron = require("node-cron");
const Odoo = require("../odoo");
const signApiRequest = require("../services/Hashing");
const { searchProducAli, getComapnyCategoriesByName, createCategory, deleteProduct, addProductVariant, updateProduct } = require("../services/ProductService");


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
    const res = await Promise.all(variants.map(async (variant) => {
        if (variant.sku_stock && variant.ae_sku_property_dtos) {
            const title = getVariantName(variant.ae_sku_property_dtos.ae_sku_property_d_t_o)
            return {
                attributeId: "Option",
                price_extra: (variant.sku_price - variants[0]?.sku_price),
                value: title,
                quantity: 10
            }
        }
    }))
    return [res.filter((el) => el !== undefined)]
}


const fetchFlProducts = async () => {
    try {
        const feed = "phones&accessories_ZA topsellers_ 20240423"
        const path = "phones%26accessories_ZA topsellers_ 20240423"
        const timestamp = Date.now()
        const hash = signApiRequest({
            app_key: 507142,
            timestamp: timestamp,
            method: "aliexpress.ds.recommend.feed.get",
            feed_name: feed,
            target_currency: "USD",
            page_no: 1,
            sign_method: "sha256"
        }, "EsFpY0hPU6YVVMIPR1WqdfckfwEEQXPh", "sha256", "");

        const aliproducts = await axios.get(`https://api-sg.aliexpress.com/sync?target_currency=USD&page_no=1&feed_name=${path}&method=aliexpress.ds.recommend.feed.get&app_key=507142&sign_method=sha256&timestamp=${timestamp}&sign=${hash}`)
        const totalCount = aliproducts.data.aliexpress_ds_recommend_feed_get_response.result.total_record_count
        console.log(totalCount, "fb");
        await Odoo.connect();
        for (let i = 40; i < Math.ceil(totalCount / 60); i++) {
            console.log(i, "fb");
            try {
                const timestamp = Date.now()
                const hash = signApiRequest({
                    app_key: 507142,
                    timestamp: timestamp,
                    method: "aliexpress.ds.recommend.feed.get",
                    feed_name: feed,
                    target_currency: "USD",
                    page_no: i,
                    sign_method: "sha256"
                }, "EsFpY0hPU6YVVMIPR1WqdfckfwEEQXPh", "sha256", "");
                const aliproducts = await axios.get(`https://api-sg.aliexpress.com/sync?target_currency=USD&page_no=${i}&feed_name=${path}&method=aliexpress.ds.recommend.feed.get&app_key=507142&sign_method=sha256&timestamp=${timestamp}&sign=${hash}`)
                const products = aliproducts.data.aliexpress_ds_recommend_feed_get_response.result.products.traffic_product_d_t_o

                for (const product of products) {
                    try {
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

                        if (result.data.aliexpress_ds_product_get_response?.rsp_code !== 200) continue

                        const productDetails = result.data.aliexpress_ds_product_get_response.result

                        const variantObj = {}
                        productDetails.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.map((variant) => {
                            if (variant.sku_stock && variant.ae_sku_property_dtos) {
                                const title = getVariantName(variant.ae_sku_property_dtos.ae_sku_property_d_t_o)
                                variantObj[`${title}`] = variant.sku_attr
                            }
                        })
                        const category = await feedCategory(product.second_level_category_name, "66a3fc9139ea06b6c60dec93")
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
                            company_id: 143,
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

                        const check = await searchProducAli(product.product_id, 143)
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
                            if (check?.length === 0 && body.variants?.length !== 0) {
                                const res = await addProductVariant({ product: body })
                                console.log("created-->", res)
                            } else {
                                await updateProduct({ product: body, productId: check[0]?.id })
                            }
                        }
                    } catch (error) {
                        console.log("err", error);
                    }
                }
            } catch (error) {
                console.log("err", error);
            }
        }
    } catch (error) {
        console.log("err", error);
    }
}

const runFlDaily = () => {
    cron.schedule("0 10 * * *", () => {
        console.log(`running field product daily at ${new Date().toLocaleString()}`);
    })
    fetchFlProducts()
}


module.exports = runFlDaily
