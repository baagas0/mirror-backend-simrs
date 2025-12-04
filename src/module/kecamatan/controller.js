const kecamatan = require('./model');
const { sq } = require("../../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
  static register(req, res) {
    const { id, nama_kecamatan, kota_id } = req.body;
    kecamatan.findAll({ where: { id, nama_kecamatan } }).then(async (data) => {
      if (data.length) {
        res.status(200).json({ status: 200, message: "data sudah ada" });
      } else {
        await kecamatan.create({ id, nama_kecamatan, kota_id }).then((data2) => {
          res.status(200).json({ status: 200, message: "sukses" });
        })
      }
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static async list(req, res) {
    try {
      let data = await sq.query(`select k.id as "kecamatan_id", * from kecamatan k join kota k2 on k2.id = k.kota_id where k."deletedAt" isnull and k2."deletedAt" isnull order by k.nama_kecamatan `, s)
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }
  }

  static async list(req, res) {
    const{halaman,jumlah,provinsi_id,nama_kecamatan,kota_id,nama_kota,search} = req.body

    try {
        let isi = ''
        let offset=''
        let pagination=''

        if(halaman && jumlah){
            offset = (+halaman -1) * jumlah;
            pagination=`limit ${jumlah} offset ${offset}`
        }

        if(nama_kecamatan){
            isi+= ` and k.nama_kecamatan ilike '%${nama_kecamatan}%'`
        }
        if(kota_id){
            isi+= ` and k.kota_id = '${kota_id}'`
        }
        if(nama_kota){
          isi+= ` and k2.nama_kota ilike '%${nama_kota}%'`
        }
        if(provinsi_id){
            isi+= `  and k2.provinsi_id ='${provinsi_id}'`
        }

        if(search){
          isi+= ` and k.nama_kecamatan ilike '%${search}%'`
        }

        let data = await sq.query(`select k.id as "kecamatan_id",k.*,k2.nama_kota,k2.provinsi_id from kecamatan k join kota k2 on k2.id = k.kota_id where k."deletedAt" isnull and k2."deletedAt" isnull${isi} order by k.nama_kecamatan ${pagination}`,s);
        let jml = await sq.query(`select count(*) from kecamatan k join kota k2 on k2.id = k.kota_id where k."deletedAt" isnull and k2."deletedAt" isnull${isi}`,s);

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman });
    } catch (err) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
    }
}

  static async detailsById(req, res) {
    const { id } = req.body;
    try {
      let data = await sq.query(`select k.id as "kecamatan_id",k.*,k2.nama_kota,k2.provinsi_id from kecamatan k join kota k2 on k2.id = k.kota_id where k."deletedAt" isnull and k2."deletedAt" isnull and k.id = '${id}'`, s)
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }
  }

  static async listByKotaId(req, res) {
    const { kota_id } = req.body
    try {
      let data = await sq.query(`select k.id as "kecamatan_id",k.*,k2.nama_kota,k2.provinsi_id from kecamatan k join kota k2 on k2.id = k.kota_id where k."deletedAt" isnull and k2."deletedAt" isnull and k.kota_id = '${kota_id}' order by k.nama_kecamatan`, s);
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }
  }

  static update(req, res) {
    const { id, nama_kecamatan, kota_id } = req.body;
    kecamatan.update({ nama_kecamatan, kota_id }, { where: { id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data: data[1] });
    }).catch((err) => {
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body
    kecamatan.destroy({ where: { id: id } }).then(data => {
      res.status(200).json({ status: 200, message: "sukses" })
    }).catch(err => {
      res.status(500).json({ status: 500, message: "gagal", data: err })
    })
  }
}

module.exports = Controller;