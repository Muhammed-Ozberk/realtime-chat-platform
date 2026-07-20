const session = require('express-session');

function createSessionMiddleware(store) {
  const secret = process.env.SESSION_SECRET || 'development-only-change-me';

  if (process.env.NODE_ENV === 'production' && secret === 'development-only-change-me') {
    throw new Error('SESSION_SECRET must be set in production');
  }

  return session({
    name: process.env.SESSION_COOKIE_NAME || 'realtime_chat.sid',
    secret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: Number(process.env.SESSION_MAX_AGE_MS || 60 * 60 * 1000),
    },
  });
}

module.exports = { createSessionMiddleware };
