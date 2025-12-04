const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const kas = require('../kas/model');
const tagihan = require('../tagihan/model');


const pembayaranTagihan = sq.define('pembayaran_tagihan',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    jumlah_bayar_tagihan:{
        type: DataTypes.FLOAT
    },
    tgl_pembayaran_tagihan:{
        type: DataTypes.DATE
    },
    tipe_pembayaran_tagihan:{
        type: DataTypes.SMALLINT        // 1 : tunai || 2 : debit || 3 : client
    },
    tipe_kartu_tagihan:{
        type: DataTypes.SMALLINT        //
    },
    no_kartu_bank_tagihan:{
        type: DataTypes.STRING
    },
    no_transaksi_tagihan:{
        type: DataTypes.STRING
    },
    foto_pembayaran_tagihan:{
        type: DataTypes.STRING
    },
    kartu_bank_pembayaran_tagihan:{
        type: DataTypes.STRING
    },
    no_kwitansi_tagihan:{
        type: DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

pembayaranTagihan.belongsTo(tagihan, { foreignKey: 'tagihan_id' });
tagihan.hasMany(pembayaranTagihan, { foreignKey: 'tagihan_id' });

pembayaranTagihan.belongsTo(kas, { foreignKey: 'kas_id' });
kas.hasMany(pembayaranTagihan, { foreignKey: 'kas_id' });


module.exports = pembayaranTagihan