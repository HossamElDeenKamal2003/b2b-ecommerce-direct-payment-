const axios = require('axios');
const API_USERNAME = 'LJq3l46TdA96ekWdHo02fRVUuWIa';
const API_PASSWORD = 'CsnhqNgrb2Py5foZRVf_FHHBMiQa';
const BASE_URL = 'https://api.emkanfinance.com.sa'; // ← غيّره بالرابط الصحيح
class payment{
    async createFinanceRequest() {
        const payload = {
            merchant_id: '579414',
            amount: 2500,
            customer: {
            name: 'Hossam Kamal',
            phone: '966533333',
            email: 'hossam@example.com',
            national_id: '1234567890'
            },
            product: {
            name: 'Laptop',
            category: 'Electronics',
            sku: 'LAP-001'
            },
            callback_url: 'https://backendb2b.kadinabiye.com/emkan-callback',
        };

        const response = await axios.post(`${BASE_URL}/api/finance-request`, payload, {
            auth: {
            username: API_USERNAME,
            password: API_PASSWORD
            },
            headers: {
            'Content-Type': 'application/json'
            }
        });

        console.log('Response:', response.data);
        }

}

module.exports = new payment();