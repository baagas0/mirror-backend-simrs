const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const pembelian = require('../pembelian/model');
const barang = require('../ms_barang/model');
const satuanBeli = require('../ms_satuan_barang/model');


const subPembelian = sq.define('sub_pembelian',{
    // beli paramex 2400 butir
    // yang datang dalam bentuk pack
    // per pack isinya 12
    // total pack yang datang 200
    // harga per pack 6000
    // harga total 1200000

    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_batch:{
        type:DataTypes.STRING
    },
    qty_satuan_simpan:{//qty
        type:DataTypes.FLOAT
        //12
    },
    qty_beli:{ //qty_per_satuan_beli
        type:DataTypes.FLOAT
        //200
    },
    harga_per_satuan_simpan:{ //harga
        type:DataTypes.FLOAT
        //500
    },
    harga_beli:{//harga_per_satuan_beli
        type:DataTypes.FLOAT
        //6000
    },
    total_harga_beli:{//total_harga
        type:DataTypes.FLOAT
        //1200000
    },
    total_qty_satuan_simpan:{//new
        type:DataTypes.FLOAT
        //2400
    },
    tgl_kadaluarsa:{
        type:DataTypes.DATE
    }
},
{
paranoid:true,
freezeTableName:true
});

subPembelian.belongsTo(pembelian, { foreignKey: 'ms_pembelian_id' });
pembelian.hasMany(subPembelian, { foreignKey: 'ms_pembelian_id' });

subPembelian.belongsTo(barang, { foreignKey: 'ms_barang_id' });
barang.hasMany(subPembelian, { foreignKey: 'ms_barang_id' });

subPembelian.belongsTo(satuanBeli, { foreignKey: 'ms_satuan_beli_id' });
satuanBeli.hasMany(subPembelian, { foreignKey: 'ms_satuan_beli_id' });

module.exports = subPembelian