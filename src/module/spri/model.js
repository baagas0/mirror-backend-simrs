const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');

const spri = sq.define('spri', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    request_spri: {
        type: DataTypes.JSON
    },
    response_spri: {
        type: DataTypes.JSON           
    },
    no_spri: {
        type: DataTypes.STRING 
    },
    keterangan_spri: {
        type: DataTypes.STRING             
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

spri.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(spri, { foreignKey: "registrasi_id" })


module.exports = spri