// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./src/confiq/dbConfiq');
const dotenv = require('dotenv');
const routes = require('./src/interfaces/routes/index');
const morgan = require('morgan');
dotenv.config({ path: './src/.env' });
require('./src/domain/whatsapp/whatsapp');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';
const listEndpoints = require('express-list-endpoints');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.get('/', (req, res) => {
    res.send('Server is running!');
});
app.use('/', routes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const axios = require('axios');
const API_USERNAME = 'LJq3l46TdA96ekWdHo02fRVUuWIa';
const API_PASSWORD = 'CsnhqNgrb2Py5foZRVf_FHHBMiQa';
const BASE_URL = 'https://api.emkanfinance.com.sa';

app.post('/pay', async (req, res) => {
    try {
        const payload = {
            merchant_id: '579414',
            amount: 2500,
            customer: {
                name: 'Hossam Kamal',
                phone: '966533333333',
                email: 'hossam@example.com',
                national_id: '1234567890'
            },
            product: {
                name: 'Laptop',
                category: 'Electronics',
                sku: 'LAP-001'
            },
            callback_url: 'https://backendb2b.kadinabiye.com/emkan-callback'
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
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Payment Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to process finance request' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

const endpoints = listEndpoints(app);
console.log(JSON.stringify(endpoints, null, 2));
connectDB(MONGO_URI).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
});