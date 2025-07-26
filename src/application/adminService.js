const traders = require('../domain/models/trader');
const users = require('../domain/models/userModel');
const products = require('../domain/models/products');
const orders = require('../domain/models/orders');
const response = require("../shared/sharedResponse");
const mongoose = require("mongoose");
const notificationModel = require('../domain/models/notification');
class adminService {
    async getMainData(req, res) {
        try {
            const usersNumber = await users.countDocuments();
            const tradersNumber = await traders.countDocuments();
            const totalUsers = usersNumber + tradersNumber;
            const waitingTraders = await traders.find({ waiting: true });
            const totalOrders = await orders.find().countDocuments(); 
            const deliveredOrders = await orders.find({ status: 'Delivered' });
            let totalEarnings = 0;
            for (const order of deliveredOrders) {
                totalEarnings += order.totalPrice;
            }
            const adminEarnings = totalEarnings * 0.3;
            const tradersEarnings = totalEarnings * 0.7;
            return response.success(res,{
                totalUsers,
                waitingTraders: waitingTraders.length,
                totalOrders: totalOrders,
                totalEarnings: totalEarnings.toFixed(2),
                adminEarnings: adminEarnings.toFixed(2),
                tradersEarnings: tradersEarnings.toFixed(2),
            });
        } catch (error) {
            console.log(error);
            return response.serverError(res, error.message);
        }
    }

    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const totalUsers = await users.countDocuments();
            const totalTraders = await traders.countDocuments();
            const usersList = await users.find().select('-password').skip(skip).limit(limit);
            const tradersList = await traders.find().select('-password').skip(skip).limit(limit);
            return response.success(res, {
                users: usersList,
                traders: tradersList,
                pagination: {
                    page,
                    limit,
                    totalUsers,
                    totalTraders,
                    totalUserPages: Math.ceil(totalUsers / limit),
                    totalTraderPages: Math.ceil(totalTraders / limit),
                }
            });
        } catch (error) {
            console.log(error);
            return response.serverError(res, error.message);
        }
    }

    async blockOrDeleteNormalUserOrTrader(req, res) {
        const { userId, type } = req.params;
        const { role } = req.query;

        if (!userId || !type || !role) {
            return res.status(400).json({ message: 'Missing userId, type, or role.' });
        }
        try {
            const user = await traders.findById(userId);
            if (!user) {
                return res.status(404).json({ message: `${role} not found.` });
            }
            if (type === 'del') {
                await traders.findByIdAndDelete(userId);
                return res.status(200).json({ message: `${role} deleted successfully.` });
            }
            if (type === 'block') {
                const updated = await traders.findByIdAndUpdate(
                    userId,
                    { block: true },
                    { new: true }
                ); 
                return res.status(200).json({ message: `${role} blocked successfully.`, data: updated });
            }

            return res.status(400).json({ message: 'Invalid type. Use "del" or "block".' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

    async getWaitingTraders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const [waitingTraders, totalCount] = await Promise.all([
                traders.find({ waiting: true }).limit(limit).skip(skip).lean(),
                traders.countDocuments({ waiting: true })
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            return response.success(res, {
                data: waitingTraders,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages
                }
            });
        } catch (error) {
            console.error('Error fetching waiting traders:', error);
            return response.serverError(res, error.message);
        }
    }

    async toogleWaiting(req, res) {
        const traderId = req.params.id;
        try {
            const updateWaiting = await traders.findOneAndUpdate(
                { _id: traderId },
                { waiting: true },
                { new: true }
            );
            if (!updateWaiting) {
                return response.badRequest(req, 'Failed to Update waiting');
            }
            return response.success(res, updateWaiting);
        } catch (error) {
            console.log(error);
            return response.serverError(res, error.message);
        }
    }

    async getTradersProfits(req, res) {
        try {
            const deliveredOrders = await orders.find({ status: "Delivered" });
            console.log('traders', deliveredOrders);

            const profitsMap = new Map();

            deliveredOrders.forEach(order => {
                const traderId = order.traderId?.toString();
                const profit = order.totalPrice * 0.1;

                if (profitsMap.has(traderId)) {
                    profitsMap.set(traderId, profitsMap.get(traderId) + profit);
                } else {
                    profitsMap.set(traderId, profit);
                }
            });
            const allTraders = await traders.find({}); // هنا بنجيب كل التجار
            console.log("traders.....", allTraders);
            const result = [];
            profitsMap.forEach((profit, traderId) => {
                const trader = allTraders.find(t => t._id.toString() === traderId.toString());

                if (trader) {
                    result.push({
                        traderName: `${trader.firstName ?? ""} ${trader.lastName ?? ""}`.trim(),
                        traderId: trader._id,
                        phoneNumber: trader.phoneNumber,
                        totalProfit: profit,
                    });
                } else {
                    result.push({
                        traderName: "Unknown",
                        traderId: traderId,
                        totalProfit: profit,
                    });
                }
            });
            return response.success(res, result);
        } catch (error) {
            console.error("Error:", error);
            return response.serverError(res, error.message);
        }
    }

    async getPlatformProfit(req, res) {
        try {
            const deliveredOrders = await orders.find({ status: "Delivered" });
            let totalRevenue = 0;
            deliveredOrders.forEach(order => {
                if (order.totalPrice) {
                    totalRevenue += order.totalPrice;
                }
            });
            const platformProfit = totalRevenue * 0.10;
            console.log("total : ", totalRevenue);
            console.log("profit : ", platformProfit);
            return response.success(res, { platformProfit });
        } catch (error) {
            console.error("Error calculating platform profit:", error);
            return response.serverError(res, error.message);
        }
    }

    async sendNotification(req, res){
        const { userId, type, text } = req.body;
        try{    
            const newNotification = new notificationModel({
                type,
                text,
                userId
            });
            if(!type || !text || !userId){
                return response.badRequest(res, 'All Fields Are Required');
            }
            await newNotification.save();
            return response.success(res, newNotification);
        }catch(error){
            console.log(error);
            return response.serverError(res, error.message);
        }
    }

    
}

module.exports = adminService;