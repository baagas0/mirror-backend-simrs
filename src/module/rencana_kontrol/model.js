const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');

const rencana_kontrol = sq.define('rencana_kontrol', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    request_kontrol: {
        type: DataTypes.JSON
    },
    response_kontrol: {
        type: DataTypes.JSON           
    },
    no_surat_kontrol: {
        type: DataTypes.STRING 
    },
    keterangan_kontrol: {
        type: DataTypes.STRING             
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

rencana_kontrol.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(rencana_kontrol, { foreignKey: "registrasi_id" })


module.exports = rencana_kontrol