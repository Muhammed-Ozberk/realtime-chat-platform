const test = require('node:test');
const assert = require('node:assert/strict');
const { onlyAuthenticated } = require('../../helpers/socketServer');

test('socket authentication accepts a Passport session user', () => {
  const socket = { request: { session: { passport: { user: { id: 'user-1' } } } } };
  onlyAuthenticated(socket, (error) => assert.equal(error, undefined));
  assert.equal(socket.user.id, 'user-1');
});

test('socket authentication rejects requests without a session user', () => {
  const socket = { request: { session: {} } };
  onlyAuthenticated(socket, (error) => assert.match(error.message, /Authentication/));
});
