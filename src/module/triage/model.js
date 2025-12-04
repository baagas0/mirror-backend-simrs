const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const triage = sq.define('triage',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama:{
        type:DataTypes.STRING
    },
    nik:{
        type:DataTypes.STRING
    },
    tgl_lahir:{
        type:DataTypes.DATE
    },
    is_registrasi:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    asesmen:{
        type:DataTypes.JSONB
    }
},
{
paranoid:true,
freezeTableName:true
});

module.exports = triage