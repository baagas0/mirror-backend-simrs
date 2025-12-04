const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');


const ms_diagnosa = sq.define('ms_diagnosa', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_diagnosa:{
        type:DataTypes.STRING
    },
    nama_diagnosa:{
        type:DataTypes.STRING
    },
    non_spesialis:{
        type:DataTypes.BOOLEAN
    },
    keterangan_diagnosa:{
        type:DataTypes.STRING
    },
    is_bpjs:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);



module.exports = ms_diagnosa