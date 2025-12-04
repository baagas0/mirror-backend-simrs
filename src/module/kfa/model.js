const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const produk_kfa = sq.define('produk_kfa', {
  id: {
    // type: DataTypes.STRING,
    // primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.TEXT },
  kfa_code: { type: DataTypes.STRING, unique: true },
  active: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  farmalkes_type_code: { type: DataTypes.STRING },
  farmalkes_type_name: { type: DataTypes.STRING },
  farmalkes_type_group: { type: DataTypes.STRING },
  dosage_form_code: { type: DataTypes.STRING },
  dosage_form_name: { type: DataTypes.STRING },
  produksi_buatan: { type: DataTypes.STRING },
  nie: { type: DataTypes.STRING },
  nama_dagang: { type: DataTypes.STRING },
  manufacturer: { type: DataTypes.STRING },
  registrar: { type: DataTypes.STRING },
  generik: { type: DataTypes.STRING },
  rxterm: { type: DataTypes.STRING },
  dose_per_unit: { type: DataTypes.STRING },
  fix_price: { type: DataTypes.STRING },
  het_price: { type: DataTypes.STRING },
  farmalkes_hscode: { type: DataTypes.STRING },
  tayang_lkpp: { type: DataTypes.STRING },
  kode_lkpp: { type: DataTypes.STRING },
  net_weight: { type: DataTypes.STRING },
  net_weight_uom_name: { type: DataTypes.STRING },
  volume: { type: DataTypes.STRING },
  volume_uom_name: { type: DataTypes.STRING },
  med_dev_jenis: { type: DataTypes.STRING },
  med_dev_subkategori: { type: DataTypes.STRING },
  med_dev_kategori: { type: DataTypes.STRING },
  med_dev_kelas_risiko: { type: DataTypes.STRING },
  klasifikasi_izin: { type: DataTypes.STRING },
  uom_name: { type: DataTypes.STRING }
}, {
  paranoid: true,
  freezeTableName: true
});

module.exports = produk_kfa