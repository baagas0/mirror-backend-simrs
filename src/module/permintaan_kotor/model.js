const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const { v4: uuid_v4 } = require("uuid");
const users = require('../users/model');
const msBarang = require('../ms_barang/model');

const permintaanKotor = sq.define('permintaan_kotor', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuid_v4(),
    },
    kode_permintaan: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        // comment: 'Unique request code'
    },
    nama_unit: {
        type: DataTypes.STRING,
        allowNull: false,
        // comment: 'Unit/department name making the request'
    },
    tanggal_permintaan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        // comment: 'Date of request'
    },
    status_permintaan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        // comment: '1: menunggu, 2: diambil, 3: proses sterilisasi, 4: selesai'
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Additional notes or description'
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        // comment: 'User who created the request'
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        // comment: 'User who last updated the request'
    },
    deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        // comment: 'User who deleted the request'
    }
}, {
    paranoid: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
});

const permintaanKotorList = sq.define('permintaan_kotor_list', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuid_v4(),
    },
    permintaan_kotor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        // comment: 'ID of the permintaan kotor'
    },
    ms_barang_id: {
        type: DataTypes.UUID,
        allowNull: false,
        // comment: 'ID of the item/instrument'
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // comment: 'Quantity requested'
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Item notes'
    }
}, {
    paranoid: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
});

// Associations with users
permintaanKotor.belongsTo(users, { foreignKey: 'created_by', as: 'creator' });
users.hasMany(permintaanKotor, { foreignKey: 'created_by', as: 'created_permintaan' });

permintaanKotor.belongsTo(users, { foreignKey: 'updated_by', as: 'updater' });
users.hasMany(permintaanKotor, { foreignKey: 'updated_by', as: 'updated_permintaan' });

permintaanKotor.belongsTo(users, { foreignKey: 'deleted_by', as: 'deleter' });
users.hasMany(permintaanKotor, { foreignKey: 'deleted_by', as: 'deleted_permintaan' });

// Associations with items
permintaanKotor.hasMany(permintaanKotorList, { foreignKey: 'permintaan_kotor_id', as: 'items' });
permintaanKotorList.belongsTo(permintaanKotor, { foreignKey: 'permintaan_kotor_id', as: 'permintaan' });

// Associations with barang
permintaanKotorList.belongsTo(msBarang, { foreignKey: 'ms_barang_id', as: 'barang' });
msBarang.hasMany(permintaanKotorList, { foreignKey: 'ms_barang_id', as: 'permintaan_items' });

module.exports = { permintaanKotor, permintaanKotorList };