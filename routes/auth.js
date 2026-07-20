const router = require('express').Router();
const controller = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const notLoggedIn = require('../middleware/authorize').notLoggedIn;

router.get('/login', notLoggedIn, controller.showLogin);
router.get('/register', controller.showRegister);
router.post('/login-post', notLoggedIn, controller.login);
router.get('/logout', controller.logout);
router.post('/register-post', asyncHandler(controller.register));

module.exports = router;
