buat table baru bernama "permintaan_kotor" dengan kolom
- kode_permintaan
- nama_unit
- tanggal_permintaan
- status_permintaan (integer) // 1: menunggu, 2: diambil, 3: proses sterilisasi 4: selesai
- keterangan

buat table baru bernama "permintaan_kotor_list"
- permintaan_kotor_id
- ms_barang_id
- jumlah


buat crud untuk module tersebut, pada saat create permintaan alat kotor maka akan menyimpan data "permintaan_kotor_list" juga
ikuti pattern crud dari modul dari