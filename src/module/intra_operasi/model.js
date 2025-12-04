const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const JadwalOperasi = require('../jadwal_operasi/model');
const msDokter = require('../ms_dokter/model');

const IntraOperasi = sq.define('intra_operasi', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  jadwal_operasi_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: JadwalOperasi,
      key: 'id'
    }
  },
  waktu_mulai: {
    type: DataTypes.DATE,
    allowNull: false
  },
  waktu_selesai: {
    type: DataTypes.DATE,
    allowNull: true
  },
  posisi_operasi: {
    type: DataTypes.STRING, // Supine, Prone, Lithotomy, dll
    allowNull: true
  },
  jenis_anestesi: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tekanan_darah_awal: {
    type: DataTypes.STRING
  },
  tekanan_darah_akhir: {
    type: DataTypes.STRING
  },
  nadi_awal: {
    type: DataTypes.INTEGER
  },
  nadi_akhir: {
    type: DataTypes.INTEGER
  },
  saturasi_o2: {
    type: DataTypes.INTEGER
  },
  suhu_tubuh: {
    type: DataTypes.DECIMAL(4,1)
  },
  volume_cairan_masuk: {
    type: DataTypes.DECIMAL(10,2)
  },
  volume_cairan_keluar: {
    type: DataTypes.DECIMAL(10,2)
  },
  jumlah_darah: {
    type: DataTypes.INTEGER // ml
  },
  komplikasi_intra: {
    type: DataTypes.TEXT
  },
  tindakan_intra: {
    type: DataTypes.TEXT // Deskripsi tindakan intra-operatif
  },
  operator_utama_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: msDokter,
      key: 'id'
    }
  },
  catatan_perawat: {
    type: DataTypes.TEXT
  }
}, {
  paranoid: true,
  freezeTableName: true
});

IntraOperasi.belongsTo(JadwalOperasi, { foreignKey: 'jadwal_operasi_id', as: 'jadwal_operasi' });
IntraOperasi.belongsTo(msDokter, { foreignKey: 'operator_utama_id', as: 'operator_utama' });

module.exports = IntraOperasi;
