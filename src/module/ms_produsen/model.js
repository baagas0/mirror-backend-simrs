const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msProdusen = sq.define('ms_produsen', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_produsen: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msProdusen