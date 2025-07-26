// src/interfaces/routes/traderRoutes.js
const express = require('express');
const traderController = require('../controllers/traderController');
const decodeToken = require('../../middlewares/decodeToken');
const router = express.Router();
const upload = require('../../middlewares/upload');

router.post(
  '/signup',
  upload.fields([
    { name: 'imageOftrading', maxCount: 1 },
    { name: 'imageOfnationalId', maxCount: 1 },
    { name: 'imageOfiban', maxCount: 1 },
    { name: 'imageOffront', maxCount: 1 }
  ]),
  traderController.signup
);
router.post('/login', traderController.login);
router.get('/', decodeToken, traderController.getTraderById);
router.get('/products', decodeToken, traderController.getTraderProductsController);
router.post('/addCoupon', decodeToken, traderController.addCouponController);
router.get('/getMyNotification', decodeToken, traderController.getMyNotificationController);
module.exports = router;