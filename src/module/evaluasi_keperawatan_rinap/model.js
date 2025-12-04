const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');
const users = require('../users/model');
const evaluasiKeperawatanRinap = sq.define('evaluasi_keperawatan_rinap', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tindak_lanjut: {
        type: DataTypes.STRING
    },
    catatan: {
        type: DataTypes.STRING
    },
    status_evaluasi_keperawatan: {
        type: DataTypes.BOOLEAN,
        defaultValue: true //true = open masih bisa submit implementasi keperawatan, false = tutup tidak bisa submit implementasi keperawatan
    },
    waktu_evaluasi: {
        type: DataTypes.DATE
    },
    perawat_id: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

evaluasiKeperawatanRinap.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(evaluasiKeperawatanRinap, { foreignKey: "registrasi_id" })

evaluasiKeperawatanRinap.belongsTo(users, { foreignKey: "createdBy" })
users.hasMany(evaluasiKeperawatanRinap, { foreignKey: "createdBy" })

evaluasiKeperawatanRinap.belongsTo(users, { foreignKey: "updatedBy" })
users.hasMany(evaluasiKeperawatanRinap, { foreignKey: "updatedBy" })

module.exports = evaluasiKeperawatanRinap