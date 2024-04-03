const randomstring = require("randomstring");
const stripe = require("stripe")(process.env.STRIPE_TEST_KEY);
const Odoo = require("../odoo");
const { default: axios } = require("axios");

const orderProduct = async (req, res) => {
    // try {
    const payload = req.rawBody;
    const sig = req.headers["stripe-signature"];
    let event;
    // console.log({ payload });

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.PRIVATE_SITE_STRIPE_SECRET,
        );
    } catch (err) {
        console.log(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            if (session.mode !== "payment") {
                return res.status(200).json("wrong webhook");
            }
            if (session.payment_status === "paid") {
                await Odoo.connect();
                const order = await axios.get(`https://market-server.azurewebsites.net/api/orders/${session.metadata.orderId}`)
                const theOrder = order.data.order[0].order_lines
                const checkBrand = await axios.get(`https://market-server.azurewebsites.net/api/products/details/${theOrder[0].product_template_id[0]}`)
                const brand = checkBrand.data.product[0]
                if (brand.x_brand_gate_id) {
                    const lineItems = await Promise.all(theOrder.map(async (item) => {
                        const product = await axios.get(`https://market-server.azurewebsites.net/api/products/details/${item.product_template_id[0]}`)
                        const pro = product.data.product[0]
                        if (pro.x_brand_gate_variant_id) {
                            return {
                                product_id: pro.x_brand_gate_id,
                                variation_id: JSON.parse(pro.x_brand_gate_variant_id)[JSON.parse(item.x_variant)[0].name],
                                quantity: item.product_uom_qty
                            }
                        } else {
                            return {
                                product_id: pro.x_brand_gate_id,
                                quantity: item.product_uom_qty
                            }
                        }
                    }))
                    const theAddress = await axios.post(`https://market-server.azurewebsites.net/api/orders/address/get`, {
                        partnerID: order.data.order[0]?.partner_id[0],
                        addressID: order.data.order[0]?.partner_shipping_id[0]
                    })
                    const address = theAddress.data
                    const body = {
                        order_id: theOrder[0].id,
                        line_items: lineItems,
                        shipping: {
                            first_name: address.name.split(" ")[0],
                            last_name: address.name.split(" ")[1],
                            address_1: address.street,
                            city: address.city,
                            state: address.state_id ? address.state_id[1] : "state",
                            postcode: address.zip,
                            country: address.country_id[1],
                            phone: address.phone,
                            email: address.email
                        }
                    }
                    await axios.post("https://nova.shopwoo.com/api/v1/orders?store_id=2", body, {
                        auth: {
                            username: "info@dreamtechlabs.net",
                            password: "Aim4$ucce$$"
                        }
                    })
                    res.status(200).json({ message: "order created on brandgateway" })
                }
                if (brand.x_printify_id) {
                    const lineItems = await Promise.all(theOrder.map(async (item) => {
                        const product = await axios.get(`https://market-server.azurewebsites.net/api/products/details/${item.product_template_id[0]}`)
                        const pro = product.data.product[0]
                        return {
                            product_id: pro.x_printify_id,
                            variant_id: JSON.parse(pro.x_printify_variant_id)[JSON.parse(item.x_variant)[0].name],
                            quantity: item.product_uom_qty
                        }
                    }))
                    const theAddress = await axios.post(`https://market-server.azurewebsites.net/api/orders/address/get`, {
                        partnerID: order.data.order[0]?.partner_id[0],
                        addressID: order.data.order[0]?.partner_shipping_id[0]
                    })
                    const address = theAddress.data
                    if (address.state_id) {
                        console.log(lineItems);
                        const countryCode = address.state_id[1].substring(address.state_id[1].indexOf("(") + 1, address.state_id[1].lastIndexOf(")"))
                        const body = {
                            external_id: randomstring.generate(10),
                            line_items: lineItems,
                            shipping_method: 1,
                            send_shipping_notification: true,
                            address_to: {
                                first_name: address.name.split(" ")[0],
                                last_name: address.name.split(" ")[1],
                                address1: address.street,
                                city: address.city,
                                region: address.state_id[1],
                                zip: address.zip,
                                country: countryCode,
                                phone: address.phone,
                                email: address.email
                            }
                        }
                        // console.log(body);
                        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
                        await axios.post(`https://api.printify.com/v1/shops/${brand.x_printify_shop_id}/orders.json`, body, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                        res.status(200).json({ message: "Order created on printify" })
                    }
                }
            }
            break;
        default:
            break;
    }
    // } catch (error) {
    //     res.status(500).json(error)
    // }
}

module.exports = orderProduct