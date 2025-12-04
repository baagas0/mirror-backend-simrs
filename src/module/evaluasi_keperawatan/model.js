const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model');
const users = require('../users/model');
const ms_dokter = require('../ms_dokter/model');

const evaluasi_keperawatan = sq.define('evaluasi_keperawatan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    evaluasi_keperawatan: {
        type: DataTypes.JSONB
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
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

evaluasi_keperawatan.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(evaluasi_keperawatan, { foreignKey: "registrasi_id" })

evaluasi_keperawatan.belongsTo(users, { foreignKey: "createdBy" })
users.hasMany(evaluasi_keperawatan, { foreignKey: "createdBy" })

evaluasi_keperawatan.belongsTo(users, { foreignKey: "updatedBy" })
users.hasMany(evaluasi_keperawatan, { foreignKey: "updatedBy" })

evaluasi_keperawatan.belongsTo(ms_dokter, { foreignKey: "perawat_id" })
ms_dokter.hasMany(evaluasi_keperawatan, { foreignKey: "perawat_id" })

module.exports = evaluasi_keperawatan