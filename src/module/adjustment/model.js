const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const gudang = require('../ms_gudang/model');
const user = require('../users/model');

const adjustment = sq.define('adjustment', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_adjustment: {
        type: DataTypes.DATE
    },
    kode_adjustment: {
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    idgl_tambah: {
        type: DataTypes.STRING
    },
    idgl_kurang: {
        type: DataTypes.STRING
    },
    status_adjustment: {
        type: DataTypes.SMALLINT // 0: ditolak || 1: dibuat || 2: diacc
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

adjustment.belongsTo(gudang, { foreignKey: 'ms_gudang_id' });
gudang.hasMany(adjustment, { foreignKey: 'ms_gudang_id' });

adjustment.belongsTo(user, { foreignKey: 'user_id' });
user.hasMany(adjustment, { foreignKey: 'user_id' });


module.exports = adjustment