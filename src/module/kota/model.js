const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const provinsi = require('../provinsi/model');

const kota = sq.define('kota', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kota: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

kota.belongsTo(provinsi, { foreignKey: 'provinsi_id' });
provinsi.hasMany(kota, { foreignKey: 'provinsi_id' })


module.exports = kota