const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msGudang = require('../ms_gudang/model');

const labPaket = sq.define('lab_paket', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_lab_paket: {
        type: DataTypes.STRING
    },
    keterangan_lab_paket: {
        type: DataTypes.STRING
    },
    status_lab_paket: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    kode_loinc: {
        type: DataTypes.STRING
    },
    kode_kptl: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

labPaket.belongsTo(msGudang, { foreignKey: 'gudang_id' });
msGudang.hasMany(labPaket, { foreignKey: 'gudang_id' })


module.exports = labPaket