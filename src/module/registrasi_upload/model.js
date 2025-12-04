const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const registrasi = require('../registrasi/model');
const user = require('../users/model');
const registrasiUpload = sq.define('registrasi_upload', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    judul: {
        type: DataTypes.STRING
    },
    nama_file: {
        type: DataTypes.STRING
    },
    url: {
        type: DataTypes.STRING
    },
    keterangan: {
        type: DataTypes.TEXT
    },
    created_name: {
        type: DataTypes.STRING
    },
    deleted_name: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

registrasiUpload.belongsTo(registrasi, { foreignKey: 'registrasi_id' });
registrasi.hasMany(registrasiUpload, { foreignKey: 'registrasi_id' });

registrasiUpload.belongsTo(user, { foreignKey: 'created_by' });
user.hasMany(registrasiUpload, { foreignKey: 'created_by' });

registrasiUpload.belongsTo(user, { foreignKey: 'deleted_by' });
user.hasMany(registrasiUpload, { foreignKey: 'deleted_by' });

module.exports = registrasiUpload