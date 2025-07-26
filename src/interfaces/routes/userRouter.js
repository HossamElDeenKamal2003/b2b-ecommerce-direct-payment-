const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const decodeToken = require('../../middlewares/decodeToken');
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/favorites', decodeToken, userController.addFavorite);
router.delete('/favorites', decodeToken, userController.removeFavorite);
router.get('/favorites', decodeToken, userController.listFavorites);
router.post('/shopping', decodeToken, userController.addListShopping);
router.get('/shopping', decodeToken, userController.listCardShopping);
router.delete('/shopping', decodeToken, userController.deleteFromShopping);
router.put('/cancelled-order/:id', decodeToken, userController.cancellOrder);
router.get('/getMyNotification', decodeToken, userController.getMyNotificationController)
module.exports = router;