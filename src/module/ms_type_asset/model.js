const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const msTypeFiscal = require('../ms_type_fiscal/model');

const msTypeAsset = sq.define('ms_type_asset',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name:{
        type:DataTypes.STRING
    },
    coa_fixassets:{
        type:DataTypes.STRING
    },
    coa_akumulasi:{
        type:DataTypes.STRING,
    },
    coa_bebanpenyusutan:{
        type:DataTypes.STRING,
    },
},
{
    paranoid:true,
    freezeTableName:true
});

// ms_depreciation_method.sync({alter:true})
msTypeAsset.belongsTo(msTypeFiscal, { foreignKey: "type_fiscal_id" })
msTypeFiscal.hasMany(msTypeAsset, { foreignKey: "type_fiscal_id" })

module.exports = msTypeAsset