const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const kecamatan = require('../kecamatan/model');

const kelurahan = sq.define('kelurahan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kelurahan: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true,

    });

kelurahan.belongsTo(kecamatan, { foreignKey: 'kecamatan_id' });
kecamatan.hasMany(kelurahan, { foreignKey: 'kecamatan_id' })


module.exports = kelurahan