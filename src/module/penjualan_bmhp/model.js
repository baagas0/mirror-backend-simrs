const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const penjualan = require('../penjualan/model');
const operasiBmhp = require('../operasi_bmhp/model');

const penjualanBmhp = sq.define('penjualan_bmhp',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    operasi_bmhp_id:{
        type: DataTypes.STRING
    },
    qty:{
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    harga_satuan:{
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    total_harga:{
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    jenis:{
        type: DataTypes.STRING,
        defaultValue: 'BMHP'
    },
    keterangan:{
        type: DataTypes.TEXT
    },
    status_penjualan_bmhp:{
        type: DataTypes.SMALLINT,
        defaultValue: 1         //1=buka, 2=kunci
    }
},
{
    paranoid:true,
    freezeTableName:true
});

penjualanBmhp.belongsTo(penjualan, { foreignKey: 'penjualan_id' });
penjualan.hasMany(penjualanBmhp, { foreignKey: 'penjualan_id' });

penjualanBmhp.belongsTo(operasiBmhp, { foreignKey: 'operasi_bmhp_id' });
operasiBmhp.hasMany(penjualanBmhp, { foreignKey: 'operasi_bmhp_id' });

module.exports = penjualanBmhp

