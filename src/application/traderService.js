const Trader = require('../domain/models/trader');
const Orders = require('../domain/models/orders');
const productsModel = require('../domain/models/products');
const response = require('../shared/sharedResponse');
const couponModel = require('../domain/models/coupons');
const notificationModel = require('../domain/models/notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs/promises');
const sharp = require('sharp');
const cloudinary = require('../confiq/cloudinaryConfiq');

class TraderService {
    async signup(req, res) {
        const traderData = req.body;

        const requiredFields = [
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'password',
            'googleMapLink',
            'address'
        ];
        console.log(req.body.googleMapLink);
        const missingFields = requiredFields.filter(field => !traderData[field]);
        if (missingFields.length > 0) {
            return response.badRequest(
                res,
                `Missing required field(s): ${missingFields.join(', ')}`
            );
        }


        try {
            const existingTrader = await Trader.findOne({ email: traderData.email });
            if (existingTrader) return response.badRequest(res, 'Email already exists');

            const existTraderPhoneNumber = await Trader.findOne({ phoneNumber: traderData.phoneNumber });
            if (existTraderPhoneNumber) return response.badRequest(res, 'Phone number already exists');

            const fileFields = [
                'imageOftrading',
                'imageOfnationalId',
                'imageOfiban',
                'imageOffront'
            ];

            for (const field of fileFields) {
                const file = req.files?.[field]?.[0];
                if (file) {
                    const resizedPath = file.path.replace(/(\.[\w\d_-]+)$/i, '_resized$1');
                    await sharp(file.path)
                        .resize(800, 800, { fit: 'inside' })
                        .toFile(resizedPath);

                    const result = await cloudinary.uploader.upload(resizedPath, {
                        folder: 'traders'
                    });

                    // Save URL in traderData
                    traderData[field] = result.secure_url;

                    // Clean up temp files
                    await fs.unlink(file.path);
                    await fs.unlink(resizedPath);
                }
            }

            traderData.password = await bcrypt.hash(traderData.password, 10);
            traderData.coupon = "";
            traderData.verify = false;
            traderData.block = false;
            traderData.waiting = true;

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
            const conditions = [];
            if (email) conditions.push({ email });
            if (phoneNumber) conditions.push({ phoneNumber });

            const trader = await Trader.findOne({ $or: conditions });

            if (!trader) {
                return response.unauthorized(res, 'Invalid credentials');
            }

            if (trader.block === true) {
                return response.unauthorized(res, 'You Are Blocked');
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

    async addCoupon(req, res){
        const { coupon } = req.body;
        const traderId = req.user.id;
        try{
            if(!coupon){
                return response.badRequest(res, "Must Invalid Coupon");
            }
            const existCoupon = await couponModel.find({ coupon: coupon });
            if(!existCoupon){
                return res.badRequest(res, "Please Insert Invalid Coupon");
            }
            const addCouponInDB = await couponModel.findOneAndUpdate(
                { _id: traderId },
                { coupon: coupon },
                { new: true }
            );
            
            return response.success(res, "Coupon added successfully");
        }catch(error){
            console.log(error);
            response.serverError(res, error.message);
        }
    }

    async getMyNotification(req, res){
        const traderId = req.user.id;
        try{
            const notifications = await notificationModel.find({userId: traderId});
            return response.success(res, notifications);
        }catch(error){
            console.log(error)
            return response.serverError(res, error.message);
        }
    }
}

module.exports = new TraderService();