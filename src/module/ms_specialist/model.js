const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const msSpecialist = sq.define('ms_specialist',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_specialist:{
        type:DataTypes.STRING
    },
    kode_specialist:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

// msSpecialist.sync({alter:true})

module.exports = msSpecialist