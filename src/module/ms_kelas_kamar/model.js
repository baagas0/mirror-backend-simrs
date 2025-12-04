const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msFasilitas = require('../ms_fasilitas/model');

const msKelasKamar = sq.define('ms_kelas_kamar', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    // tipe kelas kamar: kelas regular, kelas kamar tamu
    tipe_kelas_kamar: {
        type: DataTypes.STRING
    },
    nama_kelas_kamar: {
        type: DataTypes.STRING
    },
    keterangan_kelas_kamar: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

msKelasKamar.belongsTo(msFasilitas, { foreignKey: 'ms_fasilitas_id' });
msFasilitas.hasMany(msKelasKamar, { foreignKey: 'ms_fasilitas_id' });

module.exports = msKelasKamar