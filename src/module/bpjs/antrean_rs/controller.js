const { QueryTypes, json } = require("sequelize");
const moment = require("moment");
const antreanApi = require("../../../helper/antrean_api");
const antrianList = require("../../antrian_list/model");
const antrianBpjsLog = require("../model");
const { sq } = require("../../../config/connection");
class Controller {
  static async refPoli(req, res) {
    try {
      let data = await antreanApi.get("/ref/poli");
      res.status(200).json({ status: 200, message: "sukses", data: data.data });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error.response?.data || error.message,
      });
    }
  }

  static async refDokter(req, res) {
    try {
      let data = await antreanApi.get(`/ref/dokter`);
      res.status(200).json({ status: 200, message: "sukses", data: data.data });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error.response?.data || error.message,
      });
    }
  }

  static async refJadwalDokter(req, res) {
    try {
      const { kode_poli, tanggal } = req.body;
      let data = await antreanApi.get(`/jadwaldokter/kodepoli/${kode_poli}/tanggal/${tanggal}`);
      res.status(200).json({ status: 200, message: "sukses", data: data.data });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error.response?.data || error.message,
      });
    }
  }

  static async logAntrol(req, res) {
    try {
      const { kode_booking } = req.body;
      let data = await antreanApi.post(`/antrean/getlisttask`, { kodebooking: kode_booking });
      res.status(200).json({ status: 200, message: "sukses", data: data.data });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error.response?.data || error.message,
      });
    }
  }

  static async antrolAktif(req, res) {
    try {
      let data = await antreanApi.get(`/antrean/pendaftaran/aktif`);
      res.status(200).json({ status: 200, message: "sukses", data: data.data });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error.response?.data || error.message,
      });
    }
  }

  static async createAntrean(req, res) {
    const { kode_booking, jenis_pasien, nomor_kartu, nik, no_hp, kode_poli, nama_poli, no_rm, tgl_periksa, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, nomor_antrean, angka_antrean, sisa_kuota_jkn, kuota_jkn, kuota_non_jkn, sisa_kuota_non_jkn, keterangan,
    } = req.body;

    try {
      const time = moment().valueOf();

      let objCreate = {
        ...req.body,
        kodebooking: kode_booking,
        jenispasien: jenis_pasien,
        nomorkartu: nomor_kartu,
        nik: nik,
        nohp: no_hp,
        kodepoli: kode_poli,
        namapoli: nama_poli,
        pasienbaru: 1,
        norm: no_rm,
        tanggalperiksa: tgl_periksa,
        kodedokter: kode_dokter,
        namadokter: nama_dokter,
        jampraktek: jam_praktek,
        jeniskunjungan: jenis_kunjungan,
        nomorreferensi: nomor_referensi,
        nomorantrean: nomor_antrean,
        angkaantrean: angka_antrean,
        estimasidilayani: time,
        sisakuotajkn: sisa_kuota_jkn,
        kuotajkn: kuota_jkn,
        sisakuotanonjkn: sisa_kuota_non_jkn,
        kuotanonjkn: kuota_non_jkn,
        keterangan: keterangan,
      };

      let data = await antreanApi.post("/antrean/add", objCreate);

      res.status(200).json({ status: 200, message: "sukses", data: data.data });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error.response?.data || error.message,
      });
    }
  }

  static async updateWaktuAntrean(req, res) {
    const { kode_booking, task_id, waktu, jenis_resep } = req.body;

    try {
      // Validasi input
      if (!kode_booking || !task_id) {
        return res.status(400).json({
          status: 400,
          message: "Parameter kode_booking, task_id, dan waktu harus diisi",
          data: null
        });
      }

      // Validasi task_id
      const validTaskIds = [1, 2, 3, 4, 5, 6, 7, 99];
      if (!validTaskIds.includes(task_id)) {
        return res.status(400).json({
          status: 400,
          message: "Task ID tidak valid. Harus antara 1-7 atau 99",
          data: null
        });
      }

      const time = moment().valueOf();

      let objUpdate = {
        kodebooking: kode_booking,
        taskid: task_id,
        waktu: waktu || time, // Gunakan waktu yang diberikan atau waktu saat ini jika tidak ada
      };

      // Tambahkan jenis_resep jika ada (untuk task farmasi)
      if (jenis_resep && (task_id === 5 || task_id === 6 || task_id === 7)) {
        const validJenisResep = ['Tidak ada', 'Racikan', 'Non Racikan'];
        if (!validJenisResep.includes(jenis_resep)) {
          return res.status(400).json({
            status: 400,
            message: "Jenis resep tidak valid",
            data: validJenisResep
          });
        }
        objUpdate.jenisresep = jenis_resep;
      }

      let data = await antreanApi.post("/antrean/updatewaktu", objUpdate);

      res.status(200).json({ 
        status: 200, 
        message: "sukses update waktu antrian", 
        data: data.data 
      });

    } catch (error) {
      console.log("Error update waktu antrian:", error);
      res.status(500).json({
        status: 500,
        message: "gagal update waktu antrian",
        data: error.response?.data || error.message,
      });
    }
  }

  static async batalAntrean(req, res) {
    const { kode_booking, keterangan } = req.body;

    try {
      // Validasi input
      if (!kode_booking) {
        return res.status(400).json({
          status: 400,
          message: "Parameter kode_booking harus diisi",
          data: null
        });
      }

      let objBatal = {
        kodebooking: kode_booking,
        keterangan: keterangan || "Dibatalkan oleh pasien"
      };

      let data = await antreanApi.post("/antrean/batal", objBatal);

      res.status(200).json({ 
        status: 200, 
        message: "sukses batal antrian", 
        data: data.data 
      });

    } catch (error) {
      console.log("Error batal antrian:", error);
      res.status(500).json({
        status: 500,
        message: "gagal batal antrian",
        data: error.response?.data || error.message,
      });
    }
  }

  static async updateJadwalDokter(req, res) {
    const { kode_poli, kode_subspesialis, kode_dokter, jadwal } = req.body;

    try {
      // Validasi input`
      if (!kode_poli || !kode_subspesialis || !kode_dokter || !jadwal) {
        return res.status(400).json({
          status: 400,
          message: "Parameter kode_poli, kode_subspesialis, kode_dokter, dan jadwal harus diisi",
          data: null
        });
      }

      // Validasi jadwal adalah array
      if (!Array.isArray(jadwal) || jadwal.length === 0) {
        return res.status(400).json({
          status: 400,
          message: "Jadwal harus berupa array dan tidak boleh kosong",
          data: null
        });
      }

      // Validasi setiap item jadwal
      const validHari = [1, 2, 3, 4, 5, 6, 7, 8];
      for (let i = 0; i < jadwal.length; i++) {
        const item = jadwal[i];
        
        if (!item.hari || !item.buka || !item.tutup) {
          return res.status(400).json({
            status: 400,
            message: `Jadwal index ${i}: hari, buka, dan tutup harus diisi`,
            data: null
          });
        }

        if (!validHari.includes(parseInt(item.hari))) {
          return res.status(400).json({
            status: 400,
            message: `Jadwal index ${i}: hari tidak valid. Harus antara 1-8`,
            data: {
              keterangan: "1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu, 7=Minggu, 8=Hari Libur"
            }
          });
        }

        // Validasi format waktu (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(item.buka) || !timeRegex.test(item.tutup)) {
          return res.status(400).json({
            status: 400,
            message: `Jadwal index ${i}: format waktu tidak valid. Gunakan format HH:MM`,
            data: null
          });
        }
      }

      let objUpdate = {
        kodepoli: kode_poli,
        kodesubspesialis: kode_subspesialis,
        kodedokter: kode_dokter,
        tanggal: "2025-09-09",
        jadwal: jadwal
      };

      let data = await antreanApi.post("/jadwaldokter/updatejadwaldokter", objUpdate);

      res.status(200).json({ 
        status: 200, 
        message: "sukses update jadwal dokter", 
        data: data.data 
      });

    } catch (error) {
      console.log("Error update jadwal dokter:", error);
      res.status(500).json({
        status: 500,
        message: "gagal update jadwal dokter",
        data: error.response?.data || error.message,
      });
    }
  }

  static async logAntrean(req, res) {
    try {
      const { halaman, jumlah, kode_booking } = req.body;

      const offset = halaman ? (+halaman - 1) * jumlah : 0;
      const limit = jumlah ? jumlah : 10;

      const whereClause = {};
      if (kode_booking) {
        whereClause.kode_booking = kode_booking;
      }

      const antrian = await antrianList.findAll({
        include: [
          {
            model: antrianBpjsLog,
            as: 'log_bpjs',
            required: true, // INNER JOIN - hanya tampilkan jika ada log BPJS
            where: whereClause,
            separate: true, // Untuk mendapatkan array terpisah
            order: [['waktu', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        offset: offset,
        limit: limit,
      });

      const transformedData = antrian.map(item => ({
        ...item.toJSON(),
        log_bpjs: item.log_bpjs || []
      }));

      const totalCount = await antrianList.count({
        include: [
          {
            model: antrianBpjsLog,
            required: true,
            where: whereClause
          }
        ]
      });

      res.status(200).json({
        status: 200,
        message: "sukses mengambil log antrean",
        data: transformedData,
        count: transformedData.length,
        total: totalCount,
        halaman: halaman || 1,
        jumlah: jumlah || 10,
        total_halaman: Math.ceil(totalCount / (jumlah || 10))
      });

    } catch (error) {
      console.log("Error mengambil log antrean:", error);
      res.status(500).json({
        status: 500,
        message: "gagal mengambil log antrean",
        data: error.response?.data || error.message,
      });
    }
  }

  static async monitorAntrean(req, res) {
    try {
      const { halaman, jumlah, kode_booking } = req.body;

      const page = parseInt(halaman) || 1;
      const limit = parseInt(jumlah) || 10;
      const offset = (page - 1) * limit;

            // Alternative approach using Sequelize literal to get the latest record per group
      const { count, rows } = await antrianBpjsLog.findAndCountAll({
        attributes: [
          'kode_booking',
          [sq.fn('max', sq.col('createdAt')), 'latest_date']
        ],
        group: ['kode_booking'],
        limit,
        offset,
        order: [[sq.literal('latest_date'), 'DESC']],
        raw: true
      });

      console.log(rows)

      // ambil semua kode_booking di halaman ini
      const kodeBookings = rows.map(r => r.kode_booking);

      // ambil semua log untuk kode_booking yang tampil di page ini
      const logs = await antrianBpjsLog.findAll({
        where: { kode_booking: kodeBookings },
        order: [['createdAt', 'DESC']],
        raw: true
      });
      console.log('===> controller.js:393 ~ logs', logs);

      // group ke dalam format { kode_booking, history: [...] }
      const grouped = Object.values(
        logs.reduce((acc, log) => {
          if (!acc[log.kode_booking]) {
            acc[log.kode_booking] = {
              kode_booking: log.kode_booking,
              createdAt: log.createdAt,
              history: []
            };
          }

          log.status_code = log?.response?.metadata?.code || null;
          acc[log.kode_booking].history.push(log);
          return acc;
        }, {})
      );

      res.status(200).json({
        status: 200,
        message: "sukses mengambil log antrean",
        data: grouped,
        count: grouped.length,
        total: count.length,
        halaman: halaman || 1,
        jumlah: jumlah || 10,
        total_halaman: Math.ceil(count.length / (jumlah || 10))
      });

    } catch (error) {
      console.log("Error mengambil log antrean:", error);
      res.status(500).json({
        status: 500,
        message: "gagal mengambil log antrean",
        data: error.response?.data || error.message,
      });
    }
  }
}

module.exports = Controller;
