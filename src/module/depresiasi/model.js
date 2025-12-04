const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const jadwalDepresiasi = require('../jadwal_depresiasi/model')
const fixAsset = require('../fixasset/model')
const msBed = require('../ms_bed/model')

const depresiasi = sq.define('depresiasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATE
    },
    idgl: {
        type: DataTypes.STRING
    },
    jumlah: {
        type: DataTypes.INTEGER
    },
    remark: {
        type: DataTypes.TEXT             
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);

// depresiasi.belongsTo(jadwalDepresiasi, { foreignKey: "jadwal_depresiasi_id" });

depresiasi.belongsTo(jadwalDepresiasi, { foreignKey: 'jadwal_depresiasi_id' });
jadwalDepresiasi.hasMany(depresiasi, { foreignKey: 'jadwal_depresiasi_id' });

depresiasi.belongsTo(fixAsset, { foreignKey: 'fixasset_id' });
fixAsset.hasMany(depresiasi, { foreignKey: 'fixasset_id' });

module.exports = depresiasi