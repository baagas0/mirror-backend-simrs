const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');


const ms_prosedur = sq.define('ms_prosedur', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_prosedur:{
        type:DataTypes.STRING
    },
    nama_prosedur:{
        type:DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);



module.exports = ms_prosedur