const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const waktu = require('../waktu/model');
const resepDetailRnap = require('../resep_detail_rnap/model');

const telaahResepDetail = sq.define('telaah_resep_detail', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    qty: {
        type: DataTypes.FLOAT
    },
    persiapan: {
        type: DataTypes.BOOLEAN
    },
    tanggal_persiapan: {
        type: DataTypes.DATE
    },
    keterangan: {
        type: DataTypes.TEXT
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

telaahResepDetail.belongsTo(waktu, { foreignKey: 'waktu_id' });
waktu.hasMany(telaahResepDetail, { foreignKey: 'waktu_id' });

telaahResepDetail.belongsTo(resepDetailRnap, { foreignKey: 'resep_detail_rnap_id' });
resepDetailRnap.hasMany(telaahResepDetail, { foreignKey: 'resep_detail_rnap_id' });

module.exports = telaahResepDetail
