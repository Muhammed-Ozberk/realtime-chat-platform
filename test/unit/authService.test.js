const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthService } = require('../../services/authService');

test('register rejects an existing username', async () => {
  const Users = {
    findOne: async () => ({ userID: 'existing' }),
    create: async () => assert.fail('create must not be called'),
  };
  const service = createAuthService({ Users });

  await assert.rejects(
    service.register({ username: 'ada', email: 'ada@example.com', password: 'secret' }),
    { code: 'USERNAME_TAKEN' },
  );
});

test('register hashes the password and creates a UUID user', async () => {
  let createdUser;
  const Users = {
    findOne: async () => null,
    create: async (values) => {
      createdUser = values;
      return values;
    },
  };
  const service = createAuthService({ Users });
  await service.register({ username: 'ada', email: 'ada@example.com', password: 'secret' });

  assert.equal(createdUser.username, 'ada');
  assert.notEqual(createdUser.password, 'secret');
  assert.match(createdUser.userID, /^[0-9a-f-]{36}$/);
});
