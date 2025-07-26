// src/interfaces/traderController.js
const traderService = require('../../application/traderService');

class TraderController {
    async signup(req, res) {
        return traderService.signup(req, res);
    }

    async login(req, res) {
        return traderService.login(req, res);
    }

    async getTraderById(req, res) {
        return traderService.getTraderById(req, res);
    }

    async getTraderProductsController(req, res) {
        return traderService.getTraderProducts(req, res);
    }

    async addCouponController(req, res){
        return traderService.addCoupon(req, res);
    }

    async getMyNotificationController(req, res){
        return traderService.getMyNotification(req, res);
    }
}

module.exports = new TraderController();