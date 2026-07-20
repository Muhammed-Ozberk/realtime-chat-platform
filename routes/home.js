const router = require('express').Router();
const controller = require('../controllers/homeController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/chats', asyncHandler(controller.chats));
router.get('/chats/:roomID/:recipientID', asyncHandler(controller.conversation));
router.get('/contacts', asyncHandler(controller.contacts));
router.get('/groups', controller.groups);
router.get('/profile', controller.profile);
router.get('/settings', controller.settings);
router.get('/contacts/:recipientID', asyncHandler(controller.openContact));
router.get('/theme-mode', asyncHandler(controller.toggleTheme));
router.get('/add-to-friends/:friendID/:friendName', asyncHandler(controller.addFriend));
router.get('/accept-the-request/:userID', asyncHandler(controller.acceptFriend));

module.exports = router;
