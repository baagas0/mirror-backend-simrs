const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msJasa = require('../ms_jasa/model')
const msDokter = require('../ms_dokter/model')

const jasaDokter = sq.define('jasa_dokter', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

jasaDokter.belongsTo(msJasa, { foreignKey: "ms_jasa_id" })
msJasa.hasMany(jasaDokter, { foreignKey: "ms_jasa_id" })

jasaDokter.belongsTo(msDokter, { foreignKey: "dokter_id" })
msDokter.hasMany(jasaDokter, { foreignKey: "dokter_id" })

module.exports = jasaDokter