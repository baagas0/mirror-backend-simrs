const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const labPaket = require('../lab_paket/model');
const penunjang = require('../penunjang/model');

const labPaketList = sq.define('lab_paket_list', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    queue: {
        type: DataTypes.INTEGER
    },
    keterangan_lab_paket_list: {
        type: DataTypes.STRING
    },
    operator: {
        type: DataTypes.STRING // ( - range), (< value), (> value), (= value)
    },
    nilai_r_neonatus_min: {
        type: DataTypes.STRING
    },
    nilai_r_neonatus_max: {
        type: DataTypes.STRING
    },
    nilai_r_bayi_min: {
        type: DataTypes.STRING
    },
    nilai_r_bayi_max: {
        type: DataTypes.STRING
    },
    nilai_r_anak_min: {
        type: DataTypes.STRING
    },
    nilai_r_anak_max: {
        type: DataTypes.STRING
    },
    nilai_r_d_perempuan_min: {
        type: DataTypes.STRING
    },
    nilai_r_d_perempuan_max: {
        type: DataTypes.STRING
    },
    nilai_r_d_laki_min: {
        type: DataTypes.STRING
    },
    nilai_r_d_laki_max: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

labPaketList.belongsTo(labPaket, { foreignKey: 'lab_paket_id' });
labPaket.hasMany(labPaketList, { foreignKey: 'lab_paket_id' });

labPaketList.belongsTo(penunjang, { foreignKey: 'penunjang_id' });
penunjang.hasMany(labPaketList, { foreignKey: 'penunjang_id' });

module.exports = labPaketList