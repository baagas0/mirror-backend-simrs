const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const menu = require('../menu/model');

const roles = sq.define('roles',{
        id:{
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name:{
            type:DataTypes.STRING
        }
    },
    {
        paranoid:true,
        freezeTableName:true
    }
);

/** Start ROLE ACCESS MENU */
menu.belongsToMany(roles, {
    as: 'RoleAccess',
    through: 'role_access',
    foreignKey: 'menu_id'
})
roles.belongsToMany(menu, {
    as: 'RoleAccess',
    through: 'role_access',
    foreignKey: 'role_id'
})

module.exports = roles