const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const registrasi= require('../registrasi/model')


const assesment_medis_igd = sq.define('assesment_medis_igd', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    is_validasi:{
        type:DataTypes.BOOLEAN
    },
    json_assesment_medis_igd:{
        type:DataTypes.JSONB
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);

assesment_medis_igd.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(assesment_medis_igd,{foreignKey:"registrasi_id"})


module.exports = assesment_medis_igd