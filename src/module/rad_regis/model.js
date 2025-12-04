const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const dokter_id=require('../ms_dokter/model')
const registrasi=require('../registrasi/model')

const rad_regis = sq.define('rad_regis',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    diagnosa:{
        type:DataTypes.JSON
    },
    tanggal_request:{
        type:DataTypes.DATE
    },
    tanggal_ambil_sampel:{
        type:DataTypes.DATE
    },
    list_test:{
        type:DataTypes.JSON
    },
    klinis:{
        type:DataTypes.TEXT
    },
    is_cito:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    is_registrasi:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    is_puasa:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    proyeksi:{
        type:DataTypes.STRING
    },
    kv:{
        type:DataTypes.STRING
    },
    mas:{
        type:DataTypes.STRING
    },
    ffd:{
        type:DataTypes.STRING
    },
    bsf:{
        type:DataTypes.STRING
    },
    inak:{
        type:DataTypes.STRING
    },
    jumlah_penyinaran:{
        type:DataTypes.STRING
    },
    dosis_radiasi:{
        type:DataTypes.STRING
    },
    keterangan_rad_regis:{
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
    },
    status:{
        type:DataTypes.SMALLINT,
        defaultValue: 0         //0 = new, 1=proses, 2=sampel, 3=hasil, 4=batal
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},
{
paranoid:true,
freezeTableName:true
});

rad_regis.belongsTo(dokter_id,{foreignKey:"ms_dokter_id"})
dokter_id.hasMany(rad_regis,{foreignKey:"ms_dokter_id"})

rad_regis.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(rad_regis,{foreignKey:"registrasi_id"})

module.exports = rad_regis