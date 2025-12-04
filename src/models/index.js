const labRegis = require('../module/lab_regis/model');
const labPengambilanSampel = require('../module/lab_pengambilan_sampel/model');
const msDokter = require('../module/ms_dokter/model');
const registrasi = require('../module/registrasi/model');

// Setup associations di sini untuk menghindari circular dependency
// Hubungan antara labPengambilanSampel dan labRegis
labPengambilanSampel.belongsTo(labRegis, { foreignKey: 'lab_regis_id', as: 'labRegis' });
labRegis.hasMany(labPengambilanSampel, { foreignKey: 'lab_regis_id', as: 'pengambilanSampels' });

// Hubungan antara labPengambilanSampel dan msDokter (sebagai petugas)
labPengambilanSampel.belongsTo(msDokter, { foreignKey: 'petugas_ambil_id', as: 'petugasAmbil' });
msDokter.hasMany(labPengambilanSampel, { foreignKey: 'petugas_ambil_id', as: 'pengambilanSampels' });

// Hubungan antara labRegis dan msDokter (sebagai dokter)
labRegis.belongsTo(msDokter, { foreignKey: 'dokter_id' });
msDokter.hasMany(labRegis, { foreignKey: 'dokter_id' });

// Hubungan antara labRegis dan registrasi
labRegis.belongsTo(registrasi, { foreignKey: 'registrasi_id' });
registrasi.hasMany(labRegis, { foreignKey: 'registrasi_id' });

module.exports = {
    labRegis,
    labPengambilanSampel,
    msDokter,
    registrasi
};