const jadwalDokter = require("./model");
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const moment = require("moment");
moment.locale("id");
const { QueryTypes } = require("sequelize");
const s = { type: QueryTypes.SELECT };
const { createClient } = require("redis");
const client = createClient({
  url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`,
  legacyMode: true,
});
const ClusterCronJob = require("cron-cluster")(client, {
  key: "leader_key",
}).CronJob;
client.connect().catch(console.error);

function syncJadwal() {
  var job = new ClusterCronJob(
    "35 1 * * *",
    async function () {
      try {
        let curday = moment().format("dddd");
        let tanggal = moment().add(7, "d").format("YYYY-MM-DD");
        let cek_jadwal = await sq.query(
          `select * from jadwal_dokter jd where jd."deletedAt" isnull and date(jd.tgl_jadwal) = '${tanggal}'`,
          s
        );

        if (cek_jadwal.length > 0) {
          console.log("jadwal dokter sudah ada");
        } else {
          let cek_master_jadwal = await sq.query(
            `select mjd.id as "ms_jadwal_dokter_id", * from ms_jadwal_dokter mjd where mjd."deletedAt" isnull and mjd.hari_master = '${curday}'`,
            s
          );
          let data_jadwal = [];
          for (let i = 0; i < cek_master_jadwal.length; i++) {
            data_jadwal.push({
              id: uuid_v4(),
              tgl_jadwal: moment().add(7, "d").format("YYYY-MM-DD"),
              waktu_mulai: cek_master_jadwal[i].waktu_mulai_master,
              waktu_selesai: cek_master_jadwal[i].waktu_selesai_master,
              hari_jadwal: cek_master_jadwal[i].hari_master,
              quota: cek_master_jadwal[i].quota_master,
              quota_jkn: cek_master_jadwal[i].quota_jkn_master,
              quota_booking: cek_master_jadwal[i].quota_booking_master,
              status_jadwal: cek_master_jadwal[i].status_master,
              ms_poliklinik_id: cek_master_jadwal[i].ms_poliklinik_id,
              ms_dokter_id: cek_master_jadwal[i].ms_dokter_id,
              ms_jenis_layanan_id: cek_master_jadwal[i].ms_jenis_layanan_id,
              ms_jadwal_dokter_id: cek_master_jadwal[i].ms_jadwal_dokter_id,
              initial_jadwal: cek_master_jadwal[i].initial_master,
            });
          }
          await jadwalDokter.bulkCreate(data_jadwal);
          console.log("berhasil membuat jadwal dokter");
        }
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Asia/Jakarta"
  );
  job.start();
}

syncJadwal();

class Controller {
  static async syncJadwal(req, res) {
    const { tanggal } = req.body;
    try {
      let curday = moment(tanggal).format("dddd");
      console.log(tanggal, curday);

      let cek_master_jadwal = await sq.query(
        `select mjd.id as "ms_jadwal_dokter_id", * from ms_jadwal_dokter mjd where mjd."deletedAt" isnull and mjd.hari_master = '${curday}'`,
        s
      );
      let jadwal = await sq.query(
        `select * from jadwal_dokter jd where jd."deletedAt" isnull and date(jd.tgl_jadwal)= '${tanggal}'`,
        s
      );
      let data_jadwal = [];

      for (let i = 0; i < cek_master_jadwal.length; i++) {
        let cek = true;
        for (let j = 0; j < jadwal.length; j++) {
          if (
            jadwal[j].ms_jadwal_dokter_id ==
            cek_master_jadwal[i].ms_jadwal_dokter_id
          ) {
            cek = false;
          }
        }
        if (cek) {
          data_jadwal.push({
            id: uuid_v4(),
            tgl_jadwal: tanggal,
            waktu_mulai: cek_master_jadwal[i].waktu_mulai_master,
            waktu_selesai: cek_master_jadwal[i].waktu_selesai_master,
            hari_jadwal: cek_master_jadwal[i].hari_master,
            quota: cek_master_jadwal[i].quota_master,
            quota_jkn: cek_master_jadwal[i].quota_jkn_master,
            quota_booking: cek_master_jadwal[i].quota_booking_master,
            status_jadwal: cek_master_jadwal[i].status_master,
            ms_poliklinik_id: cek_master_jadwal[i].ms_poliklinik_id,
            ms_dokter_id: cek_master_jadwal[i].ms_dokter_id,
            ms_jenis_layanan_id: cek_master_jadwal[i].ms_jenis_layanan_id,
            ms_jadwal_dokter_id: cek_master_jadwal[i].ms_jadwal_dokter_id,
            initial_jadwal: cek_master_jadwal[i].initial_master,
          });
        }
      }

      console.log(data_jadwal);
      // console.log(data_jadwal);
      await jadwalDokter.bulkCreate(data_jadwal);
      res.status(200).json({ status: 200, message: "sukses" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static register(req, res) {
    const {
      tgl_jadwal,
      waktu_mulai,
      waktu_selesai,
      tgl_perubahan,
      hari_perubahan,
      waktu_mulai_perubahan,
      waktu_selesai_perubahan,
      ms_jadwal_dokter_id,
      initial_jadwal,
      quota,
      quota_jkn,
      quota_booking,
      status_jadwal,
      hari_jadwal,
    } = req.body;

    jadwalDokter
      .create({
        id: uuid_v4(),
        tgl_jadwal,
        waktu_mulai,
        waktu_selesai,
        tgl_perubahan,
        hari_perubahan,
        waktu_mulai_perubahan,
        waktu_selesai_perubahan,
        ms_jadwal_dokter_id,
        initial_jadwal,
        quota,
        quota_jkn,
        quota_booking,
        status_jadwal,
        hari_jadwal,
      })
      .then((hasil) => {
        res.status(200).json({ status: 200, message: "sukses", data: hasil });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      });
  }

  static update(req, res) {
    const {
      id,
      tgl_jadwal,
      waktu_mulai,
      waktu_selesai,
      tgl_perubahan,
      hari_perubahan,
      waktu_mulai_perubahan,
      waktu_selesai_perubahan,
      ms_jadwal_dokter_id,
      initial_jadwal,
      quota,
      quota_jkn,
      quota_booking,
      status_jadwal,
      hari_jadwal,
    } = req.body;

    jadwalDokter
      .update(
        {
          tgl_jadwal,
          waktu_mulai,
          waktu_selesai,
          tgl_perubahan,
          hari_perubahan,
          waktu_mulai_perubahan,
          waktu_selesai_perubahan,
          ms_jadwal_dokter_id,
          initial_jadwal,
          quota,
          quota_jkn,
          quota_booking,
          status_jadwal,
          hari_jadwal,
        },
        { where: { id } }
      )
      .then((hasil) => {
        res.status(200).json({ status: 200, message: "sukses" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      });
  }

  static async listPerHalaman(req, res) {
    const {
      waktu_mulai,
      waktu_selesai,
      ms_poliklinik_id,
      ms_dokter_id,
      ms_jenis_layanan_id,
      halaman,
      jumlah,
    } = req.body;

    try {
      let isi = "";
      let offset = (+halaman - 1) * jumlah;

      if (waktu_mulai) {
        isi += `and jd.waktu_mulai >= '${waktu_mulai}'`;
      }
      if (waktu_selesai) {
        isi += `and jd.waktu_selesai <= '${waktu_selesai}'`;
      }
      if (ms_poliklinik_id) {
        isi += `and jd.ms_poliklinik_id ='${ms_poliklinik_id}'`;
      }
      if (ms_dokter_id) {
        isi += `and jd.ms_dokter_id='${ms_dokter_id}'`;
      }
      if (ms_jenis_layanan_id) {
        isi += `and jd.ms_jenis_layanan_id ='${ms_jenis_layanan_id}'`;
      }

      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,* from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id 
            where jd."deletedAt" isnull ${isi} order by date(jd.tgl_jadwal) desc limit ${jumlah} offset ${offset}`,
        s
      );

      let jml = await sq.query(
        `select count (*) as total from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id 
            where jd."deletedAt" isnull ${isi}`,
        s
      );

      res
        .status(200)
        .json({
          status: 200,
          message: "sukses",
          data,
          count: jml[0].total,
          jumlah,
          halaman,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static delete(req, res) {
    const { id } = req.body;
    jadwalDokter
      .destroy({ where: { id } })
      .then((hasil) => {
        res.status(200).json({ status: 200, message: "sukses" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      });
  }

  static async listJadwalDokterByMsPoliId(req, res) {
    const { ms_poliklinik_id, tanggal } = req.body;

    try {
      let isi = "";
      if (tanggal) {
        isi += ` and date(jd.tgl_jadwal) = '${tanggal}'`;
      }

      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,jd.*,md.*,mp.nama_poliklinik,mp.kode_poliklinik,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge,ms.nama_specialist,ms.kode_specialist  
            from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id
            left join ms_specialist ms on ms.id = md.ms_specialist_id 
            where jd."deletedAt" isnull and jd.ms_poliklinik_id = '${ms_poliklinik_id}'${isi}`,
        s
      );

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static async listKuotaJadwalDokterByMsPoliId(req, res) {
    const { ms_poliklinik_id, tanggal } = req.body;

    try {
      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,jd.*,md.nama_dokter,md.jk_dokter,md.no_hp_dokter,md.ms_specialist_id,md.kj_bpjs,
            mp.nama_poliklinik,mp.kode_poliklinik,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge,ms.nama_specialist,ms.kode_specialist  
            from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id
            left join ms_specialist ms on ms.id = md.ms_specialist_id 
            where jd."deletedAt" isnull and jd.ms_poliklinik_id = '${ms_poliklinik_id}' and date(jd.tgl_jadwal) = '${tanggal}'`,
        s
      );
      let booking = await sq.query(
        `select b.jadwal_dokter_id, count(*) filter (where b.flag_layanan = 0) as umum, count(*) filter (where b.flag_layanan = 1) as bpjs
            from booking b 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id
            where b."deletedAt" isnull and jd.ms_poliklinik_id = '${ms_poliklinik_id}' and date(b.tgl_booking) = '${tanggal}'
            group by b.jadwal_dokter_id`,
        s
      );
      let antrian = await sq.query(
        `select al.jadwal_dokter_id, count(*) filter(where r.ms_asuransi_id isnull) as umum, count(*) filter (where r.ms_asuransi_id notnull) as bpjs
            from antrian_list al 
            join registrasi r on r.id = al.registrasi_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            where al."deletedAt" isnull and al.poli_layanan = 2 and mjl.kode_jenis_layanan = 'RAJAL'
            and al.status_antrian > 0  and al.booking_id isnull 
            and jd.ms_poliklinik_id = '${ms_poliklinik_id}' and date(al.tgl_antrian) = '${tanggal}'
            group by al.jadwal_dokter_id`,
        s
      );

      for (let i = 0; i < data.length; i++) {
        data[i].online_bpjs = 0;
        data[i].online_umum = 0;
        data[i].offline_bpjs = 0;
        data[i].offline_umum = 0;
        for (let j = 0; j < booking.length; j++) {
          if (data[i].jadwal_dokter_id == booking[j].jadwal_dokter_id) {
            data[i].online_bpjs = +booking[j].bpjs;
            data[i].online_umum = +booking[j].umum;
          }
        }
        for (let j = 0; j < antrian.length; j++) {
          if (data[i].jadwal_dokter_id == antrian[j].jadwal_dokter_id) {
            data[i].offline_bpjs = +antrian[j].bpjs;
            data[i].offline_umum = +antrian[j].umum;
          }
        }
      }

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static async listKuotaJadwalDokterByMsDokterId(req, res) {
    const { ms_dokter_id, tanggal } = req.body;

    try {
      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,jd.*,md.nama_dokter,md.jk_dokter,md.no_hp_dokter,md.ms_specialist_id,md.kj_bpjs,
            mp.nama_poliklinik,mp.kode_poliklinik,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge,ms.nama_specialist,ms.kode_specialist  
            from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id
            left join ms_specialist ms on ms.id = md.ms_specialist_id 
            where jd."deletedAt" isnull and jd.ms_dokter_id = '${ms_dokter_id}' and date(jd.tgl_jadwal) = '${tanggal}'`,
        s
      );
      let booking = await sq.query(
        `select b.jadwal_dokter_id, count(*) filter (where b.flag_layanan = 0) as umum, count(*) filter (where b.flag_layanan = 1) as bpjs
            from booking b 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id
            where b."deletedAt" isnull and jd.ms_dokter_id = '${ms_dokter_id}' and date(b.tgl_booking) = '${tanggal}'
            group by b.jadwal_dokter_id`,
        s
      );
      let antrian = await sq.query(
        `select al.jadwal_dokter_id, count(*) filter(where r.ms_asuransi_id isnull) as umum, count(*) filter (where r.ms_asuransi_id notnull) as bpjs
            from antrian_list al 
            join registrasi r on r.id = al.registrasi_id
            join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            where al."deletedAt" isnull and al.poli_layanan = 2 and mjl.kode_jenis_layanan = 'RAJAL'
            and al.status_antrian > 0  and al.booking_id isnull 
            and jd.ms_dokter_id = '${ms_dokter_id}' and date(al.tgl_antrian) = '${tanggal}'
            group by al.jadwal_dokter_id`,
        s
      );

      for (let i = 0; i < data.length; i++) {
        data[i].online_bpjs = 0;
        data[i].online_umum = 0;
        data[i].offline_bpjs = 0;
        data[i].offline_umum = 0;
        for (let j = 0; j < booking.length; j++) {
          if (data[i].jadwal_dokter_id == booking[j].jadwal_dokter_id) {
            data[i].online_bpjs = +booking[j].bpjs;
            data[i].online_umum = +booking[j].umum;
          }
        }
        for (let j = 0; j < antrian.length; j++) {
          if (data[i].jadwal_dokter_id == antrian[j].jadwal_dokter_id) {
            data[i].offline_bpjs = +antrian[j].bpjs;
            data[i].offline_umum = +antrian[j].umum;
          }
        }
      }

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static async listJadwalDokterByMsDokterId(req, res) {
    const { ms_dokter_id, tanggal } = req.body;

    try {
      let isi = "";
      if (tanggal) {
        isi += ` and date(jd.tgl_jadwal) = '${tanggal}'`;
      }

      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,jd.*,md.*,mp.nama_poliklinik,mp.kode_poliklinik,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge,ms.nama_specialist,ms.kode_specialist  
            from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id
            left join ms_specialist ms on ms.id = md.ms_specialist_id 
            where jd."deletedAt" isnull and jd.ms_dokter_id = '${ms_dokter_id}'${isi}`,
        s
      );

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static async list(req, res) {
    const {
      halaman,
      jumlah,
      waktu_mulai,
      waktu_selesai,
      ms_poliklinik_id,
      ms_dokter_id,
      ms_jenis_layanan_id,
      hari_jadwal,
      tgl_jadwal,
    } = req.body;

    try {
      let isi = "";
      let offset = "";
      let pagination = "";

      if (halaman && jumlah) {
        offset = (+halaman - 1) * jumlah;
        pagination = `limit ${jumlah} offset ${offset}`;
      }

      if (tgl_jadwal) {
        isi += `and jd.tgl_jadwal::DATE = '${tgl_jadwal}'`;
      }
      if (waktu_mulai) {
        isi += `and jd.waktu_mulai >= '${waktu_mulai}'`;
      }
      if (waktu_selesai) {
        isi += `and jd.waktu_selesai <= '${waktu_selesai}'`;
      }
      if (ms_poliklinik_id) {
        isi += `and jd.ms_poliklinik_id ='${ms_poliklinik_id}'`;
      }
      if (ms_dokter_id) {
        isi += `and jd.ms_dokter_id='${ms_dokter_id}'`;
      }
      if (ms_jenis_layanan_id) {
        isi += `and jd.ms_jenis_layanan_id ='${ms_jenis_layanan_id}'`;
      }
      if (hari_jadwal) {
        isi += `and jd.hari_jadwal ilike '${hari_jadwal}'`;
      }

      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,* from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id 
            where jd."deletedAt" isnull ${isi} order by date(jd.tgl_jadwal) desc ${pagination}`,
        s
      );
      let jml = await sq.query(
        `select count (*) as total from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id 
            where jd."deletedAt" isnull ${isi}`,
        s
      );

      res
        .status(200)
        .json({
          status: 200,
          message: "sukses",
          data,
          count: jml[0].total,
          jumlah,
          halaman,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async detailsById(req, res) {
    const { id } = req.body;

    try {
      let data = await sq.query(
        `select jd.id as jadwal_dokter_id,* from jadwal_dokter jd 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_jenis_layanan mjl on mjl.id = jd.ms_jenis_layanan_id 
            where jd."deletedAt" isnull and jd.id = '${id}'`,
        s
      );

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
}

module.exports = Controller;
