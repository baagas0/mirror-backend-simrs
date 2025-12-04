const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const registrasi = require('../registrasi/model');
const users = require('../users/model');

const resepIgd = sq.define('resep_igd', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tepat_obat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tepat_dosis: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tepat_rute:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tepat_waktu:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    duplikasi:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    alergi:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    interaksi_obat:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    kontra_indikasi_lain:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    kesesuaian_fornas:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tahap_resep:{
        type: DataTypes.INTEGER,
        defaultValue: 0 // 0 : draft || 1 : telaah || 2 : persiapan || 3 : pengecekan || 4 : penyerahan
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });
    resepIgd.belongsTo(registrasi, { foreignKey: "registrasi_id" })
    registrasi.hasMany(resepIgd, { foreignKey: "registrasi_id" })

    resepIgd.belongsTo(users, { foreignKey: "createdBy" })
    users.hasMany(resepIgd, { foreignKey: "createdBy" })

    resepIgd.belongsTo(users, { foreignKey: "updatedBy" })
    users.hasMany(resepIgd, { foreignKey: "updatedBy" })

    resepIgd.belongsTo(users, { foreignKey: "deletedBy" })
    users.hasMany(resepIgd, { foreignKey: "deletedBy" })
    
module.exports = resepIgd