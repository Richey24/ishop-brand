const axios = require('axios');

class PrintifyService {


    constructor() {
        this.printify_base = 'https://api.printify.com/v1';
        this.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
    }

    /**
     * This method retrieves catalogs from Printify.
     * @returns {Promise} Promise object representing the catalogs data.
     */
    async getCatalogs() {
        try {
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
            if (!token) {
                throw new Error('Printify API key not found in environment variables');
            }

            const response = await axios.get(
                `${this.printify_base}/catalog/blueprints.json`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Log and return response data
            return response.data;
        } catch (error) {
            // Properly log and handle errors
            console.error('Error retrieving catalogs from Printify:', error.response ? error.response.data : error.message);
            return error
        }
    }


    async getAllShops() {
        try {
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';

            if (!token) {
                throw new Error('Printify API key not found in environment variables');
            }

            const response = await axios.get(
                `${this.printify_base}/shops.json`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Log and return response data
            console.log(response.data);
            return response.data;

        } catch (error) {
            console.error('Error retrieving catalogs from Printify:', error.response ? error.response.data : error.message);
            return error
        }
    }

    /**
     * THIS GET PRODUCT
     * @param {} shopid 
     * @returns 
     */
    async getShopProducts(shopid) {

        try {
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
            const response = await axios.get(
                `${this.printify_base}/shops/${shopid}/products.json`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return response.data;

        } catch (error) {

            console.error('Error retrieving catalogs from Printify:', error.response ? error.response.data : error.message);
            return error
        }
    }

    /**
     * This method creates a product on Printify.
     * @returns {Promise} Promise object representing the created product data.
     */
    async createProduct(productData) {
        try {
            const response = await axios.post(
                `${this.printify_base}/products`,
                productData,
                {
                    headers: getHeaders() // Assuming getHeaders() is defined elsewhere
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating product on Printify:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async createOrder(shopId, body) {
        try {
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
            const response = await axios.post(`${this.printify_base}/shops/${shopId}/orders.json`, body, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data;
        } catch (error) {
            console.error('Error creating product on Printify:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * THE FUNCTION UPDATE PRODUCT DETAILS
     * @param {*} attr 
     * @returns 
     */
    async updateProduct(params) {

        const shopid = params.shopId;
        const productId = params.productId;
        const payload = params.data;

        try {
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImEwZjkwMTc2YTg2OWZlNGNmNTkzM2NkNGY4YzJhMWJjYTdkMTE4ZDNkY2FjNzQ5ZDhjZTE3YzYzNjAyOTcwNjlmYTM4MzJkZjcxOWI5YmM4IiwiaWF0IjoxNzExNDk0MTM5LjU0ODkxOCwibmJmIjoxNzExNDk0MTM5LjU0ODkyLCJleHAiOjE3NDMwMzAxMzkuNTQyMDg4LCJzdWIiOiIxNzM1ODA2MCIsInNjb3BlcyI6WyJzaG9wcy5tYW5hZ2UiLCJzaG9wcy5yZWFkIiwiY2F0YWxvZy5yZWFkIiwib3JkZXJzLnJlYWQiLCJvcmRlcnMud3JpdGUiLCJwcm9kdWN0cy5yZWFkIiwicHJvZHVjdHMud3JpdGUiLCJ3ZWJob29rcy5yZWFkIiwid2ViaG9va3Mud3JpdGUiLCJ1cGxvYWRzLnJlYWQiLCJ1cGxvYWRzLndyaXRlIiwicHJpbnRfcHJvdmlkZXJzLnJlYWQiXX0.Agtw2qlnOYSDaPG_CwaQo5q8bLGgJLRSKVjOh4lrsAj50dGH_ldMBFvpE_ujq0EuAdJ5gOdOalw3rZ0-Hnc';
            const response = await axios.get(
                `${this.printify_base}/shops/${shopid}/products/${productId}.json`,
                payload, // data to pass to be eidit
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error retrieving catalogs from Printify:', error.response ? error.response.data : error.message);
            return error
        }
    }

}

module.exports = PrintifyService;
