const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const kas = require('../kas/model');
const pembelian = require('../pembelian/model');

const pembayaranPembelian = sq.define('pembayaran_pembelian', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_pembayaran: {
        type: DataTypes.DATE
    },
    jumlah_bayar: {
        type: DataTypes.FLOAT
    },
    tipe_bayar: {
        type: DataTypes.SMALLINT // 1. tunai || 2.debet/kredit || 3.client/clientas
    },
    tipe_kartu: {
        type: DataTypes.SMALLINT // 1. debet || 2.kredit 
    },
    no_kartu: {
        type: DataTypes.STRING
    },
    no_transaksi: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

pembayaranPembelian.belongsTo(kas, { foreignKey: 'kas_id' });
kas.hasMany(pembayaranPembelian, { foreignKey: 'kas_id' });

pembayaranPembelian.belongsTo(pembelian, { foreignKey: 'pembelian_id' });
pembelian.hasMany(pembayaranPembelian, { foreignKey: 'pembelian_id' });

module.exports = pembayaranPembelian