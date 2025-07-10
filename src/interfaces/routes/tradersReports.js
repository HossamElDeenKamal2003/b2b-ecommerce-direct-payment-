const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/traderReportsController');
const decodeToken = require('../../middlewares/decodeToken');

router.get('/orders', decodeToken, reportsController.getAllTraderOrders);
router.get('/orders/:id', decodeToken, reportsController.getTraderOrdersById);
router.put('/orders/:orderId', decodeToken, reportsController.updateOrderStatus);
router.get('/reports', decodeToken, reportsController.getWeeklySalesReport);

module.exports = router;
