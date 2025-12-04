const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const penjualan = require('../penjualan/model');
const jasa = require('../ms_jasa/model');

const penjualanJasa = sq.define('penjualan_jasa',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    qty_jasa:{
        type:DataTypes.INTEGER
    },
    harga_jasa:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    harga_jasa_custom:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    keterangan_penjualan_jasa:{
        type:DataTypes.STRING
    },
    status_penjualan_jasa:{
        type:DataTypes.SMALLINT,
        defaultValue: 1         //1=buka, 2=kunci
    }
},
{
paranoid:true,
freezeTableName:true
});

penjualanJasa.belongsTo(penjualan, { foreignKey: 'penjualan_id' });
penjualan.hasMany(penjualanJasa, { foreignKey: 'penjualan_id' });

penjualanJasa.belongsTo(jasa, { foreignKey: 'ms_jasa_id' });
jasa.hasMany(penjualanJasa, { foreignKey: 'ms_jasa_id' });

module.exports = penjualanJasa