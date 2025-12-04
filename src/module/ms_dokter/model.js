const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const msKualifikasi=require('../ms_kualifikasi/model')
const msSpecialist=require('../ms_specialist/model')
const msBank= require('../ms_bank/model')
const msTipeTenagaMedis=require('../ms_tipe_tenaga_medis/model');
const labPengambilanSampel = require('../lab_pengambilan_sampel/model');

const msDokter = sq.define('ms_dokter',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_dokter:{
        type:DataTypes.STRING
    },
    tempat_lahir_dokter:{
        type:DataTypes.STRING
    },
    tgl_lahir_dokter:{
        type:DataTypes.DATE
    },
    agama_dokter:{
        type:DataTypes.STRING
    },
    jk_dokter:{
        type:DataTypes.STRING //laki -laki , perempuan
    },
    no_hp_dokter:{
        type:DataTypes.STRING
    },
    email_dokter:{
        type:DataTypes.STRING
    },
    edu_bachelor:{
        type:DataTypes.STRING
    },
    edu_diploma:{
        type:DataTypes.STRING
    },
    edu_doctor:{
        type:DataTypes.STRING
    },
    keahlian_khusus:{
        type:DataTypes.STRING
    },
    foto_dokter:{
        type:DataTypes.STRING   //file1
    },
    tanda_tangan:{
        type:DataTypes.STRING   //file2
    },
    norek_bank:{
        type:DataTypes.STRING
    },
    kode_bpjs:{
        type:DataTypes.STRING            // id dokter ning BPJS
    },
    kj_str_number:{
        type:DataTypes.STRING           //nomor surat keterangan dokter
    },
    kj_bpjs:{
        type:DataTypes.STRING            // id dokter ning BPJS
    },
    tgl_surat:{
        type:DataTypes.DATE
    },
    tgl_kadaluarsa_surat:{
        type:DataTypes.DATE
    },
    nik_dokter:{
        type:DataTypes.STRING
    },
    npwp_dokter:{
        type:DataTypes.STRING
    },
    satu_sehat_id: {
        type: DataTypes.STRING
    },
},
{
paranoid:true,
freezeTableName:true
});

msDokter.belongsTo(msKualifikasi,{foreignKey:'ms_kualifikasi_id'})
msKualifikasi.hasMany(msDokter,{foreignKey:'ms_kualifikasi_id'})

msDokter.belongsTo(msSpecialist,{foreignKey:'ms_specialist_id'})
msSpecialist.hasMany(msDokter,{foreignKey:'ms_specialist_id'})

msDokter.belongsTo(msBank,{foreignKey:'ms_bank_id'})
msBank.hasMany(msDokter,{foreignKey:'ms_bank_id'})

msDokter.belongsTo(msTipeTenagaMedis,{foreignKey:'ms_tipe_tenaga_medis_id'})
msTipeTenagaMedis.hasMany(msDokter,{foreignKey:'ms_tipe_tenaga_medis_id'})

// labPengambilanSampel.belongsTo(msDokter, { foreignKey: 'petugas_ambil_id', as: 'petugasAmbil' });
// msDokter.hasMany(labPengambilanSampel, { foreignKey: 'petugas_ambil_id', as: 'pengambilanSampel' });

module.exports = msDokter