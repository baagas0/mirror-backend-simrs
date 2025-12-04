const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const roles = require('../roles/model');

const users = sq.define('users',{
        id:{
            type: DataTypes.STRING,
            primaryKey: true,
        },
        username:{
            type:DataTypes.STRING
        },
        password:{
            type:DataTypes.STRING
        },
        role:{
            type:DataTypes.STRING
        }
    },
    {
        paranoid:true,
        freezeTableName:true
    }
);

/** Start ROLE USER */
users.belongsToMany(roles, {
    as: 'UserRole',
    through: 'user_roles',
    foreignKey: 'user_id'
})
roles.belongsToMany(users, {
    as: 'UserRole',
    through: 'user_roles',
    foreignKey: 'role_id'
})

module.exports = users