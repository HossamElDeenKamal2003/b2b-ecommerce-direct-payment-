const express = require('express');
const traderRoutes = require('./traderRoutes');
const orderRoutes = require('./orderRoutes');
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRouter');
const reportsRoutes = require('./tradersReports');
const mainScreenController = require('./mainPageRoutes');
const adminRouters = require('../routes/adminRouter');
require('dotenv').config();
const router = express.Router();

router.use('/traders', traderRoutes);
router.use('/reports', reportsRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/main', mainScreenController);
router.use('/admin', adminRouters);
module.exports = router;