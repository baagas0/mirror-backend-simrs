const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const labPaket = require('../lab_paket/model');
const penunjang = require('../penunjang/model');
const labRegis = require('../lab_regis/model');

const labHasil = sq.define('lab_hasil', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    queue: {
        type: DataTypes.JSON
    },
    keterangan_lab_hasil: {
        type: DataTypes.STRING
    },
    hasil: {
        type: DataTypes.STRING
    },
    is_normal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    nama_penunjang: {
        type: DataTypes.STRING
    },
    parameter_normal: {
        type: DataTypes.STRING
    },
    satuan:{
        type: DataTypes.STRING
    },
    nilai_natrium: {
        type: DataTypes.STRING
    },
    nilai_chloride: {
        type: DataTypes.STRING
    },
    nilai_kalium: {
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
    tanggal_selesai: {
        type: DataTypes.DATE
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

labHasil.belongsTo(labPaket, { foreignKey: 'lab_paket_id' });
labPaket.hasMany(labHasil, { foreignKey: 'lab_paket_id' });

labHasil.belongsTo(penunjang, { foreignKey: 'penunjang_id' });
penunjang.hasMany(labHasil, { foreignKey: 'penunjang_id' });

labHasil.belongsTo(labRegis, { foreignKey: 'lab_regis_id' });
labRegis.hasMany(labHasil, { foreignKey: 'lab_regis_id' });

module.exports = labHasil