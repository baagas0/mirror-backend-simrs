const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const evaluasiKeperawatanRinap = require('../evaluasi_keperawatan_rinap/model');
const users = require('../users/model');

const implementasiKeperawatanRinap = sq.define('implementasi_keperawatan_rinap', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    waktu_implementasi:{
        type:DataTypes.DATE
    },
    diagnosa:{
        type:DataTypes.STRING
    },
    jenis_implementasi :{
        type:DataTypes.STRING
    },
    implementasi:{
        type:DataTypes.STRING
    },
    respon_pasien: {
        type: DataTypes.JSONB
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

implementasiKeperawatanRinap.belongsTo(evaluasiKeperawatanRinap, { foreignKey: "evaluasi_id" })
evaluasiKeperawatanRinap.hasMany(implementasiKeperawatanRinap, { foreignKey: "evaluasi_id" })

evaluasiKeperawatanRinap.belongsTo(users, { foreignKey: "createdBy" })
users.hasMany(evaluasiKeperawatanRinap, { foreignKey: "createdBy" })

evaluasiKeperawatanRinap.belongsTo(users, { foreignKey: "updatedBy" })
users.hasMany(evaluasiKeperawatanRinap, { foreignKey: "updatedBy" })

module.exports = implementasiKeperawatanRinap