const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');
const msKelasKamar = require('../ms_kelas_kamar/model');
const msRuang = require('../ms_ruang/model');
const msDokter = require('../ms_dokter/model');
const msJasa = require('../ms_jasa/model');
const msPoliklinik = require('../ms_poliklinik/model');

const jadwalOperasi = sq.define('jadwal_operasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_booking: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.INTEGER, // 0: batal, 1: menunggu, 2: diproses, 3: selesai
        defaultValue: 1
    },
    registrasi_id: {
        type: DataTypes.STRING,
        references: {
          model: registrasi,
          key: 'id'
        }
    },
    ms_kelas_kamar_id: {
        type: DataTypes.STRING,
        references: {
          model: msKelasKamar,
          key: 'id'
        }
    },
    ms_ruang_id: {
        type: DataTypes.STRING,
        references: {
          model: msRuang,
          key: 'id'
        }
    },
    tanggal_operasi: {
        type: DataTypes.DATE
    },
    waktu_mulai: {
        type: DataTypes.TIME
    },
    waktu_selesai: {
        type: DataTypes.TIME
    },
    ms_dokter_id: {
        type: DataTypes.STRING,
        references: {
          model: msDokter,
          key: 'id'
        }
    },
    ms_jasa_id: {
        type: DataTypes.STRING,
        references: {
          model: msJasa,
          key: 'id'
        }
    },
    ms_poliklinik_id: {
        type: DataTypes.STRING,
        references: {
          model: msPoliklinik,
          key: 'id'
        }
    },
    remark:{
        type: DataTypes.TEXT
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = jadwalOperasi;