const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const registrasi = require('../registrasi/model');
const users = require('../users/model');
const cppt = require('../cppt/model');

const resepRnap = sq.define('resep_rnap', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    resep_lengkap:{
        type:DataTypes.BOOLEAN
    },
    pasien_sesuai:{
        type:DataTypes.BOOLEAN
    },
    tepat_obat:{
        type:DataTypes.BOOLEAN
    },
    campuran_obat_stabil:{
        type:DataTypes.BOOLEAN
    },
    tepat_dosis:{
        type:DataTypes.BOOLEAN
    },
    rute_pemberian:{
        type:DataTypes.BOOLEAN
    },
    tidak_interaksi:{
        type:DataTypes.BOOLEAN
    },
    tidak_duplikasi:{
        type:DataTypes.BOOLEAN
    },
    tidak_alergi:{
        type:DataTypes.BOOLEAN
    },
    tahap_resep:{
        type:DataTypes.INTEGER,
        defaultValue:0 // 0 : draft || 1 : telaah || 2 : persiapan || 3 : pengecekan || 4 : penyerahan
    },
},{
    paranoid:true,
    freezeTableName:true,
});
resepRnap.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(resepRnap, { foreignKey: "registrasi_id" })

resepRnap.belongsTo(users, { foreignKey: "createdBy" })
users.hasMany(resepRnap, { foreignKey: "createdBy" })

resepRnap.belongsTo(users, { foreignKey: "updatedBy" })
users.hasMany(resepRnap, { foreignKey: "updatedBy" })

resepRnap.belongsTo(users, { foreignKey: "deletedBy" })
users.hasMany(resepRnap, { foreignKey: "deletedBy" })

resepRnap.belongsTo(cppt, { foreignKey: "cppt_id" })
cppt.hasMany(resepRnap, { foreignKey: "cppt_id" })

module.exports = resepRnap