const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Users } = require('../models');

module.exports = function configurePassport(passport) {
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await Users.findOne({ where: { username } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Giriş bilgileri hatalı' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, {
      id: user.userID,
      username: user.username,
      themeMode: user.themeMode,
      email: user.email,
    });
  });

  passport.deserializeUser((user, done) => done(null, user));
};
