const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const penjualan = require('../penjualan/model');
const fasilitas = require('../ms_fasilitas/model');

const penjualanFasilitas = sq.define('penjualan_fasilitas',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    qty_fasilitas:{
        type:DataTypes.FLOAT
    },
    harga_fasilitas:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    harga_fasilitas_custom:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    keterangan_penjualan_fasilitas:{
        type:DataTypes.STRING
    },
    status_penjualan_fasilitas:{
        type:DataTypes.SMALLINT,
        defaultValue: 1         //1=buka, 2=kunci
    }
},
{
paranoid:true,
freezeTableName:true
});

penjualanFasilitas.belongsTo(penjualan, { foreignKey: 'penjualan_id' });
penjualan.hasMany(penjualanFasilitas, { foreignKey: 'penjualan_id' });

penjualanFasilitas.belongsTo(fasilitas, { foreignKey: 'ms_fasilitas_id' });
fasilitas.hasMany(penjualanFasilitas, { foreignKey: 'ms_fasilitas_id' });

module.exports = penjualanFasilitas