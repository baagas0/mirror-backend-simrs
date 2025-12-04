const router = require("express").Router();

router.use("/adjustment", require('./module/adjustment/route'));
router.use("/antrianList", require('./module/antrian_list/route'));
router.use("/antrianLoket", require('./module/antrian_loket/route'));
router.use("/bedBooking", require('./module/bed_booking/route'));
router.use("/booking", require('./module/booking/route'));
router.use("/bpjs", require('./module/bpjs/route'));
router.use("/formulaHarga", require('./module/formula_harga/route'));
router.use("/historyBed", require('./module/history_bed/route'));
router.use("/historyInventory", require('./module/history_inventory/route'));
router.use("/historyEklaim", require('./module/history_eklaim/route'));
router.use("/jadwalDokter", require('./module/jadwal_dokter/route'));
router.use("/jasaDokter", require('./module/jasa_dokter/route'));
router.use("/jenisAntrian", require('./module/jenis_antrian/route'));
router.use("/kecamatan", require("./module/kecamatan/route"));
router.use("/kelasKunjungan", require("./module/kelas_kunjungan/route"));
router.use("/kelurahan", require("./module/kelurahan/route"));
router.use("/kota", require("./module/kota/route"));
router.use("/layananRuang", require("./module/layanan_ruang/route"));
router.use("/member", require("./module/member/route"));
router.use("/menu", require("./module/menu/route"));
router.use("/msAsuransi", require("./module/ms_asuransi/route"));
router.use("/msBank", require('./module/ms_bank/route'));
router.use("/msBarang", require("./module/ms_barang/route"));
router.use("/msBed", require("./module/ms_bed/route"));
router.use("/msDokter", require('./module/ms_dokter/route'));
router.use("/msEtnis", require("./module/ms_etnis/route"));
router.use("/msFasilitas", require('./module/ms_fasilitas/route'));
router.use("/msGolonganBarang", require("./module/ms_golongan_barang/route"));
router.use("/msGolonganDarah", require("./module/ms_golongan_darah/route"));
router.use("/msGolonganKelasAplicares", require("./module/ms_golongan_kelas_aplicares/route"));
router.use("/msGudang", require("./module/ms_gudang/route"));
router.use("/msHarga", require("./module/ms_harga/route"));
router.use("/msHargaFasilitas", require("./module/ms_harga_fasilitas/route"));
router.use("/msHargaJasa", require("./module/ms_harga_jasa/route"));
router.use("/msJadwalDokter", require("./module/ms_jadwal_dokter/route"));
router.use("/msJasa", require("./module/ms_jasa/route"));
router.use("/msJenisFasilitas", require("./module/ms_jenis_fasilitas/route"));
router.use("/msJenisJasa", require("./module/ms_jenis_jasa/route"));
router.use("/msJenisLayanan", require("./module/ms_jenis_layanan/route"));
router.use("/msJenisObat", require("./module/ms_jenis_obat/route"));
router.use("/msKamar", require("./module/ms_kamar/route"));
router.use("/msKelasKamar", require("./module/ms_kelas_kamar/route"));
router.use("/msKelasKamarSirOnline", require("./module/ms_kelas_kamar_sirsonline/route"));
router.use("/msKelasTerapi", require("./module/ms_kelas_terapi/route"));
router.use("/msKualifikasi", require('./module/ms_kualifikasi/route'));
router.use("/msLayanan", require('./module/ms_layanan/route'));
router.use("/msLoket", require('./module/ms_loket/route'));
router.use("/msPekerjaan", require("./module/ms_pekerjaan/route"));
router.use("/msPendidikan", require("./module/ms_pendidikan/route"));
router.use("/msPoliklinik", require('./module/ms_poliklinik/route'));
router.use("/msProdusen", require("./module/ms_produsen/route"));
router.use("/msProsedur", require("./module/ms_prosedur/route"));
router.use("/msRuang", require("./module/ms_ruang/route"));
router.use("/msSatuanBarang", require("./module/ms_satuan_barang/route"));
router.use("/msSpecialist", require('./module/ms_specialist/route'));
router.use("/msSupplier", require("./module/ms_supplier/route"));
router.use("/mstipeAntrian", require("./module/ms_tipe_antrian/route"));
router.use("/msTarif", require("./module/ms_tarif/route"));
router.use("/panggilan", require('./module/panggilan/route'));
router.use("/pasien", require("./module/pasien/route"));
router.use("/pembayaranPembelian", require("./module/pembayaran_pembelian/route"));
router.use("/pembayaranTagihan", require("./module/pembayaran_tagihan/route"));
router.use("/pembelian", require("./module/pembelian/route"));
router.use("/penanggung", require("./module/penanggung/route"));
router.use("/penjualan", require("./module/penjualan/route"));
router.use("/penjualanBarang", require("./module/penjualan_barang/route"));
router.use("/penjualanFasilitas", require("./module/penjualan_fasilitas/route"));
router.use("/penjualanJasa", require("./module/penjualan_jasa/route"));
router.use("/penjualanExternal", require("./module/penjualan_external/route"));
router.use("/poolExternal", require("./module/pool_external/route"));
router.use("/poolRegistrasi", require("./module/pool_registrasi/route"));
router.use("/print", require("./module/print/route"));
router.use("/provinsi", require("./module/provinsi/route"));
router.use("/registrasi", require('./module/registrasi/route'));
router.use("/roles", require("./module/roles/route"));
router.use("/rujukan", require("./module/rujukan/route"));
router.use("/ruangAplicares", require("./module/ruang_aplicares/route"));
router.use("/rencanaKontrol", require("./module/rencana_kontrol/route"));
router.use("/sep", require('./module/sep/route'));
router.use("/servPembelian", require('./module/serv_pembelian/route'));
router.use("/stock", require("./module/stock/route"));
router.use("/stockOpname", require("./module/stock_opname/route"));
router.use("/subAdjustment", require("./module/sub_adjustment/route"));
router.use("/subPembelian", require("./module/sub_pembelian/route"));
router.use("/subPO", require("./module/sub_po/route"));
router.use("/subStockOpname", require("./module/sub_stock_opname/route"));
router.use("/users", require("./module/users/route"));
router.use("/menu", require("./module/menu/route"));
router.use("/mutasi", require("./module/mutasi/route"));
router.use("/subReqMutasi", require("./module/sub_req_mutasi/route"));
router.use("/subMutasi", require("./module/sub_mutasi/route"));
router.use("/eklaim", require("./module/eklaim/route"));
router.use("/msTipeGl", require("./module/ms_tipe_gl/route"));
router.use("/msCoa", require("./module/ms_coa/route"));
router.use("/tagihan", require("./module/tagihan/route"));
router.use("/transaksi", require("./module/transaksi/route"));
router.use("/kas", require("./module/kas/route"));
router.use("/tipePenerima", require("./module/tipe_penerima/route"));
router.use("/periode", require("./module/periode/route"));
router.use("/subTransaksi", require("./module/sub_transaksi/route"));
router.use("/settingKodeAkun", require("./module/setting_kode_akun/route"));
router.use("/spri", require("./module/spri/route"));

