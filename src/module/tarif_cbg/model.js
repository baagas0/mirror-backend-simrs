const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');


const tarif_cbg = sq.define('tarif_cbg', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_bridge:{
        type:DataTypes.STRING
    },
    nama_tarif_cbg:{
        type:DataTypes.STRING
    },
    status_tarif_cbg:{
        type:DataTypes.BOOLEAN
    },
    keterangan_tarif_cbg:{
        type:DataTypes.TEXT
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);



module.exports = tarif_cbg