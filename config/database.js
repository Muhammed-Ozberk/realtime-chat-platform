require('dotenv').config({ quiet: true });
module.exports = {
    "development": {
        "username": process.env.DB_USER || "root",
        "password": process.env.DB_PASSWORD || "",
        "database": process.env.DB_NAME || "realtime_chat",
        "host": process.env.DB_HOST || "127.0.0.1",
        "port": Number(process.env.DB_PORT || 3306),
        "dialect": "mysql",
        "timezone": process.env.DB_TIMEZONE || "+03:00",
        "logging": false
    },
    "test": {
        "username": process.env.DB_USER || "root",
        "password": process.env.DB_PASSWORD || "",
        "database": process.env.DB_NAME || "realtime_chat_test",
        "host": process.env.DB_HOST || "127.0.0.1",
        "port": Number(process.env.DB_PORT || 3306),
        "dialect": "mysql",
        "timezone": process.env.DB_TIMEZONE || "+03:00",
        "logging": false
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "port": Number(process.env.DB_PORT || 3306),
        "dialect": "mysql",
        "timezone": process.env.DB_TIMEZONE || "+00:00",
        "logging": false
    }
};
