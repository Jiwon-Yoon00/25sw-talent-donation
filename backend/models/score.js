const Sequelize = require('sequelize');

module.exports = class Score extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            avg_speed: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            max_speed: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            accuracy: {
                type: Sequelize.FLOAT,
                allowNull: false,
            }
        },{
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Score.belongsTo(db.User, {
            foreignkey: 'user_id'
        });
    }
};