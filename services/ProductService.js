const Company = require("../model/company");
const Odoo = require("../odoo");

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
        x_free_shipping: params.product.x_free_shipping,
        x_show_sold_count: params?.product.x_show_sold_count,
        x_discount: params?.product?.discount
            ? JSON.stringify(params?.product?.discount)
            : null,
        x_printify_id: params?.product.x_printify_id,
        x_printify_variant_id: params?.product.x_printify_variant_id,
        x_printify_shop_id: params?.product.x_printify_shop_id,
        x_aliexpress_id: params?.product.x_aliexpress_id,
        x_aliexpress_variant_id: params?.product.x_aliexpress_variant_id,
        x_vision_id: params?.product.x_vision_id,
        x_vision_model: params?.product.x_vision_model,
        x_printful_id: params?.product.x_printful_id,
        x_printful_variant_id: params?.product.x_printful_variant_id,
        x_printful_shop_id: params.product?.x_printful_shop_id,
        x_gelato_id: params?.product.x_gelato_id,
        x_gelato_variant_id: params?.product.x_gelato_variant_id,
        x_gelato_shop_id: params.product?.x_gelato_shop_id,
        product_tag_ids: params.product.product_tag_ids
            ? JSON.parse(params.product.product_tag_ids)
            : [],
        x_variants:
            params?.product?.variants && params?.product?.variants.length > 0
                ? JSON.stringify(params?.product?.variants)
                : false,
    };

    const templateId = await createProductTemplate(templateData);

    return templateId;
};

const updateProduct = async (params) => {
    try {


        // Create the product
        const productData = {
            base_unit_count: params.product.qty,
            // public_categ_ids: [+params.product.category_id],
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
            x_discount: params?.product?.discount
                ? JSON.stringify(params?.product?.discount)
                : null,
            x_color: params.product.color,
            x_subcategory: params.product.subcategory,
            x_size: params.product.size,
            x_free_shipping: params.product.x_free_shipping,
            x_weight: params.product.weight,
            x_images: params.product.images,
            x_show_sold_count: params?.product.x_show_sold_count,
            x_dimension: params.product.dimension,
            x_brand_gate_id: params?.product.brand_gate_id,
            x_brand_gate_variant_id: params?.product.brand_gate_variant_id,
            x_printify_id: params?.product.x_printify_id,
            x_printify_variant_id: params?.product.x_printify_variant_id,
            x_printify_shop_id: params?.product.x_printify_shop_id,
            x_aliexpress_id: params?.product.x_aliexpress_id,
            x_aliexpress_variant_id: params?.product.x_aliexpress_variant_id,
            x_vision_id: params?.product.x_vision_id,
            x_vision_model: params?.product.x_vision_model,
            x_printful_id: params?.product.x_printful_id,
            x_printful_variant_id: params?.product.x_printful_variant_id,
            x_printful_shop_id: params.product?.x_printful_shop_id,
            x_gelato_id: params?.product.x_gelato_id,
            x_gelato_variant_id: params?.product.x_gelato_variant_id,
            x_gelato_shop_id: params.product?.x_gelato_shop_id,
            x_variants:
                params?.product?.variants && params?.product?.variants.length > 0
                    ? JSON.stringify(params?.product?.variants)
                    : false,
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
    let categories = await Odoo.execute_kw(
        "product.public.category",
        "search_read",
        [
            [
                ["name", "=", name]
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

    return categories.length === 0 ? undefined : categories[0]
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
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

const searchProductPrintful = async (id, company_id) => {
    const products = await Odoo.execute_kw(
        "product.template",
        "search_read",
        [[
            ["x_printful_id", "ilike", id],
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

const searchProductGelato = async (id, company_id) => {

    const products = await Odoo.execute_kw(
        "product.template",
        "search_read",
        [[
            ["x_gelato_id", "ilike", id],
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

const searchProducAli = async (id, company_id) => {

    const products = await Odoo.execute_kw(
        "product.template",
        "search_read",
        [[
            ["x_aliexpress_id", "ilike", id],
            ["company_id", "=", [+company_id]]
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

const searchProductVision = async (id, company_id) => {
    const products = await Odoo.execute_kw(
        "product.template",
        "search_read",
        [[
            ["x_vision_id", "ilike", id],
        ]],
        [
            "id",
            "name",
        ],
        {},
    );
    return products;
}

const getProductsIDs = async (val, returnVal, shopID) => {
    await Odoo.connect();
    const productData = await Odoo.execute_kw("product.template", "search_read", [
        [[val, "=", shopID]],
        [
            returnVal,
        ],
    ]);
    return productData.map((product) => product[returnVal])
}

module.exports = {
    addProductVariant,
    updateProduct,
    deleteProduct,
    getComapnyCategoriesByName,
    createCategory,
    getVariant,
    searchProduct,
    searchProductPrintify,
    searchProducAli,
    searchProductVision,
    searchProductPrintful,
    searchProductGelato,
    getProductsIDs
}