const Trader = require('../domain/models/trader');
const Orders = require('../domain/models/orders');
const productsModel = require('../domain/models/products');
const response = require('../shared/sharedResponse');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class TraderService {
    async signup(req, res) {
        const traderData = req.body;
        if (!traderData.firstName || !traderData.lastName || !traderData.email || !traderData.phoneNumber || !traderData.password) {
            return response.badRequest(res, 'All fields are required');
        }
        try {
            const existingTrader = await Trader.findOne({ email: traderData.email });
            if (existingTrader) {
                return response.badRequest(res, 'Email already exists');
            }
            traderData.password = await bcrypt.hash(traderData.password, 10);
            const newTrader = new Trader(traderData);
            await newTrader.save();
            return response.success(res, { id: newTrader._id }, 'Trader created', 201);
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async login(req, res) {
        const { email, phoneNumber, password } = req.body;
        if ((!email && !phoneNumber) || !password) {
            return response.badRequest(res, 'Email or phone number and password are required');
        }
        try {
            const trader = await Trader.findOne({
                $or: [
                    { email: email || null },
                    { phoneNumber: phoneNumber || null }
                ]
            });
            if (!trader) {
                return response.unauthorized(res, 'Invalid credentials');
            }
            const isMatch = await bcrypt.compare(password, trader.password);
            if (!isMatch) {
                return response.unauthorized(res, 'Invalid credentials');
            }
            const token = jwt.sign(
                { id: trader._id, username: trader.email, role: 'trader' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            return response.success(res, { token }, 'Login successful');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async getTraderById(req, res) {
        const traderId = req.user?.id; 
        try {
            const trader = await Trader.findById(traderId).select('-password');
            if (!trader) {
                return response.notFound(res, 'Trader not found');
            }
            const orders = await Orders.find({ traderId: traderId });
            return response.success(res, { trader, orders }, 'Trader fetched');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async getTraderProducts(req, res){
        const traderId = req.user?.id;
        try{
         const products = await productsModel.find({traderId: traderId});
            if (!products || products.length === 0) {
                return response.notFound(res, 'No products found for this trader');
            }
            return response.success(res, products, 'Products fetched successfully');
        }catch (error) {
            return response.serverError(res, error.message);
        }
    }
}

module.exports = new TraderService();