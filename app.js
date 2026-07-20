const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const SequelizeStoreFactory = require('connect-session-sequelize');
const { sequelize } = require('./models');
const { createSessionMiddleware } = require('./config/session');

const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const authorize = require('./middleware/authorize');
const responseMiddleware = require('./middleware/responses');
const responseErrorMiddleware = require('./middleware/responseErrors');

require('./helpers/passport')(passport);

function createApp(options = {}) {
  const app = express();
  const SequelizeStore = SequelizeStoreFactory(session.Store);
  const sessionStore = options.sessionStore || new SequelizeStore({ db: sequelize });
  const sessionMiddleware = options.sessionMiddleware || createSessionMiddleware(sessionStore);

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'twig');
  app.set('sessionMiddleware', sessionMiddleware);
  app.set('sessionStore', sessionStore);
  if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

  if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(responseErrorMiddleware);
  app.use(responseMiddleware);
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/', authRouter);
  app.use(authorize.loggedIn);
  app.use('/', homeRouter);
  app.use('/', apiRouter);

  app.use((req, res, next) => next(createError(404)));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    return res.status(err.status || 500).render('error');
  });

  if (!options.skipSessionStoreSync && typeof sessionStore.sync === 'function') {
    sessionStore.sync().catch((error) => console.error('Session store sync failed:', error));
  }

  return app;
}

const app = createApp();
module.exports = app;
module.exports.createApp = createApp;
