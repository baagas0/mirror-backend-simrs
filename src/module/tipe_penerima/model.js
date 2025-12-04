const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msJenisLayanan = require('../ms_jenis_layanan/model');
const tipePenerima = sq.define('tipe_penerima', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    initial: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.BOOLEAN // aktif tidak aktif
    },
    remark:{
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});
tipePenerima.belongsTo(msJenisLayanan, { foreignKey: 'ms_jenis_layanan_id' });
msJenisLayanan.hasMany(tipePenerima, { foreignKey: 'ms_jenis_layanan_id' });

module.exports = tipePenerima