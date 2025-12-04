const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');

const sep = sq.define('sep', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    request: {
        type: DataTypes.JSON
    },
    response: {
        type: DataTypes.JSON           
    },
    no_sep: {
        type: DataTypes.STRING 
    },
    keterangan_sep: {
        type: DataTypes.STRING             
    },
    tipe: {
        type: DataTypes.STRING             
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

sep.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(sep, { foreignKey: "registrasi_id" })


module.exports = sep