const Company = require("../model/company");
const Odoo = require("../odoo");


const addProduct = async (params) => {
    try {



        // Create the product
        const productData = {
            base_unit_count: params.product.qty,
            public_categ_ids: [+params.product.category_id],
            list_price: params.product.list_price,
            standard_price: params.product.standard_price,
            name: params.product.name,
            uom_name: params.product.uom_name,
            display_name: params.product.name,
            description: params.product.description,
            website_published: params.product.published,
            company_id: params.product.company_id,
            x_color: params.product.color,
            x_subcategory: params.product.subcategory,
            x_size: params.product.size,
            x_weight: params.product.weight,
            x_images: params.product.images,
            x_dimension: params.product.dimension,
            product_tag_ids: params.product.product_tag_ids
                ? JSON.parse(params.product.product_tag_ids)
                : [],
            x_discount: params?.product?.discount
                ? JSON.stringify(params?.product?.discount)
                : null,
            x_shipping_package: params?.product?.x_shipping_package,
            x_free_shipping: params?.product.free_shipping,
            x_brand_gate_id: params?.product.brand_gate_id,
            x_brand_gate_variant_id: params?.product.brand_gate_variant_id,
            x_show_sold_count: params?.product.x_show_sold_count,
            x_printify_id: params?.product.x_printify_id,
            x_printify_variant_id: params?.product.x_printify_variant_id,
            x_printify_shop_id: params?.product.x_printify_shop_id,
        };

        const productId = await Odoo.execute_kw("product.template", "create", [
            productData,
        ]);

        return productId;
    } catch (error) {
        console.error("Error when trying to connect to Odoo XML-RPC.", error);
        throw error;
    }
};

const createProductTemplate = async (templateData) => {
    try {

        return await Odoo.execute_kw("product.template", "create", [templateData]);
    } catch (error) {
        console.error("Error creating product template:", error);
        throw error;
    }
};


const addProductVariant = async (params) => {

    const templateData = {
        base_unit_count: params.product.qty,
        public_categ_ids: [+params.product.category_id],
        list_price: params.product.list_price,
        standard_price: params.product.standard_price,
        name: params.product.name,
        uom_name: params.product.uom_name,
        display_name: params.product.name,
        description: params.product.description,
        website_published: params.product.published,
        company_id: params.product.company_id,
        x_color: params.product.color,
        x_subcategory: params.product.subcategory,
        x_size: params.product.size,
        x_weight: params.product.weight,
        x_images: params.product.images,
        x_dimension: params.product.dimension,
        x_shipping_package: params?.product?.x_shipping_package,
        x_brand_gate_id: params?.product.brand_gate_id,
        x_brand_gate_variant_id: params?.product.brand_gate_variant_id,
        x_shipping_package: JSON?.stringify(params?.product?.x_shipping_package),
        x_free_shipping: params?.product.free_shipping,
        x_show_sold_count: params?.product.x_show_sold_count,
        x_discount: params?.product?.discount
            ? JSON.stringify(params?.product?.discount)
            : null,
        x_printify_id: params?.product.x_printify_id,
        x_printify_variant_id: params?.product.x_printify_variant_id,
        x_printify_shop_id: params?.product.x_printify_shop_id,
        product_tag_ids: params.product.product_tag_ids
            ? JSON.parse(params.product.product_tag_ids)
            : [],
    };

    const templateId = await createProductTemplate(templateData);

    if (params?.product?.variants && params?.product?.variants.length > 0) {
        for (const container of params?.product?.variants) {
            if (container) {
                for (const variant of container) {

                    let attributeValueId;

                    if (!variant?.valueId) {
                        const attributeValueData = {
                            name: variant?.value, // Replace with the actual value
                            attribute_id: variant?.attributeId,
                            sequence: 1, // Optional: Display sequence
                        };
                        attributeValueId = await Odoo.execute_kw(
                            "product.attribute.value",
                            "create",
                            [attributeValueData],
                        );
                    } else {
                        attributeValueId = variant?.valueId;
                    }
                    // console.log(attributeValueId);
                    const attributeLineData = {
                        product_tmpl_id: templateId,
                        attribute_id: variant?.attributeId,
                        value_ids: [[6, 0, [attributeValueId]]],
                    };

                    const attributeLineId = await Odoo.execute_kw(
                        "product.template.attribute.line",
                        "create",
                        [attributeLineData],
                    );

                    if (variant?.price_extra && variant?.price_extra !== 0) {
                        ///ADD PRICE_EXTRA
                        const attributeLineRespData = await Odoo.execute_kw(
                            "product.template.attribute.line",
                            "read",
                            [[attributeLineId], ["product_template_value_ids"]],
                        );

                        const productTemplateValueIds =
                            attributeLineRespData[0]?.product_template_value_ids || [];
                        const attributeValueWriteData = {
                            price_extra: variant?.price_extra, // Set the price adjustment here
                        };

                        await Odoo.execute_kw(
                            "product.template.attribute.value",
                            "write",
                            [[productTemplateValueIds[0]], attributeValueWriteData],
                        );
                    }
                }
            }
        }
    }

    return templateId;
};

