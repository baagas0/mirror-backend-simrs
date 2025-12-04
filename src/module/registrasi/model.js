const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const booking = require('../booking/model');
const msJenisLayanan = require('../ms_jenis_layanan/model');
const kelasKunjungan = require('../kelas_kunjungan/model');
const pasien = require('../pasien/model');
const msDokter = require('../ms_dokter/model');
const msSpesialis = require('../ms_specialist/model');
const msAsuransi = require('../ms_asuransi/model');
const triage = require('../triage/model');

const registrasi = sq.define('registrasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_registrasi: {
        type: DataTypes.DATE
    },
    no_identitas_registrasi: {
        type: DataTypes.STRING
    },
    no_hp_registrasi: {
        type: DataTypes.STRING
    },
    no_sep: {
        type: DataTypes.STRING
    },
    no_asuransi_registrasi: {
        type: DataTypes.STRING
    },
    no_rujukan: {
        type: DataTypes.STRING
    },
    no_kontrol: {
        type: DataTypes.STRING
    },
    no_antrian: {
        type: DataTypes.STRING
    },
    status_registrasi: {
        type: DataTypes.SMALLINT,  // 0 : batal || 1 : baru dibuat || 2 : proses || 9: selesai
        defaultValue: 1
    },
    keterangan_registrasi: {
        type: DataTypes.STRING
    },
    id_faskes_perujuk: {
        type: DataTypes.STRING
    },
    no_kunjungan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dibuat_oleh: {
        type: DataTypes.STRING
    },
    initial_registrasi: {
        type: DataTypes.STRING
    },
    antrian_loket_id: {
        type: DataTypes.STRING
    },
    sebab_sakit: {
        type: DataTypes.STRING
    },
    tgl_pulang: {
        type: DataTypes.DATE
    },
    satu_sehat_id:{
        type:DataTypes.STRING
    },
    satu_sehat_status:{
        type:DataTypes.STRING
    },
    satu_sehat_last_payload:{
        type:DataTypes.JSONB
    },

    satu_sehat_condition_id:{
        type:DataTypes.STRING
    },
    satu_sehat_observation_id:{
        type:DataTypes.STRING
    },

    satu_sehat_request_service_id:{
        type:DataTypes.STRING
    },
    satu_sehat_procedure_id:{
        type:DataTypes.STRING
    },
    satu_sehat_tindak_lanjut_id:{
        type:DataTypes.STRING
    },
    satu_sehat_clinical_impression_id: {
        type:DataTypes.STRING
    },
    satu_sehat_diet_id: {
        type:DataTypes.STRING
    },
    satu_sehat_kontrol_kembali_id: {
        type:DataTypes.STRING
    },
    satu_sehat_alleri_intoleran_id: {
        type:DataTypes.STRING
    },
    registrasi_rujukan_id: {
        type: DataTypes.STRING,
        allowNull: true,
        // comment: 'ID registrasi asal jika pasien dirujuk/dipindahkan'
    },
    catatan_pindah: {
        type: DataTypes.STRING,
        allowNull: true,
        // comment: 'Catatan saat pemindahan pasien'
    },
    // untuk ranap tipe kelas kamar: kelas regular, kelas kamar tamu
    tipe_kelas_kamar: {
        type: DataTypes.STRING
    },
}, {
    paranoid: true,
    freezeTableName: true
});

registrasi.belongsTo(booking,{foreignKey:'booking_id'})
booking.hasMany(registrasi,{foreignKey:'booking_id'})

registrasi.belongsTo(triage,{foreignKey:'triage_id'})
triage.hasMany(registrasi,{foreignKey:'triage_id'})

registrasi.belongsTo(msJenisLayanan,{foreignKey:'ms_jenis_layanan_id'})
msJenisLayanan.hasMany(registrasi,{foreignKey:'ms_jenis_layanan_id'})

registrasi.belongsTo(kelasKunjungan,{foreignKey:'kelas_kunjungan_id'})
kelasKunjungan.hasMany(registrasi,{foreignKey:'kelas_kunjungan_id'})

registrasi.belongsTo(pasien,{foreignKey:'pasien_id'})
pasien.hasMany(registrasi,{foreignKey:'pasien_id'})

registrasi.belongsTo(msDokter,{foreignKey:'ms_dokter_id'})
msDokter.hasMany(registrasi,{foreignKey:'ms_dokter_id'})

registrasi.belongsTo(msSpesialis,{foreignKey:'ms_spesialis_id'})
msSpesialis.hasMany(registrasi,{foreignKey:'ms_spesialis_id'})

registrasi.belongsTo(msAsuransi,{foreignKey:'ms_asuransi_id'})
msAsuransi.hasMany(registrasi,{foreignKey:'ms_asuransi_id'})

// Self-reference untuk registrasi rujukan/pindah
registrasi.belongsTo(registrasi, {
    foreignKey: 'registrasi_rujukan_id',
    as: 'registrasiAsal'
});
registrasi.hasMany(registrasi, {
    foreignKey: 'registrasi_rujukan_id',
    as: 'registrasiTujuan'
});

module.exports = registrasi