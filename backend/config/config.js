const dotenv = require('dotenv');
dotenv.config(); // .env 파일의 내용을 process.env 객체에 넣어줌.

module.exports = {
  "development": {
    "username": process.env.USER_NAME,
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": process.env.USER_NAME,
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.USER_NAME,
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
