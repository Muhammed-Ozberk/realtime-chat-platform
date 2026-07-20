const chatService = require('../services/chatService');

function createApiController(service = chatService) {
  return {
    async saveMessage(req, res) {
      const { room, message, recipientID } = req.body;
      const userID = req.user.id;
      if (!room || !message || !recipientID) {
        return res.status(400).json({ status: false, error: 'room, message and recipientID are required' });
      }

      const recordedMessage = await service.saveMessage({ room, message, recipientID, userID });
      return res.status(201).json({ status: true, data: recordedMessage });
    },

    async markMessagesRead(req, res) {
      const { roomID, recipientID } = req.body;
      if (!roomID || !recipientID) {
        return res.status(400).json({ status: false, error: 'roomID and recipientID are required' });
      }
      await service.markMessagesRead({ roomID, recipientID, userID: req.user.id });
      return res.json({ status: true });
    },

    async searchContacts(req, res) {
      const { personToSearch } = req.params;
      if (!personToSearch) return res.status(400).json({ status: false });
      const persons = await service.searchContacts({
        query: personToSearch,
        currentUsername: req.user.username,
      });
      return res.json({ persons });
    },
  };
}

module.exports = createApiController();
module.exports.createApiController = createApiController;
