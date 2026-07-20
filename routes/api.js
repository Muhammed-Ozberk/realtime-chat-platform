const defaultController = require('../controllers/apiController');
const { createApiController } = require('../controllers/apiController');
const asyncHandler = require('../middleware/asyncHandler');

function createApiRouter(service) {
  const configuredRouter = require('express').Router();
  const controller = service ? createApiController(service) : defaultController;
  configuredRouter.post('/message/save', asyncHandler(controller.saveMessage));
  configuredRouter.post('/chats/read', asyncHandler(controller.markMessagesRead));
  configuredRouter.get('/bring-contacts/:personToSearch', asyncHandler(controller.searchContacts));
  return configuredRouter;
}

module.exports = createApiRouter();
module.exports.createApiRouter = createApiRouter;
