const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const dform_triage = require('../dform_triage/model');
const deform_triage=require('../dform_triage/model')


const dform_triage_options = sq.define('dform_triage_options', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    label_options:{
        type:DataTypes.STRING
    },
    code_options:{
        type:DataTypes.STRING
    }
   
},
    {
        paranoid: true,
        freezeTableName: true
    }
);

dform_triage_options.belongsTo(dform_triage,{foreignKey:"dform_triage_id"})
dform_triage.hasMany(dform_triage_options,{foreignKey:"dform_triage_id"})



module.exports = dform_triage_options