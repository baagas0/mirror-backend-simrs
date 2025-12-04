const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const kota = require('../kota/model');

const kecamatan = sq.define('kecamatan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kecamatan: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

kecamatan.belongsTo(kota, { foreignKey: 'kota_id' });
kota.hasMany(kecamatan, { foreignKey: 'kota_id' })


module.exports = kecamatan