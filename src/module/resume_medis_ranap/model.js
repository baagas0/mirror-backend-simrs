const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const registrasi= require('../registrasi/model')
const ms_tipe_tenaga_medis=require('../ms_tipe_tenaga_medis/model')
const dokter_id=require('../ms_dokter/model')

const resume_medis_ranap = sq.define('resume_medis_ranap', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal:{
        type:DataTypes.DATE
    },
    nama_tenaga_medis:{
        type:DataTypes.STRING
    },
    json_resume_medis_ranap:{
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

resume_medis_ranap.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(resume_medis_ranap,{foreignKey:"registrasi_id"})

resume_medis_ranap.belongsTo(ms_tipe_tenaga_medis,{foreignKey:"ms_tipe_tenaga_medis_id"})
ms_tipe_tenaga_medis.hasMany(resume_medis_ranap,{foreignKey:"ms_tipe_tenaga_medis_id"})

resume_medis_ranap.belongsTo(dokter_id,{foreignKey:"ms_dokter_id"})
dokter_id.hasMany(resume_medis_ranap,{foreignKey:"ms_dokter_id"})

module.exports = resume_medis_ranap