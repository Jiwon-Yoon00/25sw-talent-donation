const dotenv = require('dotenv');
dotenv.config(); // .env 파일의 내용을 process.env 객체에 넣어줌.

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "TypingWapp",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "TypingWapp_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "TypingWapp_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
