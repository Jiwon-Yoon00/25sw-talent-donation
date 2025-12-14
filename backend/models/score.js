const Sequelize = require('sequelize');

module.exports = class Score extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            user_id: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            avgWpm: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            maxWpm: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            elapsedTime: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            accuracy: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING(20),
                allowNull: false,
            }
        },{
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Score',
            tableName: 'scores',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Score.belongsTo(db.User, {
            foreignKey: 'user_id',
            targetKey: 'user_id',
            as: 'user'
        });
    }
};