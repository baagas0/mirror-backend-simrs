const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const gudang = require('../ms_gudang/model');
const mutasi = sq.define('mutasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_mutasi: {
        type: DataTypes.DATE
    },
    is_mutasi: {
        type: DataTypes.SMALLINT // 0 = sub req, 1 = sub mutasi
    },
    status_mutasi: {
        type: DataTypes.SMALLINT // 0 = batal, 1=create, 2=proses, null jika masih request mutasi dan blm ada sub mutasi
    }
}, {
    paranoid: true,
    freezeTableName: true
});
mutasi.belongsTo(gudang, { foreignKey: 'ms_gudang_sumber_id' });
gudang.hasMany(mutasi, { foreignKey: 'ms_gudang_sumber_id' });

mutasi.belongsTo(gudang, { foreignKey: 'ms_gudang_tujuan_id' });
gudang.hasMany(mutasi, { foreignKey: 'ms_gudang_tujuan_id' });

module.exports = mutasi