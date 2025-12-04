const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const tagihan = require('../tagihan/model');
const users = require('../users/model');

const historyEklaim = sq.define('history_eklaim',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nomor_sep:{
        type:DataTypes.STRING,
        allowNull: false
    },
    tagihan_id:{
        type:DataTypes.STRING,
        allowNull: false
    },

    // Stage 1: New Claim
    new_claim_request:{
        type:DataTypes.JSON
    },
    new_claim_response:{
        type:DataTypes.JSON
    },
    new_claim_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    new_claim_date:{
        type:DataTypes.DATE
    },

    // Stage 2: Update Patient (Optional)
    update_patient_request:{
        type:DataTypes.JSON
    },
    update_patient_response:{
        type:DataTypes.JSON
    },
    update_patient_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    update_patient_date:{
        type:DataTypes.DATE
    },

    // Stage 3: Set Claim Data
    set_claim_data_request:{
        type:DataTypes.JSON
    },
    set_claim_data_response:{
        type:DataTypes.JSON
    },
    set_claim_data_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    set_claim_data_date:{
        type:DataTypes.DATE
    },

    // Stage 4: IDRG Diagnosa Set
    idrg_diagnosa_request:{
        type:DataTypes.JSON
    },
    idrg_diagnosa_response:{
        type:DataTypes.JSON
    },
    idrg_diagnosa_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    idrg_diagnosa_date:{
        type:DataTypes.DATE
    },

    // Stage 5: IDRG Prosedur Set
    idrg_prosedur_request:{
        type:DataTypes.JSON
    },
    idrg_prosedur_response:{
        type:DataTypes.JSON
    },
    idrg_prosedur_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    idrg_prosedur_date:{
        type:DataTypes.DATE
    },

    // Stage 6: Grouper IDRG Stage 1
    grouper_idrg_stage1_request:{
        type:DataTypes.JSON
    },
    grouper_idrg_stage1_response:{
        type:DataTypes.JSON
    },
    grouper_idrg_stage1_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    grouper_idrg_stage1_date:{
        type:DataTypes.DATE
    },

    // Stage 7: IDRG Grouper Final
    idrg_grouper_final_request:{
        type:DataTypes.JSON
    },
    idrg_grouper_final_response:{
        type:DataTypes.JSON
    },
    idrg_grouper_final_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    idrg_grouper_final_date:{
        type:DataTypes.DATE
    },

    // Stage 8: IDRG to INACBG Import
    idrg_to_inacbg_request:{
        type:DataTypes.JSON
    },
    idrg_to_inacbg_response:{
        type:DataTypes.JSON
    },
    idrg_to_inacbg_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    idrg_to_inacbg_date:{
        type:DataTypes.DATE
    },

    // Stage 9: INACBG Diagnosa Set (Optional)
    inacbg_diagnosa_request:{
        type:DataTypes.JSON
    },
    inacbg_diagnosa_response:{
        type:DataTypes.JSON
    },
    inacbg_diagnosa_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    inacbg_diagnosa_date:{
        type:DataTypes.DATE
    },

    // Stage 10: INACBG Prosedur Set (Optional)
    inacbg_prosedur_request:{
        type:DataTypes.JSON
    },
    inacbg_prosedur_response:{
        type:DataTypes.JSON
    },
    inacbg_prosedur_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    inacbg_prosedur_date:{
        type:DataTypes.DATE
    },

    // Stage 11: Grouper INACBG Stage 1
    grouper_inacbg_stage1_request:{
        type:DataTypes.JSON
    },
    grouper_inacbg_stage1_response:{
        type:DataTypes.JSON
    },
    grouper_inacbg_stage1_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    grouper_inacbg_stage1_date:{
        type:DataTypes.DATE
    },

    // Stage 12: Grouper INACBG Stage 2 (Optional)
    grouper_inacbg_stage2_request:{
        type:DataTypes.JSON
    },
    grouper_inacbg_stage2_response:{
        type:DataTypes.JSON
    },
    grouper_inacbg_stage2_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    grouper_inacbg_stage2_date:{
        type:DataTypes.DATE
    },

    // Stage 13: INACBG Grouper Final
    inacbg_grouper_final_request:{
        type:DataTypes.JSON
    },
    inacbg_grouper_final_response:{
        type:DataTypes.JSON
    },
    inacbg_grouper_final_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    inacbg_grouper_final_date:{
        type:DataTypes.DATE
    },

    // Stage 14: Claim Final
    claim_final_request:{
        type:DataTypes.JSON
    },
    claim_final_response:{
        type:DataTypes.JSON
    },
    claim_final_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    claim_final_date:{
        type:DataTypes.DATE
    },

    // Stage 15: Send Claim Individual
    send_claim_request:{
        type:DataTypes.JSON
    },
    send_claim_response:{
        type:DataTypes.JSON
    },
    send_claim_status:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    send_claim_date:{
        type:DataTypes.DATE
    },

    // Stage 16: Get Claim Status (Optional)
    get_claim_status_request:{
        type:DataTypes.JSON
    },
    get_claim_status_response:{
        type:DataTypes.JSON
    },
    get_claim_status_date:{
        type:DataTypes.DATE
    },

    // Summary and metadata fields
    current_stage:{
        type:DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Current workflow stage (1-16)'
    },
    overall_status:{
        type:DataTypes.STRING,
        defaultValue: 'PENDING',
        comment: 'PENDING, PROCESSING, COMPLETED, FAILED'
    },
    error_message:{
        type:DataTypes.TEXT,
        comment: 'Error message if any stage fails'
    },
    kode_tarif:{
        type:DataTypes.STRING,
        comment: 'Final tariff code from grouper'
    },
    tarif_tarif:{
        type:DataTypes.DECIMAL(15,2),
        comment: 'Final tariff amount'
    },
    deskripsi_tarif:{
        type:DataTypes.TEXT,
        comment: 'Tariff description'
    },
    cbg_code:{
        type:DataTypes.STRING,
        comment: 'CBG/INA-CBG code'
    },
    special_cmg:{
        type:DataTypes.STRING,
        comment: 'Special CMG code'
    },
    severity_level:{
        type:DataTypes.INTEGER,
        comment: 'Severity level (1-3)'
    },

    // Legacy fields for backward compatibility
    request_eklaim:{
        type:DataTypes.JSON,
        comment: 'Legacy field - use specific stage request fields'
    },
    respon_eklaim:{
        type:DataTypes.JSON,
        comment: 'Legacy field - use specific stage response fields'
    },
    status_eklaim:{
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Legacy field - use overall_status'
    },
    keterangan_eklaim:{
        type:DataTypes.TEXT,
        comment: 'Legacy field - use error_message'
    },
    sinkronisasi_ulang:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    final_klaim:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    grouping_stage_one:{
        type:DataTypes.JSON,
        comment: 'Legacy field - use grouper_inacbg_stage1_response'
    },
    grouping_stage_two:{
        type:DataTypes.JSON,
        comment: 'Legacy field - use grouper_inacbg_stage2_response'
    },
    data_center_klaim:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    tanggal_stage_one:{
        type:DataTypes.DATE,
        comment: 'Legacy field - use grouper_inacbg_stage1_date'
    },
    tanggal_stage_two:{
        type:DataTypes.DATE,
        comment: 'Legacy field - use grouper_inacbg_stage2_date'
    },
    tgl_final:{
        type:DataTypes.DATE,
        comment: 'Legacy field - use claim_final_date'
    },
    tgl_data_center:{
        type:DataTypes.DATE
    }
},
{
paranoid:true,
freezeTableName:true,
indexes: [
    {
        fields: ['nomor_sep']
    },
    {
        fields: ['tagihan_id']
    },
    {
        fields: ['overall_status']
    },
    {
        fields: ['current_stage']
    },
    {
        fields: ['new_claim_status']
    },
    {
        fields: ['send_claim_status']
    },
    {
        fields: ['createdAt']
    }
]
});

historyEklaim.belongsTo(tagihan, { foreignKey: 'tagihan_id' });
tagihan.hasMany(historyEklaim, { foreignKey: 'tagihan_id' });

historyEklaim.belongsTo(users, { foreignKey: 'created_by' });
users.hasMany(historyEklaim, { foreignKey: 'created_by' });

historyEklaim.belongsTo(users, { foreignKey: 'updated_by' });
users.hasMany(historyEklaim, { foreignKey: 'updated_by' });

historyEklaim.belongsTo(users, { foreignKey: 'deleted_by' });
users.hasMany(historyEklaim, { foreignKey: 'deleted_by' });

module.exports = historyEklaim