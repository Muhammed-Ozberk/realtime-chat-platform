const passport = require('passport');
const authService = require('../services/authService');

function createAuthController(service = authService) {
  return {
    showLogin(req, res) {
      const error = req.session.messages === 'undefined' ? null : req.session.messages;
      res.render('pages/login', { title: 'Login', error });
    },

    showRegister(req, res) {
      res.render('pages/register', { title: 'Register' });
    },

    login(req, res, next) {
      passport.authenticate('local', {
        successRedirect: '/chats',
        failureRedirect: '/login',
        failureMessage: true,
      })(req, res, next);
    },

    logout(req, res, next) {
      req.logout((error) => {
        if (error) return next(error);
        req.session.destroy(() => res.redirect('/'));
      });
    },

    async register(req, res) {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).render('pages/register', { error: ['Tüm alanlar zorunludur'] });
      }

      try {
        await service.register({ username, email, password });
        return res.redirect('/login');
      } catch (error) {
        if (error.code === 'USERNAME_TAKEN') {
          return res.status(409).render('pages/register', { error: [error.message] });
        }
        throw error;
      }
    },
  };
}

module.exports = createAuthController();
module.exports.createAuthController = createAuthController;
