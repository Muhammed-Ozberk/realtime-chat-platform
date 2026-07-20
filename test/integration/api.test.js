const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const { createApiRouter } = require('../../routes/api');

function testApp(service) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { id: 'user-1', username: 'ada' };
    next();
  });
  app.use(createApiRouter(service));
  app.use((error, req, res, next) => res.status(error.status || 500).json({ error: error.message }));
  return app;
}

test('POST /message/save validates input', async () => {
  const response = await request(testApp({})).post('/message/save').send({ room: 'room-1' });
  assert.equal(response.status, 400);
  assert.equal(response.body.status, false);
});

test('POST /message/save passes authenticated user to the service', async () => {
  let received;
  const service = {
    saveMessage: async (payload) => {
      received = payload;
      return { id: 1, ...payload };
    },
  };
  const response = await request(testApp(service)).post('/message/save').send({
    room: 'room-1',
    message: 'Merhaba',
    recipientID: 'user-2',
  });

  assert.equal(response.status, 201);
  assert.equal(received.userID, 'user-1');
  assert.equal(response.body.data.message, 'Merhaba');
});
