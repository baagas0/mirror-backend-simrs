const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const settingKodeAkun = sq.define('setting_kode_akun', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_kategori: {
        type: DataTypes.STRING
    },
    kode: {
        type:DataTypes.STRING
    },
    setting_1: {
        type:DataTypes.STRING
    },
    setting_2: {
        type:DataTypes.STRING
    },
    setting_3: {
        type:DataTypes.STRING
    },
    d_k: {
        type:DataTypes.STRING
    },
    keterangan: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = settingKodeAkun