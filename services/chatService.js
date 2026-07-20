const { Op } = require('sequelize');
const { randomUUID } = require('crypto');
const allModels = require('../models');
const chatList = require('../helpers/listFunction');

function createChatService({
  Users = allModels.Users,
  Rooms = allModels.Rooms,
  Messages = allModels.Messages,
  Friends = allModels.Friends,
  listChats = chatList,
} = {}) {
  return {
    listChats,

    async getConversation({ roomID, recipientID, userID }) {
      const recipient = await Users.findOne({ where: { userID: recipientID } });
      if (!recipient) {
        const error = new Error('Recipient not found');
        error.status = 404;
        throw error;
      }

      const room = await Rooms.findOne({ where: { room: roomID } });
      if (room && ![room.userID, room.recipientID].includes(userID)) {
        const error = new Error('Conversation access denied');
        error.status = 403;
        throw error;
      }

      if (!room) return { recipient, messages: [] };

      await Messages.update({ isRead: true }, { where: { room: roomID, userID: recipientID } });

      const messages = await Messages.findAll({
        where: { room: roomID },
        order: [['id', 'ASC']],
      });

      return { recipient, messages };
    },

    async saveMessage({ room, message, recipientID, userID }) {
      const [conversation] = await Rooms.findOrCreate({
        where: { room },
        defaults: { room, userID, recipientID },
      });

      const isParticipant = [conversation.userID, conversation.recipientID].includes(userID);
      if (!isParticipant) {
        const error = new Error('Not allowed to post to this conversation');
        error.status = 403;
        throw error;
      }

      return Messages.create({ room, userID, message });
    },

    markMessagesRead({ roomID, recipientID, userID }) {
      return Rooms.findOne({
        where: {
          room: roomID,
          [Op.or]: [{ userID }, { recipientID: userID }],
        },
      }).then((room) => {
        if (!room) {
          const error = new Error('Conversation not found');
          error.status = 404;
          throw error;
        }
        return Messages.update(
          { isRead: true },
          { where: { room: roomID, userID: recipientID } },
        );
      });
    },

    searchContacts({ query, currentUsername }) {
      const normalizedQuery = query.normalize('NFKD').replace(/[\u0300-\u036F]/g, '');
      return Users.findAll({
        attributes: ['userID', 'username', 'email'],
        where: {
          username: {
            [Op.substring]: normalizedQuery,
            [Op.ne]: currentUsername,
          },
        },
      });
    },

    async getContacts(userID) {
      const [userList, friendRequests] = await Promise.all([
        Friends.findAll({
          attributes: ['firstUserID', 'firstUserName', 'secondUserID', 'secondUserName'],
          where: {
            [Op.or]: [
              { firstUserID: userID, isFriend: true },
              { secondUserID: userID, isFriend: true },
            ],
          },
          order: [['id', 'ASC']],
        }),
        Friends.findAll({
          attributes: ['firstUserID', 'firstUserName'],
          where: { secondUserID: userID, isFriend: false },
        }),
      ]);
      return { userList, friendRequests };
    },

    async findOrCreateRoom({ userID, recipientID }) {
      const existingRoom = await Rooms.findOne({
        where: {
          [Op.or]: [
            { userID, recipientID },
            { userID: recipientID, recipientID: userID },
          ],
        },
      });
      return existingRoom ? existingRoom.room : randomUUID();
    },

    setTheme({ userID, themeMode }) {
      const nextTheme = themeMode === 'light' ? 'dark' : 'light';
      return Users.update({ themeMode: nextTheme }, { where: { userID } }).then(() => nextTheme);
    },

    async addFriend({ user, friendID, friendName }) {
      return Friends.findOrCreate({
        where: { firstUserID: user.id, secondUserID: friendID },
        defaults: {
          firstUserID: user.id,
          firstUserName: user.username,
          secondUserID: friendID,
          secondUserName: friendName,
        },
      });
    },

    async acceptFriend({ currentUserID, requesterID }) {
      const request = await Friends.findOne({
        where: { firstUserID: requesterID, secondUserID: currentUserID, isFriend: false },
      });
      if (request) await request.update({ isFriend: true });
      return Boolean(request);
    },
  };
}

module.exports = createChatService();
module.exports.createChatService = createChatService;
