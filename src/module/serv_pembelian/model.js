const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const kas = require('../kas/model');

const servPembelian = sq.define('serv_pembelian', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_serv_pembelian: {
        type: DataTypes.DATE
    },
    kode_serv_pembelian: {
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    file_name: {
        type: DataTypes.STRING 
    },
    tipe_pembayaran: {
        type: DataTypes.SMALLINT 
    },
    status_serv_pembelian: {
        type: DataTypes.SMALLINT // 0: tidak aktif || 1:aktif
    },
    is_processed: {
        type: DataTypes.SMALLINT
    },
    keterangan: {
        type: DataTypes.STRING 
    },
    jumlah: {
        type: DataTypes.FLOAT 
    },
    jumlah_terproses: {
        type: DataTypes.FLOAT 
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

servPembelian.belongsTo(kas, { foreignKey: 'kas_id' });
kas.hasMany(servPembelian, { foreignKey: 'kas_id' });

module.exports = servPembelian