const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const fixAsset = sq.define('fixasset',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idgl:{
        type:DataTypes.STRING
    },
    name:{
        type:DataTypes.STRING
    },
    code:{
        type:DataTypes.STRING
    },
    nofaktur:{
        type:DataTypes.STRING
    },
    tgl_pembelian:{
        type:DataTypes.DATE
    },
    tgl_pemakaian:{
        type:DataTypes.DATE
    },
    tgl_akhirpenyusutan:{
        type:DataTypes.DATE
    },
    perkiraan_umur_thn:{
        type:DataTypes.INTEGER
    },
    perkiraan_umur_bln:{
        type:DataTypes.INTEGER
    },
    nilai_sisaditaksir:{
        type:DataTypes.DOUBLE
    },
    nilai_asset:{
        type:DataTypes.DOUBLE
    },
    nilai_penyusutan:{
        type:DataTypes.DOUBLE
    },
    total_penyusutan:{
        type:DataTypes.DOUBLE
    },
    total_cicilan:{
        type:DataTypes.DOUBLE
    },
    sisa_pemby:{
        type:DataTypes.DOUBLE
    },
    is_asetberwujud:{
        type:DataTypes.BOOLEAN
    },
    is_perhitungansusut:{
        type:DataTypes.BOOLEAN
    },
    status:{
        type:DataTypes.SMALLINT,
        defaultValue: 1
    },
    gudang_id:{
        type:DataTypes.STRING
    },
    produsen_id:{
        type:DataTypes.STRING
    },
    supplier_id:{
        type:DataTypes.STRING
    },
    type_asset_id:{
        type:DataTypes.STRING
    },
    coa_fixassets:{
        type:DataTypes.STRING
    },
    coa_akumulasi:{
        type:DataTypes.STRING
    },
    coa_bebanpenyusutan:{
        type:DataTypes.STRING
    },
    type_fiscal_id:{
        type:DataTypes.STRING
    },
    masa_manfaat:{
        type:DataTypes.INTEGER
    },
    tarif_penyusutan:{
        type:DataTypes.FLOAT
    },
    metode_penyusutan_id:{
        type:DataTypes.STRING
    },
    tingkatasset_id:{
        type:DataTypes.STRING
    },
    remark:{
        type:DataTypes.TEXT
    },
},
{
    paranoid:true,
    freezeTableName:true
});

// ms_bank.sync({alter:true})

module.exports = fixAsset