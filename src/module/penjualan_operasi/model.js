const { DataTypes } = require("sequelize");
const { sq } = require("../../config/connection");
const penjualan = require("../penjualan/model");
const msBarang = require("../ms_barang/model");

const penjualanOperasi = sq.define(
  "penjualan_operasi",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    harga_satuan: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    harga_satuan_custom: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    harga_pokok: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    jenis: {
      type: DataTypes.STRING,
      defaultValue: "BMHP", // BMHP, OBAT, ALKES
    },
    keterangan: {
      type: DataTypes.TEXT,
    },
    status_penjualan_operasi: {
      type: DataTypes.SMALLINT,
      defaultValue: 1, //1=buka, 2=kunci
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
  },
);

penjualanOperasi.belongsTo(penjualan, { foreignKey: "penjualan_id" });
penjualan.hasMany(penjualanOperasi, { foreignKey: "penjualan_id" });

penjualanOperasi.belongsTo(msBarang, { foreignKey: "ms_barang_id" });
msBarang.hasMany(penjualanOperasi, { foreignKey: "ms_barang_id" });

module.exports = penjualanOperasi;
