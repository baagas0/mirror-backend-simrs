const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const tagihanEklaim = sq.define('tagihan_eklaim',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    id_tagihan:{
        type:DataTypes.STRING
    },
    nomor_sep:{
        type: DataTypes.STRING,
    },

    set_claim_data_request: {
        type:DataTypes.JSON
    },
    set_claim_data_response: {
        type:DataTypes.JSON
    },
    set_claim_data_status:{
        type: DataTypes.STRING,
    },

    group_stage_1_response: {
        type:DataTypes.JSON
    },
    group_stage_1_date: {
        type:DataTypes.DATE
    },
    group_stage_2_response: {
        type:DataTypes.JSON
    },
    group_stage_2_date: {
        type:DataTypes.DATE
    },

    final_date: {
        type:DataTypes.DATE
    },
    datacenter_date: {
        type:DataTypes.DATE
    },

    synchronize: {
        type:DataTypes.JSON
    },
    final_claim: {
        type:DataTypes.JSON
    },
},
{
paranoid:true,
freezeTableName:true
});

// ms_bank.sync({alter:true})

module.exports = tagihanEklaim