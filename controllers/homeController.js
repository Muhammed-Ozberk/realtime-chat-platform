const chatService = require('../services/chatService');

function pageData(user, activePage) {
  return {
    activePage,
    userAvatar: user.username.slice(0, 1).toUpperCase(),
    themeMode: user.themeMode,
  };
}

function createHomeController(service = chatService) {
  return {
    async chats(req, res) {
      const user = req.user;
      const data = {
        ...pageData(user, 'chats'),
        _chatList: await service.listChats(user.id),
      };
      res.render('pages/chats', { title: 'Chats', data });
    },

    async conversation(req, res) {
      const user = req.user;
      const { roomID, recipientID } = req.params;
      const [{ recipient, messages }, _chatList] = await Promise.all([
        service.getConversation({ roomID, recipientID, userID: user.id }),
        service.listChats(user.id),
      ]);
      const data = {
        ...pageData(user, 'chats'),
        _chatList,
        roomID,
        recipientID,
        userID: user.id,
        messages,
        username: user.username,
        recipientName: recipient.username,
        recipientAvatar: recipient.username.slice(0, 1).toUpperCase(),
      };
      res.render('pages/chats', { title: 'Chats', data });
    },

    async contacts(req, res) {
      const user = req.user;
      const contacts = await service.getContacts(user.id);
      const data = { ...pageData(user, 'contacts'), ...contacts, userID: user.id };
      res.render('pages/contacts', { title: 'Contacts', data });
    },

    groups(req, res) {
      res.render('pages/groups', { title: 'Groups', data: pageData(req.user, 'groups') });
    },

    profile(req, res) {
      const data = {
        ...pageData(req.user, 'profile'),
        username: req.user.username,
        email: req.user.email,
      };
      res.render('pages/profile', { title: 'Profile', data });
    },

    settings(req, res) {
      res.render('pages/settings', { title: 'Settings', data: pageData(req.user, 'settings') });
    },

    async openContact(req, res) {
      const room = await service.findOrCreateRoom({
        userID: req.user.id,
        recipientID: req.params.recipientID,
      });
      res.redirect(`/chats/${room}/${req.params.recipientID}`);
    },

    async toggleTheme(req, res) {
      req.user.themeMode = await service.setTheme({
        userID: req.user.id,
        themeMode: req.user.themeMode,
      });
      res.redirect('/chats');
    },

    async addFriend(req, res) {
      await service.addFriend({ user: req.user, ...req.params });
      res.redirect('/contacts');
    },

    async acceptFriend(req, res) {
      await service.acceptFriend({ currentUserID: req.user.id, requesterID: req.params.userID });
      res.redirect('/contacts');
    },
  };
}

module.exports = createHomeController();
module.exports.createHomeController = createHomeController;
