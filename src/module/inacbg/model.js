const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const inacbg = sq.define('inacbg', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nomor_sep: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nomor_kartu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_pasien: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_klaim: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    last_inacbg_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = inacbg