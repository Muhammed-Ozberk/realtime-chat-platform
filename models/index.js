'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


var migrate = function () {
  return new Promise((resolve, reject) => {
    const umzug = new Umzug({
      migrations: {
        glob: 'migrations/*.js',
        resolve: ({ name, path: migrationPath, context }) => {
          const migration = require(migrationPath);
          return {
            name,
            up: () => migration.up(context, Sequelize),
            down: () => migration.down(context, Sequelize),
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });
    umzug.up().then(function (migrations) {
      resolve(migrations);
      // console.log(`Executed migrations ${migrations}`);
    }).catch(err => {
      reject(err);
    });
  })
}


db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.sequelize.migrate = migrate;


module.exports = db;
