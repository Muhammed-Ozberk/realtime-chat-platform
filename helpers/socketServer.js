const { Server } = require('socket.io');
const { Op } = require('sequelize');
const { Rooms } = require('../models');

function onlyAuthenticated(socket, next) {
  const passportUser = socket.request.session?.passport?.user;
  if (!passportUser?.id) return next(new Error('Authentication error'));
  socket.user = passportUser;
  return next();
}

function attach(server, sessionMiddleware, options = {}) {
  const RoomModel = options.Rooms || Rooms;
  const socketOptions = { ...options };
  delete socketOptions.Rooms;
  const io = new Server(server, { cors: false, ...socketOptions });
  io.engine.use(sessionMiddleware);
  io.use(onlyAuthenticated);

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on('sendMessage', async (message, roomID, acknowledge) => {
      try {
        if (typeof message !== 'string' || !message.trim() || typeof roomID !== 'string') {
          throw new Error('Invalid message');
        }
        const membership = await RoomModel.findOne({
          where: {
            room: roomID,
            [Op.or]: [{ userID: socket.user.id }, { recipientID: socket.user.id }],
          },
        });
        if (!membership) throw new Error('Conversation access denied');
        const recipientID = membership.userID === socket.user.id
          ? membership.recipientID
          : membership.userID;
        socket.to(`user:${recipientID}`).emit(roomID, message);
        if (typeof acknowledge === 'function') acknowledge({ status: true });
      } catch (error) {
        if (typeof acknowledge === 'function') acknowledge({ status: false, error: error.message });
      }
    });
  });

  return io;
}

module.exports = { attach, onlyAuthenticated };
