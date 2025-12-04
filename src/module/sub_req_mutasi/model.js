const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const mutasi = require('../mutasi/model');
const msBarang = require('../ms_barang/model');

const subReqMutasi = sq.define('sub_req_mutasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    qty_req: {
        type: DataTypes.FLOAT
    }
}, {
    paranoid: true,
    freezeTableName: true
});

subReqMutasi.belongsTo(mutasi,{foreignKey:'mutasi_id'});
mutasi.hasMany(subReqMutasi,{foreignKey:'mutasi_id'});

subReqMutasi.belongsTo(msBarang,{foreignKey:'ms_barang_id'});
msBarang.hasMany(subReqMutasi,{foreignKey:'ms_barang_id'});

module.exports = subReqMutasi