const axios = require('axios');

class PrintifyService {


    constructor() {
        this.printify_base = 'https://api.printify.com/v1';
        this.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA1NTMyZDFkYmY3ZGM0OGZmOTQ3YzRiZjVhODcyNWM0OTUxMDZjYTU2MGUyM2U3MjQ2OGY1YTE2ZWFmZjUzMGIyOGI3MzFjN2M4MzFhOWQ1IiwiaWF0IjoxNzA5MjIxODQwLjgzOTc3NCwibmJmIjoxNzA5MjIxODQwLjgzOTc3NSwiZXhwIjoxNzQwODQ0MjQwLjgyODY5NCwic3ViIjoiMTYzOTk4OTAiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AFXNcYbk8O9gMbH6M2LlnCaXG1lAwNQCSzqoPxoQ_oplLwX3HFkiLaIQeKCXOByFnxvaqDVCJvKTfXoN9nY';
    }

    /**
     * This method retrieves catalogs from Printify.
     * @returns {Promise} Promise object representing the catalogs data.
     */
    async getCatalogs() {
        try {
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA1NTMyZDFkYmY3ZGM0OGZmOTQ3YzRiZjVhODcyNWM0OTUxMDZjYTU2MGUyM2U3MjQ2OGY1YTE2ZWFmZjUzMGIyOGI3MzFjN2M4MzFhOWQ1IiwiaWF0IjoxNzA5MjIxODQwLjgzOTc3NCwibmJmIjoxNzA5MjIxODQwLjgzOTc3NSwiZXhwIjoxNzQwODQ0MjQwLjgyODY5NCwic3ViIjoiMTYzOTk4OTAiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AFXNcYbk8O9gMbH6M2LlnCaXG1lAwNQCSzqoPxoQ_oplLwX3HFkiLaIQeKCXOByFnxvaqDVCJvKTfXoN9nY';
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
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA1NTMyZDFkYmY3ZGM0OGZmOTQ3YzRiZjVhODcyNWM0OTUxMDZjYTU2MGUyM2U3MjQ2OGY1YTE2ZWFmZjUzMGIyOGI3MzFjN2M4MzFhOWQ1IiwiaWF0IjoxNzA5MjIxODQwLjgzOTc3NCwibmJmIjoxNzA5MjIxODQwLjgzOTc3NSwiZXhwIjoxNzQwODQ0MjQwLjgyODY5NCwic3ViIjoiMTYzOTk4OTAiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AFXNcYbk8O9gMbH6M2LlnCaXG1lAwNQCSzqoPxoQ_oplLwX3HFkiLaIQeKCXOByFnxvaqDVCJvKTfXoN9nY';

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
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA1NTMyZDFkYmY3ZGM0OGZmOTQ3YzRiZjVhODcyNWM0OTUxMDZjYTU2MGUyM2U3MjQ2OGY1YTE2ZWFmZjUzMGIyOGI3MzFjN2M4MzFhOWQ1IiwiaWF0IjoxNzA5MjIxODQwLjgzOTc3NCwibmJmIjoxNzA5MjIxODQwLjgzOTc3NSwiZXhwIjoxNzQwODQ0MjQwLjgyODY5NCwic3ViIjoiMTYzOTk4OTAiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AFXNcYbk8O9gMbH6M2LlnCaXG1lAwNQCSzqoPxoQ_oplLwX3HFkiLaIQeKCXOByFnxvaqDVCJvKTfXoN9nY';
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
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA1NTMyZDFkYmY3ZGM0OGZmOTQ3YzRiZjVhODcyNWM0OTUxMDZjYTU2MGUyM2U3MjQ2OGY1YTE2ZWFmZjUzMGIyOGI3MzFjN2M4MzFhOWQ1IiwiaWF0IjoxNzA5MjIxODQwLjgzOTc3NCwibmJmIjoxNzA5MjIxODQwLjgzOTc3NSwiZXhwIjoxNzQwODQ0MjQwLjgyODY5NCwic3ViIjoiMTYzOTk4OTAiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AFXNcYbk8O9gMbH6M2LlnCaXG1lAwNQCSzqoPxoQ_oplLwX3HFkiLaIQeKCXOByFnxvaqDVCJvKTfXoN9nY';
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
            const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA1NTMyZDFkYmY3ZGM0OGZmOTQ3YzRiZjVhODcyNWM0OTUxMDZjYTU2MGUyM2U3MjQ2OGY1YTE2ZWFmZjUzMGIyOGI3MzFjN2M4MzFhOWQ1IiwiaWF0IjoxNzA5MjIxODQwLjgzOTc3NCwibmJmIjoxNzA5MjIxODQwLjgzOTc3NSwiZXhwIjoxNzQwODQ0MjQwLjgyODY5NCwic3ViIjoiMTYzOTk4OTAiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AFXNcYbk8O9gMbH6M2LlnCaXG1lAwNQCSzqoPxoQ_oplLwX3HFkiLaIQeKCXOByFnxvaqDVCJvKTfXoN9nY';
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
