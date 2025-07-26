const express = require('express');
const router = express.Router();
const mainScreenController = require('../controllers/adminController');

router.get('/main', (req, res) => mainScreenController.getMainData(req, res));
router.get('/users', (req, res)=> mainScreenController.getAllUsers(req, res));
router.post('/users/:userId/:type', (req, res)=>mainScreenController.blockOrDeleteNormalUserOrTrader(req, res));
router.get('/waiting', (req, res)=>mainScreenController.getWaitingTraders(req, res));
router.post('/waiting/:id', (req, res)=>mainScreenController.toogleWaiting(req, res));
router.get('/getTradersProfits', (req, res)=>mainScreenController.getTradersProfits(req, res));
router.get('/getPlatformProfit', (req, res)=>mainScreenController.getPlatformProfit(req, res));
router.post('/send-notification', (req, res)=>mainScreenController.sendNotification(req, res));

module.exports = router;