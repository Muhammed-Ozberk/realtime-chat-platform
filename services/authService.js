const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const allModels = require('../models');

function createAuthService({ Users = allModels.Users } = {}) {
  return {
    async register({ username, email, password }) {
      const existingUser = await Users.findOne({ where: { username } });
      if (existingUser) {
        const error = new Error('Bu kullanıcı adı başka bir hesap tarafından kullanılmakta');
        error.code = 'USERNAME_TAKEN';
        throw error;
      }

      return Users.create({
        userID: randomUUID(),
        username,
        email,
        password: await bcrypt.hash(password, 10),
      });
    },
  };
}

module.exports = createAuthService();
module.exports.createAuthService = createAuthService;
