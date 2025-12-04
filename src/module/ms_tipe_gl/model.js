const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msTipeGl = sq.define('ms_tipe_gl', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    remark:{
        type: DataTypes.STRING
    },
    sequence:{
        type: DataTypes.INTEGER, //0 static buat otomatis, selain 0 buat manual
        defaultValue:1 //0 buat yg otomatis, waktu create awal kirim 0 dri FE. 1 buat default yg manual, selanjutnya auto increament dri BE
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msTipeGl