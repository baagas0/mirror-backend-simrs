const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msDokter = require('../ms_dokter/model');
const registrasi = require('../registrasi/model');

const labRegis = sq.define('lab_regis', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    keterangan_lab_regis: {
        type: DataTypes.STRING
    },
    diagnosa: {
        type: DataTypes.JSON
    },
    tanggal_request: {
        type: DataTypes.DATE
    },
    tanggal_ambil_sampel:{
        type:DataTypes.DATE
    },
    list_lab_paket: {
        type: DataTypes.JSON
    },
    klinis: {
        type: DataTypes.STRING
    },
    is_cito: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_puasa:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    is_registrasi: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status:{
        type:DataTypes.SMALLINT,
        defaultValue: 0         //0 = new, 1=proses, 2=sampel, 3=hasil
    },
    satu_sehat_puasa_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    satu_sehat_service_request_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    satu_sehat_specimen_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    satu_sehat_o_natrium_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    satu_sehat_o_chloride_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    satu_sehat_o_kalium_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    satu_sehat_report_id: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    alasan_pembatalan: {
        type: DataTypes.TEXT
    },
    user_batal: {
        type: DataTypes.STRING
    },
    tanggal_batal: {
        type: DataTypes.DATE
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

labRegis.belongsTo(msDokter, { foreignKey: 'dokter_id' });
msDokter.hasMany(labRegis, { foreignKey: 'dokter_id' });

labRegis.belongsTo(registrasi, { foreignKey: 'registrasi_id' });
registrasi.hasMany(labRegis, { foreignKey: 'registrasi_id' });

module.exports = labRegis