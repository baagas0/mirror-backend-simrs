const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const pasien = require('../pasien/model');
const kelasKunjungan = require('../kelas_kunjungan/model');
const asuransi = require('../ms_asuransi/model');
const jenisLayanan = require('../ms_jenis_layanan/model');

const tagihan = sq.define('tagihan',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    no_asuransi:{
        type:DataTypes.STRING
    },
    tgl_tagihan:{
        type:DataTypes.DATE        
    },
    nama_tagihan:{
        type:DataTypes.STRING        //nama pasien
    },
    no_npwp_tagihan:{
        type:DataTypes.STRING
    },
    no_sep_tagihan:{
        type:DataTypes.STRING
    },
    keterangan_tagihan:{
        type:DataTypes.STRING
    },
    idgl_tagihan:{
        type:DataTypes.STRING
    },
    total_tagihan:{
        type:DataTypes.FLOAT        // 2 angka dibelakang koma
    },
    usia_pasien_tagihan:{
        type:DataTypes.STRING
    },
    total_bayar_tagihan:{
        type:DataTypes.FLOAT
    },
    status_tagihan:{
        type:DataTypes.SMALLINT,
        defaultValue: 1         //1=buka, 2=kunci
    },
    selisih_lebih_ditanggung_tagihan:{
        type:DataTypes.FLOAT
    },
    selisih_kurang_ditanggung_tagihan:{
        type:DataTypes.FLOAT
    },
    kode_tagihan:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    history_eklaim_id:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

tagihan.belongsTo(pasien, { foreignKey: 'pasien_id' });
pasien.hasMany(tagihan, { foreignKey: 'pasien_id' });

tagihan.belongsTo(kelasKunjungan, { foreignKey: 'kelas_kunjungan_id' });
kelasKunjungan.hasMany(tagihan, { foreignKey: 'kelas_kunjungan_id' });

tagihan.belongsTo(asuransi, { foreignKey: 'ms_asuransi_id' });
asuransi.hasMany(tagihan, { foreignKey: 'ms_asuransi_id' });

tagihan.belongsTo(jenisLayanan, { foreignKey: 'ms_jenis_layanan_id' });
jenisLayanan.hasMany(tagihan, { foreignKey: 'ms_jenis_layanan_id' });

module.exports = tagihan