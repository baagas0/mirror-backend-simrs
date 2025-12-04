const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const msDepreciationMethod = require('../ms_depreciation_method/model');

const msTypeFiscal = sq.define('ms_type_fiscal',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name:{
        type:DataTypes.STRING
    },
    masa_manfaat:{
        type:DataTypes.INTEGER,
    },
    bulan:{
        type:DataTypes.INTEGER,
    },
    tarif_penyusutan:{
        type:DataTypes.FLOAT,
    },
    // metode_penyusutan_id:{
    //     type:DataTypes.INTEGER,
    // },
    status:{
        type:DataTypes.SMALLINT,
        defaultValue: 1
    },
},
{
    paranoid:true,
    freezeTableName:true
});

// ms_depreciation_method.sync({alter:true})
msTypeFiscal.belongsTo(msDepreciationMethod, { foreignKey: "metode_penyusutan_id" })
msDepreciationMethod.hasMany(msTypeFiscal, { foreignKey: "metode_penyusutan_id" })

module.exports = msTypeFiscal