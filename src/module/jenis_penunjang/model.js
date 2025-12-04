const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const jenis_penunjang = sq.define('jenis_penunjang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jenis_penunjang: {
        type: DataTypes.STRING
    },
    status_jenis_penunjang:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    keterangan_jenis_penunjang:{
        type:DataTypes.TEXT
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });



module.exports = jenis_penunjang