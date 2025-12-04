const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msBarang = require('../ms_barang/model');
const permintaanKotor = require('./model');

const permintaanKotorList = sq.define('permintaan_kotor_list', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    permintaan_kotor_id: {
        type: DataTypes.STRING,
        allowNull: false,
        // comment: 'Foreign key to permintaan_kotor'
    },
    ms_barang_id: {
        type: DataTypes.STRING,
        allowNull: false,
        // comment: 'Foreign key to master_barang'
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        // comment: 'Quantity requested'
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Additional notes for specific item'
    }
}, {
    paranoid: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

// Associations
permintaanKotorList.belongsTo(permintaanKotor, { foreignKey: 'permintaan_kotor_id' });
permintaanKotor.hasMany(permintaanKotorList, { foreignKey: 'permintaan_kotor_id' });

permintaanKotorList.belongsTo(msBarang, { foreignKey: 'ms_barang_id' });
msBarang.hasMany(permintaanKotorList, { foreignKey: 'ms_barang_id' });

module.exports = permintaanKotorList;