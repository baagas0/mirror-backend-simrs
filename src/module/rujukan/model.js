const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');

const rujukan = sq.define('rujukan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    request_rujukan: {
        type: DataTypes.JSON
    },
    response_rujukan: {
        type: DataTypes.JSON           
    },
    no_rujukan: {
        type: DataTypes.STRING 
    },
    keterangan_rujukan: {
        type: DataTypes.STRING             
    },
    tipe_rujukan: {
        type: DataTypes.STRING             
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

rujukan.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(rujukan, { foreignKey: "registrasi_id" })


module.exports = rujukan