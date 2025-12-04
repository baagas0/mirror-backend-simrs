const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msDokter = require('../ms_dokter/model');

const labPengambilanSampel = sq.define('lab_pengambilan_sampel', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    lab_regis_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tanggal_ambil: {
        type: DataTypes.DATE,
        allowNull: false
    },
    petugas_ambil_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    waktu_mulai: {
        type: DataTypes.DATE,
        allowNull: true
    },
    waktu_selesai: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status_pengambilan: {
        type: DataTypes.SMALLINT,
        defaultValue: 0, // 0 = pending, 1 = sedang diambil, 2 = selesai, 3 = gagal
        allowNull: false
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    volume_sampel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    kondisi_sampel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lokasi_ambil: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipe_sampel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    no_rak: {
        type: DataTypes.STRING,
        allowNull: true
    },
    suhu_penyimpanan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    catatan_pengambilan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_sync_satu_sehat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sync_satu_sehat_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    satu_sehat_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    paranoid: true,
    freezeTableName: true,
    tableName: 'lab_pengambilan_sampel'
});

// labPengambilanSampel.belongsTo(msDokter, { foreignKey: 'petugas_ambil_id', as: 'petugasAmbil' });
// msDokter.hasMany(labPengambilanSampel, { foreignKey: 'petugas_ambil_id', as: 'pengambilanSampel' });

module.exports = labPengambilanSampel;