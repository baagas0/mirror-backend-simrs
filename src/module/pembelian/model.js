const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const suplier = require('../ms_supplier/model');
const gudang = require('../ms_gudang/model');
const user = require('../users/model');

const pembelian = sq.define('pembelian',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_faktur:{
        type:DataTypes.STRING
    },
    tgl_po:{
        type:DataTypes.DATE
    },
    status_pembelian:{
        type:DataTypes.SMALLINT  //1=buka, 2=kunci, 3=tutup
    },
    tgl_faktur:{
        type:DataTypes.DATE
    },
    biaya_lain:{
        type:DataTypes.FLOAT
    },
    ongkos_kirim:{
        type:DataTypes.FLOAT
    },
    pajak:{
        type:DataTypes.FLOAT
    },
    potongan:{
        type:DataTypes.FLOAT
    },
    total_pembelian:{
        type:DataTypes.FLOAT
    },
    sisa_pembayaran:{
        type:DataTypes.FLOAT
    },
    ubah_harga_pokok:{
        type:DataTypes.BOOLEAN
    },
    tgl_jatuh_tempo:{
        type:DataTypes.DATE
    },
    tgl_kedatangan:{
        type:DataTypes.DATE
    },
    tahap:{
        type:DataTypes.STRING
    },
    kode_po:{
        type:DataTypes.INTEGER
    }
},
{
paranoid:true,
freezeTableName:true
});

pembelian.belongsTo(suplier, { foreignKey: 'ms_suplier_id' });
suplier.hasMany(pembelian, { foreignKey: 'ms_suplier_id' });

pembelian.belongsTo(gudang, { foreignKey: 'ms_gudang_id' });
gudang.hasMany(pembelian, { foreignKey: 'ms_gudang_id' });

pembelian.belongsTo(user, { foreignKey: 'user_id' });
user.hasMany(pembelian, { foreignKey: 'user_id' });

module.exports = pembelian