const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msLoket = sq.define('ms_loket', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_loket: {
        type: DataTypes.STRING
    },
    status_loket: {
        type: DataTypes.SMALLINT,
        defaultValue: 1
    }

},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = msLoket