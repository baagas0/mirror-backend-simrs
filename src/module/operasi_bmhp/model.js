const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const OperasiBmhp = sq.define('operasi_bmhp',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    hasil_operasi_id:{
        type: DataTypes.STRING
    },
    ms_barang_id:{
        type: DataTypes.STRING
    },
    qty:{
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    ms_satuan_barang_id:{
        type: DataTypes.STRING
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
        type: DataTypes.ENUM('BMHP', 'OBAT', 'ALKES'),
        defaultValue: 'BMHP'
    },
    keterangan:{
        type: DataTypes.TEXT
    },
    user_input_id:{
        type: DataTypes.STRING
    },
    waktu_input:{
        type: DataTypes.DATE
    },
    status:{
        // type: DataTypes.ENUM('draft', 'confirmed', 'cancelled'),
        type: DataTypes.STRING,
        defaultValue: 'draft'
    }
},
{
paranoid:true,
freezeTableName:true
});

// operasi_bmhp.sync({alter:true})

module.exports = OperasiBmhp