router.use("/msDepreciationMethod", require("./module/ms_depreciation_method/route"));
router.use("/msTypeAsset", require("./module/ms_type_asset/route"));
router.use("/msTypeFiscal", require("./module/ms_type_fiscal/route"));
router.use("/tingkatAsset", require("./module/tingkatasset/route"));
router.use("/fixAsset", require("./module/fixasset/route"));

router.use("/jadwalDepresiasi", require("./module/jadwal_depresiasi/route"));

router.use("/triage", require("./module/triage/route"));
router.use("/evaluasi_keperawatan", require("./module/evaluasi_keperawatan/route"));
router.use("/implementasi_keperawatan_igd", require("./module/implementasi_keperawatan_igd/route"));
router.use("/dform_triage", require("./module/dform_triage/route"));
router.use("/dform_triage_options", require("./module/dform_triage_options/route"));

router.use("/resep_rjalan", require("./module/resep_rjalan/route"));
router.use("/resep_detail_rjalan", require("./module/resep_detail_rjalan/route"));

router.use("/ms_diagnosa", require("./module/ms_diagnosa/route"));
router.use("/assesment_keperawatan_igd", require("./module/assesment_keperawatan_igd/route"));
router.use("/assesment_keperawatan_rjalan", require("./module/assesment_keperawatan_rjalan/route"));
router.use("/assesment_medis_igd", require("./module/assesment_medis_igd/route"));
router.use("/resume_medis_igd", require("./module/resume_medis_igd/route"));
router.use("/assesment_medis_rjalan", require("./module/assesment_medis_rjalan/route"));
router.use("/jenis_penunjang", require("./module/jenis_penunjang/route"));
router.use("/penunjang", require("./module/penunjang/route"));
router.use("/testCreateXML", require("./module/testCreateXML/route"));
router.use("/lab_paket", require("./module/lab_paket/route"));
router.use("/tarif_cbg", require("./module/tarif_cbg/route"));
router.use("/penjualan_penunjang", require("./module/penjualan_penunjang/route"));
router.use("/ms_tipe_tenaga_medis", require("./module/ms_tipe_tenaga_medis/route"));
router.use("/cppt", require("./module/cppt/route"));
router.use("/rad_test", require("./module/rad_test/route"));
router.use("/ms_harga_penunjang", require("./module/ms_harga_penunjang/route"));
router.use("/rad_test_list", require("./module/rad_test_list/route"));
router.use("/rad_regis", require("./module/rad_regis/route"));
router.use("/rad_hasil", require("./module/rad_hasil/route"));
router.use("/rad_expertise", require("./module/rad_expertise/route"));
router.use("/registrasi_upload", require("./module/registrasi_upload/route"));



