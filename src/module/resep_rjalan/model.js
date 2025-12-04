const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const registrasi = require('../registrasi/model');
const users = require('../users/model');

const resepRjalan = sq.define('resep_rjalan', {
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
    // ihs_peresepan_obat_id: {
    //     type: DataTypes.STRING,
    // },
    // bahan: {
    //     type: DataTypes.JSONB,
    //     defaultValue: []
    // }
    ihs_pengkajian_obat_id: {
        type: DataTypes.STRING,
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });
    resepRjalan.belongsTo(registrasi, { foreignKey: "registrasi_id" })
    registrasi.hasMany(resepRjalan, { foreignKey: "registrasi_id" })

    resepRjalan.belongsTo(users, { foreignKey: "createdBy" })
    users.hasMany(resepRjalan, { foreignKey: "createdBy" })

    resepRjalan.belongsTo(users, { foreignKey: "updatedBy" })
    users.hasMany(resepRjalan, { foreignKey: "updatedBy" })

    resepRjalan.belongsTo(users, { foreignKey: "deletedBy" })
    users.hasMany(resepRjalan, { foreignKey: "deletedBy" })
    
module.exports = resepRjalan