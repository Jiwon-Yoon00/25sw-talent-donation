const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

const User = require('./user');
const Score = require('./score');

const db = {};
const sequelize = new Sequelize(
    config.database, 
    config.username, 
    config.password, 
    config
);
db.sequelize = sequelize;
db.User = User;
db.Score = Score;

User.init(sequelize);
Score.init(sequelize);

User.associate(db);
Score.associate(db);

module.exports = db;
