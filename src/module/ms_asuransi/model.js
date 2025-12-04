const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msHarga = require('../ms_harga/model')

const msAsuransi = sq.define('ms_asuransi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_asuransi: {
        type: DataTypes.STRING
    },
    tipe_asuransi: {
        type: DataTypes.SMALLINT     // 1 : UMUM || 2 : BPJS || 3 : ASURANSI KESEHATAN || 4 : ASURANSI PERUSAHAAN ||  5 : KEMENKES
    },
    no_telepon_asuransi: {
        type: DataTypes.STRING
    },
    cp_nama: {
        type: DataTypes.STRING
    },
    cp_alamat: {
        type: DataTypes.STRING
    },
    cp_telepon: {
        type: DataTypes.STRING
    },
    cp_hp: {
        type: DataTypes.STRING
    },
    cp_email: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

msAsuransi.belongsTo(msHarga, { foreignKey: "ms_harga_id" })
msHarga.hasMany(msAsuransi, { foreignKey: "ms_harga_id" })

module.exports = msAsuransi