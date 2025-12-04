const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const evaluasiKeperawatan = require('../evaluasi_keperawatan/model');
const users = require('../users/model');

const implementasiKeperawatanIgd = sq.define('implementasi_keperawatan_igd', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    implementasi_keperawatan_igd: {
        type: DataTypes.JSONB
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

implementasiKeperawatanIgd.belongsTo(evaluasiKeperawatan, { foreignKey: "evaluasi_id" })
evaluasiKeperawatan.hasMany(implementasiKeperawatanIgd, { foreignKey: "evaluasi_id" })

implementasiKeperawatanIgd.belongsTo(users, { foreignKey: "createdBy" })
users.hasMany(implementasiKeperawatanIgd, { foreignKey: "createdBy" })

implementasiKeperawatanIgd.belongsTo(users, { foreignKey: "updatedBy" })
users.hasMany(implementasiKeperawatanIgd, { foreignKey: "updatedBy" })

module.exports = implementasiKeperawatanIgd