router.use("/lab_paket_list", require("./module/lab_paket_list/route"));
router.use("/lab_regis", require("./module/lab_regis/route"));
router.use("/evaluasi_keperawatan_rinap", require("./module/evaluasi_keperawatan_rinap/route"));
router.use("/permintaan_kotor", require("./module/permintaan_kotor/route"));
router.use("/implementasi_keperawatan_rinap", require("./module/implementasi_keperawatan_rinap/route"));
router.use("/resep_rnap", require("./module/resep_rnap/route"));
router.use("/resep_detail_rnap", require("./module/resep_detail_rnap/route"));
router.use("/diagnosa_keperawatan", require("./module/diagnosa_keperawatan/route"));
router.use("/waktu", require("./module/waktu/route"));
router.use("/telaah_resep_detail", require("./module/telaah_resep_detail/route"));
router.use("/lab_hasil", require("./module/lab_hasil/route"));

router.use("/resume_medis_ranap", require("./module/resume_medis_ranap/route"));
router.use("/casemix_resume_medis_ranap", require("./module/casemix_resume_medis_ranap/route"));

router.use("/resep_igd", require("./module/resep_igd/route"));
router.use("/resep_detail_igd", require("./module/resep_detail_igd/route"));

router.use("/resep_rnap", require("./module/resep_rnap/route"));
router.use("/resep_detail_rnap", require("./module/resep_detail_rnap/route"));

router.use("/assesment_tambahan_rnap", require("./module/assesment_tambahan_rnap/route"));

router.use("/upload", require("./module/upload/route"));

router.use("/dashboard", require("./module/dashboard/route"));

router.use("/ihs", require("./module/ihs/route"));
router.use("/satu_sehat", require('./module/satu_sehat/route'));

router.use("/laporan_harian", require('./module/laporan_harian/route'));

router.use("/jadwal_operasi", require('./module/jadwal_operasi/route'));
router.use("/hasil_operasi", require('./module/hasil_operasi/route'));
router.use("/kfa", require('./module/kfa/route'));
router.use("/permintaan_steril", require('./module/permintaan_steril/route'));
router.use("/permintaan_steril_list", require('./module/permintaan_steril_list/route'));
router.use("/intra_operasi", require('./module/intra_operasi/route'));
router.use("/operasi_bmhp", require('./module/operasi_bmhp/route'));
router.use("/lab_pengambilan_sampel", require('./module/lab_pengambilan_sampel/route'));
router.use("/lab_laporan", require('./module/lab_laporan/route'));

router.use("/inacbg", require('./module/inacbg/route'));

module.exports = router;