const { default: axios } = require("axios");
const Company = require("../model/company");
const feedGelato = require("../services/Gelato");
const feedPrintful = require("../services/Printful");


const dropshipController = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "Send company id" })
        }
        const company = await Company.findById(id)
        if (!company || !company.dropshipSite) {
            return res.status(400).json({ message: "Send valid company id/not a dropship company" })
        }
        if (company.dropshipService === "printful") {
            await feedPrintful(company)
        } else if (company.dropshipService === "gelato") {
            await feedGelato(company)
        }
        res.status(200).json({ message: "successful" })
    } catch (error) {
        console.log("500", error);
    }
}

const verifyKey = async (req, res) => {
    try {
        const { shopID, apiKey, dropshipType } = req.body
        if (!shopID || !apiKey || !dropshipType) {
            return res.status(400).json({ message: "Send shopID, apiKey, dropshipType" })
        }
        if (dropshipType === "printful") {
            const responsePro = await axios.get(`https://api.printful.com/store/products`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "X-PF-Store-Id": shopID
                },
                validateStatus: false
            })
            return res.status(responsePro.status).json({})
        }
        if (dropshipType === "gelato") {
            const result = await axios.get(`https://ecommerce.gelatoapis.com/v1/stores/${shopID}/products`, {
                headers: {
                    "X-API-KEY": apiKey
                },
                validateStatus: false
            })
            return res.status(result.status).json({})
        }
        return res.status(400).json({ message: "send either printful or gelato as dropshipType" })
    } catch (error) {
        res.status(500).json({ message: "error occur" })
    }
}

module.exports = {
    dropshipController,
    verifyKey
}