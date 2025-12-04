const triage = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }


class Controller {

  static register(req, res) {
    const { nama, nik, tgl_lahir, asesmen, is_registrasi } = req.body
    triage.create({ id: uuid_v4(), nama, nik, tgl_lahir, asesmen, is_registrasi }).then(hasil => {
      res.status(200).json({ status: 200, message: "sukses", data: hasil })
    }).catch(error => {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    })
  }

  static update(req, res) {
    const { id, nama, nik, tgl_lahir, asesmen, is_registrasi } = req.body
    triage.update({ nama, nik, tgl_lahir, asesmen, is_registrasi }, { where: { id } }).then(hasil => {
      res.status(200).json({ status: 200, message: "sukses" })
    }).catch(error => {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    })
  }

  static async list(req, res) {
    const { halaman, jumlah, id, registrasi_id, pasien_id, is_registrasi, nama, nik, search,tanggal_awal,tanggal_akhir } = req.body
    let isi = ''
    let offset = ''
    let pagination = ''

    if (halaman && jumlah) {
      offset = (+halaman - 1) * jumlah;
      pagination = `limit ${jumlah} offset ${offset}`
    }

    try {

      if (id) {
        isi += ` and t.id = '${id}' `
      }
      if (is_registrasi != undefined) {
        isi += ` and t.is_registrasi = '${is_registrasi}' `
      }
      if (nama) {
        isi += ` and t.nama ilike '%${nama}%' `
      }
      if (nik) {
        isi += ` and t.nik ilike '%${nik}%' `
      }
      if (search) {
        isi += ` and (t.nama ilike '%${search}%' or t.nik ilike '%${search}%') `
      }
      if (tanggal_awal) {
        isi += ` and t."createdAt"::date >= '${tanggal_awal}' `
      }
      if (tanggal_akhir) {
          isi += ` and t."createdAt"::date <= '${tanggal_akhir}'`
      }

      if (pasien_id) {
        let pasien  = await sq.query(`select * from pasien where id ='${pasien_id}'`, s);

        if(pasien.length) isi += ` and t.nik = '${pasien[0].nik}' `
      }
      // console.log(`select * from triage t where t."deletedAt" isnull ${isi} order by t."createdAt" desc ${pagination}`)
      let data = await sq.query(`select * from triage t where t."deletedAt" isnull ${isi} order by t."createdAt" desc ${pagination}`, s)
      let jml = await sq.query(`select count(*) from triage t where t."deletedAt" isnull ${isi}`, s)
      // console.log(data);
      res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, jumlah, halaman })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }

  }

  static async detailsById(req, res) {
    const { id } = req.body;
    try {
      let data = await sq.query(`select * from triage t where t."deletedAt" isnull and t.id = '${id}'`, s)
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (error) {
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }

  }

  static delete(req, res) {
    const { id } = req.body
    triage.destroy({ where: { id } }).then(hasil => {
      res.status(200).json({ status: 200, message: "sukses" })
    }).catch(error => {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    })
  }

  static listWithParam(req, res) {
    const { is_registrasi } = req.body
    let param = {};
    if (is_registrasi != undefined) {
      param.is_registrasi = is_registrasi
    }
    triage.findAll({ where: param }).then(data => {
      res.status(200).json({ status: 200, message: "sukses", data })
    }).catch(error => {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    })
  }

}

module.exports = Controller