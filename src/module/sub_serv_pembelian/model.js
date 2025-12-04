const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const servPembelian = require('../serv_pembelian/model');
const pembelian = require('../pembelian/model');

const subServPembelian = sq.define('sub_serv_pembelian', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    status_sub_serv_pembelian: {
        type: DataTypes.SMALLINT
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

subServPembelian.belongsTo(servPembelian, { foreignKey: 'serv_pembelian_id' });
servPembelian.hasMany(subServPembelian, { foreignKey: 'serv_pembelian_id' });

subServPembelian.belongsTo(pembelian, { foreignKey: 'pembelian_id' });
pembelian.hasMany(subServPembelian, { foreignKey: 'pembelian_id' });

module.exports = subServPembelian