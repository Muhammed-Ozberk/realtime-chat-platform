const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const session = require('express-session');
const request = require('supertest');
const { io: createClient } = require('socket.io-client');
const { attach } = require('../../helpers/socketServer');

function connect(url, cookie) {
  return createClient(url, {
    transports: ['websocket'],
    forceNew: true,
    extraHeaders: cookie ? { Cookie: cookie } : undefined,
  });
}

test('Socket.IO requires and reuses the secure HTTP session cookie', async (t) => {
  const app = express();
  const sessionMiddleware = session({
    secret: 'integration-test-secret-at-least-32-characters',
    resave: false,
    saveUninitialized: false,
  });
  app.use(sessionMiddleware);
  app.get('/test-login', (req, res) => {
    req.session.passport = { user: { id: 'user-1', username: 'ada' } };
    req.session.save(() => res.sendStatus(204));
  });

  const server = http.createServer(app);
  const Rooms = {
    findAll: async () => [{ room: 'room-1' }],
    findOne: async () => ({ room: 'room-1', userID: 'user-1', recipientID: 'user-2' }),
  };
  const io = attach(server, sessionMiddleware, { Rooms });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => io.close(() => server.close(resolve))));
  const url = `http://127.0.0.1:${server.address().port}`;

  const anonymous = connect(url);
  const anonymousError = await new Promise((resolve) => anonymous.once('connect_error', resolve));
  assert.match(anonymousError.message, /Authentication/);
  anonymous.close();

  const login = await request(url).get('/test-login');
  const cookie = login.headers['set-cookie'][0].split(';')[0];
  const authenticated = connect(url, cookie);
  await new Promise((resolve, reject) => {
    authenticated.once('connect', resolve);
    authenticated.once('connect_error', reject);
  });
  assert.equal(authenticated.connected, true);
  authenticated.close();
});
