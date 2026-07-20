const { Op } = require('sequelize');
const { Rooms, Messages, Users } = require('../models');

module.exports = async function listChats(userID) {
  const rooms = await Rooms.findAll({
    where: { [Op.or]: [{ userID }, { recipientID: userID }] },
    order: [['updatedAt', 'DESC']],
  });

  const chats = await Promise.all(rooms.map(async (room) => {
    const otherUserID = room.userID === userID ? room.recipientID : room.userID;
    const [otherUser, latestMessage, unreadCount] = await Promise.all([
      Users.findOne({ where: { userID: otherUserID } }),
      Messages.findOne({ where: { room: room.room }, order: [['id', 'DESC']] }),
      Messages.count({ where: { room: room.room, userID: otherUserID, isRead: false } }),
    ]);

    if (!otherUser) return null;
    return {
      userID: otherUser.userID,
      room: room.room,
      username: otherUser.username,
      userAvatar: otherUser.username.slice(0, 1).toUpperCase(),
      lastMsg: latestMessage?.message || '',
      messageQuantity: unreadCount,
    };
  }));

  return chats.filter(Boolean);
};