const updateProduct = async (params) => {
    try {


        // Create the product
        const productData = {
            base_unit_count: params.product.qty,
            public_categ_ids: [+params.product.category_id],
            list_price: params.product.list_price,
            standard_price: params.product.standard_price,
            name: params.product.name,
            uom_name: params.product.uom_name,
            display_name: params.product.name,
            description: params.product.description,
            website_published: params.product.published,
            company_id: params.product.company_id,
            product_tag_ids: params.product.product_tag_ids
                ? JSON.parse(params.product.product_tag_ids)
                : [],
            x_color: params.product.color,
            x_subcategory: params.product.subcategory,
            x_size: params.product.size,
            x_free_shipping: params.product.free_shipping,
            x_weight: params.product.weight,
            x_images: params.product.images,
            x_show_sold_count: params?.product.x_show_sold_count,
            x_dimension: params.product.dimension,
            x_brand_gate_id: params?.product.brand_gate_id,
            x_brand_gate_variant_id: params?.product.brand_gate_variant_id,
            x_printify_id: params?.product.x_printify_id,
            x_printify_variant_id: params?.product.x_printify_variant_id,
            x_printify_shop_id: params?.product.x_printify_shop_id,
        };
        // Update the product data
        const result = await Odoo.execute_kw("product.template", "write", [
            [+params?.productId],
            productData,
        ]);

        if (result) {
            console.log("Product data updated successfully. Product ID:", +params?.productId);
        } else {
            console.error("Failed to update product data.");
            throw new Error("Failed to update product data.");
        }

        return result;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

const deleteProduct = async (id) => {
    try {

        await Odoo.execute_kw("product.template", "unlink", [[Number(id)]]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const getComapnyCategoriesByName = async (name, company_id) => {

    const company = await Company.findById(company_id);
    let categories = await Odoo.execute_kw(
        "product.public.category",
        "search_read",
        [
            [
                ["id", "in", company.categories]
            ],
            [
                "id",
                "name"
            ]
        ],
        {
            fields: ["name"],
            order: "id desc",
        },
    );

    const category = categories.find((cat) => cat.name === name)
    return category
}

const createCategory = async (name, company_id) => {
    try {

        console.log("company", name);
        const id = await Odoo.execute_kw("product.public.category", "create", [
            { name: name },
        ]);
        await Company.findByIdAndUpdate(company_id, { $push: { categories: id } });

        return id;
    } catch (e) {
        console.error("Error when trying to connect odoo xml-rpc", e);
    }
}

const getVariant = async (num) => {


    const attributeValues = await Odoo.execute_kw("product.attribute.value", "search_read", [
        [["attribute_id", "=", num]],
        ["name", "display_name", "attribute_id"],
    ]);

    return attributeValues
}

const searchProduct = async (name, company_id) => {

    const products = await Odoo.execute_kw(
        "product.template",
        "search_read",
        [[
            ["name", "ilike", name],
            ["company_id", "ilike", company_id]
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

const searchProductPrintify = async (id, company_id) => {

    const products = await Odoo.execute_kw(
        "product.template",
        "search_read",
        [[
            ["x_printify_id", "ilike", id],
            ["company_id", "ilike", company_id]
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

module.exports = {
    addProduct,
    addProductVariant,
    updateProduct,
    deleteProduct,
    getComapnyCategoriesByName,
    createCategory,
    getVariant,
    searchProduct,
    searchProductPrintify
}