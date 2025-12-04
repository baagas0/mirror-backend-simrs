const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const registrasi= require('../registrasi/model')


const resume_medis_igd = sq.define('resume_medis_igd', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    json_resume_medis_igd:{
        type:DataTypes.JSONB
    },
    validasi_dokter:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);

resume_medis_igd.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(resume_medis_igd,{foreignKey:"registrasi_id"})


module.exports = resume_medis_igd