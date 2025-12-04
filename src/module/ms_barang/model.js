const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const satuanBarang = require('../ms_satuan_barang/model');
const kelasTerapi = require('../ms_kelas_terapi/model');
const golonganBarang = require('../ms_golongan_barang/model');
const produsen = require('../ms_produsen/model');
const jenisObat = require('../ms_jenis_obat/model');
const tarif_cbg=require('../tarif_cbg/model')

const msBarang = sq.define('ms_barang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'OBAT', // Obat, Alat Medis
    },
    nama_barang: {
        type: DataTypes.STRING
    },
    kode_produk: {
        type:DataTypes.STRING
    },
    qjb: {
        type:DataTypes.FLOAT
    },
    komposisi: {
        type:DataTypes.STRING
    },
    harga_pokok: {
        type:DataTypes.FLOAT
    },
    harga_tertinggi: {
        type:DataTypes.FLOAT
    },
    harga_beli_terahir: {
        type:DataTypes.FLOAT
    }
}, {
    paranoid: true,
    freezeTableName: true
});

msBarang.belongsTo(satuanBarang, { foreignKey: 'ms_satuan_barang_id' });
satuanBarang.hasMany(msBarang, { foreignKey: 'ms_satuan_barang_id' });

msBarang.belongsTo(kelasTerapi, { foreignKey: 'ms_kelas_terapi_id' });
kelasTerapi.hasMany(msBarang, { foreignKey: 'ms_kelas_terapi_id' });

msBarang.belongsTo(golonganBarang, { foreignKey: 'ms_golongan_barang_id' });
golonganBarang.hasMany(msBarang, { foreignKey: 'ms_golongan_barang_id' });

msBarang.belongsTo(produsen, { foreignKey: 'ms_produsen_id' });
produsen.hasMany(msBarang, { foreignKey: 'ms_produsen_id' });

msBarang.belongsTo(jenisObat, { foreignKey: 'ms_jenis_obat_id' });
jenisObat.hasMany(msBarang, { foreignKey: 'ms_jenis_obat_id' });

msBarang.belongsTo(satuanBarang, { foreignKey: 'ms_satuan_jual_id' });
satuanBarang.hasMany(msBarang, { foreignKey: 'ms_satuan_jual_id' });

msBarang.belongsTo(tarif_cbg, { foreignKey: 'tarif_cbg_id' });
tarif_cbg.hasMany(msBarang, { foreignKey: 'tarif_cbg_id' });

module.exports = msBarang