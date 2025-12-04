const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const rad_test=require('../rad_test/model')
const rad_regis=require('../rad_regis/model')
const penunjang=require('../penunjang/model')

const rad_hasil = sq.define('rad_hasil',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_pemeriksaan:{
        type:DataTypes.DATE
    },
    hasil:{
        type:DataTypes.STRING,
        defaultValue:""
    },
    kesan:{
        type:DataTypes.TEXT
    },
    saran:{
        type:DataTypes.TEXT
    },
    file_tambahan:{
        type:DataTypes.STRING   //file1
    },
    queue:{
        type:DataTypes.INTEGER
    },
    keterangan_rad_hasil:{
        type:DataTypes.TEXT
    },
    created_by:{
        type:DataTypes.STRING
    },
    created_name:{
        type:DataTypes.STRING
    },
    updated_by:{
        type:DataTypes.STRING
    },
    updated_name:{
        type:DataTypes.STRING
    },
    deleted_by:{
        type:DataTypes.STRING
    },
    deleted_name:{
        type:DataTypes.STRING
    }

},
{
paranoid:true,
freezeTableName:true
});

rad_hasil.belongsTo(rad_test,{foreignKey:"rad_test_id"})
rad_test.hasMany(rad_hasil,{foreignKey:"rad_test_id"})

rad_hasil.belongsTo(rad_regis,{foreignKey:"rad_regis_id"})
rad_regis.hasMany(rad_hasil,{foreignKey:"rad_regis_id"})

rad_hasil.belongsTo(penunjang,{foreignKey:"penunjang_id"})
penunjang.hasMany(rad_hasil,{foreignKey:"penunjang_id"})

module.exports = rad_hasil