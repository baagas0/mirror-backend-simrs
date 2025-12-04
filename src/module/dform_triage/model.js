const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const dform_triage = sq.define('dform_triage', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    parent_id:{
        type:DataTypes.STRING
    },
    show:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    class_dform_triage:{
        type:DataTypes.STRING
    },
    value:{
        type:DataTypes.STRING
    },
    label:{
        type:DataTypes.STRING
    },
    placeholder:{
        type:DataTypes.STRING
    },
    type_dform_triage:{
        type:DataTypes.STRING
    },
    required:{
        type:DataTypes.STRING
    },
    position:{
        type:DataTypes.STRING
    },
    key:{
        type:DataTypes.STRING
    },
    getter:{
        type:DataTypes.TEXT
    },
    api_options:{
        type:DataTypes.BOOLEAN
    },
    lock:{
        type:DataTypes.BOOLEAN
    },
    urutan:{
        type:DataTypes.INTEGER
    },
    keterangan:{
        type:DataTypes.TEXT
    },
    is_array:{
        type:DataTypes.BOOLEAN
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });



module.exports = dform_triage