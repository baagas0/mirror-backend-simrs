const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const kelurahan = require('../kelurahan/model');
const msGolonganDarah = require('../ms_golongan_darah/model');
const msPekerjaan = require('../ms_pekerjaan/model');
const msPendidikan = require('../ms_pendidikan/model');
const msEtnis = require('../ms_etnis/model');

const pasien = sq.define('pasien', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_rm: {
        type: DataTypes.STRING
    },
    nik: {
        type: DataTypes.STRING
    },
    nama_lengkap: {
        type: DataTypes.STRING
    },
    kunjungan_pertama: {
        type: DataTypes.DATE
    },
    jenis_kelamin: {
        type: DataTypes.STRING(1) // L || P
    },
    agama: {
        type: DataTypes.STRING
    },
    perusahaan_tempat_bekerja: {
        type: DataTypes.STRING
    },
    nip: {
        type: DataTypes.STRING
    },
    npwp: {
        type: DataTypes.STRING
    },
    no_telepon: {
        type: DataTypes.STRING
    },
    bpjs_id: {
        type: DataTypes.STRING
    },
    no_asuransi_pasien: {
        type: DataTypes.STRING
    },
    tgl_lahir: {
        type: DataTypes.DATE
    },
    tempat_lahir: {
        type: DataTypes.STRING
    },
    alamat_ktp: {
        type: DataTypes.STRING
    },
    alamat_sekarang: {
        type: DataTypes.STRING
    },
    negara: {
        type: DataTypes.STRING
    },
    nama_pasangan: {
        type: DataTypes.STRING
    },
    nama_ayah: {
        type: DataTypes.STRING
    },
    nama_ibu: {
        type: DataTypes.STRING
    },
    nama_penjamin: {
        type: DataTypes.STRING
    },
    hubungan_penjamin: {
        type: DataTypes.STRING
    },
    sc_whatsapp: {
        type: DataTypes.STRING
    },
    sc_email: {
        type: DataTypes.STRING
    },
    dibuat_oleh: {
        type: DataTypes.STRING
    },
    diperbarui_oleh: {
        type: DataTypes.STRING
    },
    status_pasien: {
        type: DataTypes.SMALLINT,
        defaultValue : 1        // 1: Aktif || 0: Tidak aktif
    },
    satu_sehat_id: {
        type: DataTypes.STRING
    },
}, {
    paranoid: true,
    freezeTableName: true
});

pasien.belongsTo(kelurahan, { foreignKey: 'kelurahan_id' });
kelurahan.hasMany(pasien, { foreignKey: 'kelurahan_id' });

pasien.belongsTo(msGolonganDarah, { foreignKey: 'golongan_darah_id' });
msGolonganDarah.hasMany(pasien, { foreignKey: 'golongan_darah_id' });

pasien.belongsTo(msPekerjaan, { foreignKey: 'pekerjaan_id' });
msPekerjaan.hasMany(pasien, { foreignKey: 'pekerjaan_id' });

pasien.belongsTo(msPendidikan, { foreignKey: 'pendidikan_id' });
msPendidikan.hasMany(pasien, { foreignKey: 'pendidikan_id' });

pasien.belongsTo(msEtnis, { foreignKey: 'etnis_id' });
msEtnis.hasMany(pasien, { foreignKey: 'etnis_id' });

module.exports = pasien