const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const inacbg_log = sq.define('inacbg_log', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    request_payload: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    response_body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = inacbg_log