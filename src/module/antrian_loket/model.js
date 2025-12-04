const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msLoket = require('../ms_loket/model');

const antrianLoket = sq.define('antrian_loket', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_antrian_loket: {
        type: DataTypes.DATE
    },
    initial_loket: {
        type: DataTypes.STRING
    },
    antrian_no_loket: {
        type: DataTypes.INTEGER
    },
    status_antrian_loket: {
        type: DataTypes.SMALLINT,
        defaultValue: 1     //1: dibuat || 2: proses || 9: selesai  
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

    
    antrianLoket.belongsTo(msLoket, { foreignKey: "ms_loket_id" })
    msLoket.hasMany(antrianLoket, { foreignKey: "ms_loket_id" })
    
module.exports = antrianLoket