const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msRuang = require('../ms_ruang/model');

const msKamar = sq.define('ms_kamar', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kamar: {
        type: DataTypes.STRING
    },
    keterangan_kamar: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

msKamar.belongsTo(msRuang,{foreignKey:'ms_ruang_id'});
msRuang.hasMany(msKamar,{foreignKey:'ms_ruang_id'});

module.exports = msKamar