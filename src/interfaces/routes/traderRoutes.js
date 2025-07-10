// src/interfaces/routes/traderRoutes.js
const express = require('express');
const traderController = require('../controllers/traderController');
const decodeToken = require('../../middlewares/decodeToken');
const router = express.Router();

router.post('/signup', traderController.signup);
router.post('/login', traderController.login);
router.get('/', decodeToken, traderController.getTraderById);
router.get('/products', decodeToken, traderController.getTraderProductsController);

module.exports = router;