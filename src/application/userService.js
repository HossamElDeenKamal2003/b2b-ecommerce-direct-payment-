const User = require('../domain/models/userModel');
const response = require('../shared/sharedResponse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const listShopping = require('../domain/models/cardShoppings');
const Product = require("../domain/models/products");
const orders = require('../domain/models/orders');
const {promise} = require("bcrypt/promises");
const favouriteModel = require('../domain/models/favourites');
const notificationModel = require('../domain/models/notification');
const mongoose = require('mongoose')
class UserService {
    async signup(req, res) {
        try {
            const { firstName, lastName, email, phoneNumber, password } = req.body;
            if (!firstName || !lastName || !email || !phoneNumber || !password)
                return response.badRequest(res, 'All fields are required');

            const existingEmail = await User.findOne({ email });
            if (existingEmail)
                return response.conflict(res, 'Email already in use');

            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone)
                return response.conflict(res, 'Phone number already in use');

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                firstName,
                lastName,
                email,
                phoneNumber,
                favourites: [],
                password: hashedPassword
            });
            await user.save();

            return response.success(res, user, 'Signup successful', 201);
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async login(req, res) {
        try {
            const { email, phoneNumber, password } = req.body;
            if ((!email && !phoneNumber) || !password)
                return response.badRequest(res, 'Email or phone number and password are required');

            const user = await User.findOne({
                $or: [
                    { email: email || null },
                    { phoneNumber: phoneNumber || null }
                ]
            });
            if (!user)
                return response.unauthorized(res, 'Invalid credentials');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return response.unauthorized(res, 'Invalid credentials');

            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return response.success(res, { user, token }, 'Login successful');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async addFavorite(req, res) {
        const { productId } = req.body;
        const userId = req.user.id;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return response.notFound(res, 'User not found');
            }

            const existing = await favouriteModel.findOne({ userId, productId });

            let message;
            if (existing) {
                // Remove favorite
                await favouriteModel.deleteOne({ userId, productId });
                message = 'Product removed from favorites';
            } else {
                // Add favorite
                await favouriteModel.create({ userId, productId });
                message = 'Product added to favorites';
            }

            const favorites = await favouriteModel.find({ userId }).populate('productId');

            return response.success(res, favorites.map(f => f.productId), message);

        } catch (error) {
            return response.serverError(res, error.message);
        }
    }


    async removeFavorite(req, res) {
        const { productId } = req.body;
        const userId = req.user.id;
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { favourites: productId } },
            { new: true }
        ).populate('favourites');
        return response.success(res, user.favourites, 'Product removed from favorites');
    }

    async listFavorites(req, res) {
        const userId = req.user.id;
        try {
            const favorites = await favouriteModel.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(userId) }
                },
                {
                    $lookup: {
                        from: 'products',            
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product' 
                },
                {
                    $replaceRoot: { newRoot: '$product' }
                }
            ]);

            return response.success(res, favorites, 'Favorite products');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async addListShopping(req, res) {
        const userId = req.user.id;
        const productId = req.body.productId;

        try {
            if (!productId || !userId) {
                return response.badRequest(res, 'All fields are required');
            }
            const productExists = await Product.findOne({ _id: productId });
            if (!productExists) {
                return response.notFound(res, 'Product not found');
            }
            const alreadyAdded = await listShopping.findOne({ userId, productId });
            if (alreadyAdded) {
                return response.badRequest(res, 'Product already in your shopping list');
            }

            const newItem = await listShopping.create({ userId, productId });

            return response.success(res, newItem, 'Product added to cart');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async listCardShopping(req, res) {
        const userId = req.user.id;
        try {
            // enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
            const [cartItems, userOrders] = await Promise.all([
                listShopping.find({ userId }).populate('productId'),
                orders.find({ 
                userId, 
                status: { $in: ['Pending', 'Shipped', 'Delivered'] } 
                }).populate('productId')
            ]);
            const products = cartItems.map(item => item.productId);
            return response.success(res, {
                cart: products,
                orders: userOrders,
                cartLength: products.length
            }, 'Fetched shopping cart and orders successfully');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async cancellOrder(req, res){
        const userId = req.user.id;
        const orderId = req.params.id;
        try{
            const cancellOrder = await orders.findOneAndUpdate(
                {_id: orderId},
                {status: 'Cancelled'},
                {new: true}
            );
            
            return response.success(res, {cancellOrder}, 'order cancelled successfully');

        }catch(error){
            return response.serverError(res, error.message);
        }
    }

    async deleteFromShopping(req, res) {
        const userId = req.user.id;
        const productId = req.body.productId;

        try {
            if (!productId) {
                return response.badRequest(res, 'Product ID is required');
            }

            const deletedItem = await listShopping.findOneAndDelete({ userId, productId });

            if (!deletedItem) {
                return response.notFound(res, 'Item not found in shopping cart');
            }

            return response.success(res, deletedItem, 'Item removed from shopping cart');
        } catch (error) {
            return response.serverError(res, error.message);
        }
    }

    async getMyNotification(req, res){
            const userId = req.user.id;
            try{
                const notifications = await notificationModel.find({userId: userId});
                return response.success(res, notifications);
            }catch(error){
                console.log(error)
                return response.serverError(res, error.message);
            }
    }
}

module.exports = new UserService();