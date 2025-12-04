const kelurahan = require('./model');
const { sq } = require("../../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
  static register(req, res) {
    const { id, nama_kelurahan, kecamatan_id } = req.body;
    kelurahan.findAll({ where: { id, nama_kelurahan } }).then(async (data) => {
      if (data.length) {
        res.status(200).json({ status: 200, message: "data sudah ada" });
      } else {
        await kelurahan.create({ id, nama_kelurahan, kecamatan_id }).then((data2) => {
          res.status(200).json({ status: 200, message: "sukses" });
        })
      }
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static async list(req, res) {
    const{halaman,jumlah,kecamatan_id,kota_id,nama_kelurahan,nama_kecamatan,search} = req.body

    try {
        let isi = ''
        let offset=''
        let pagination=''

        if(halaman && jumlah){
            offset = (+halaman -1) * jumlah;
            pagination=`limit ${jumlah} offset ${offset}`
        }

        if(nama_kelurahan){
            isi+= ` and k.nama_kelurahan ilike '%${nama_kelurahan}%'`
        }
        if(kecamatan_id){
          isi+= ` and k.kecamatan_id = '${kecamatan_id}'`
        }
        if(nama_kecamatan){
            isi+= ` and k2.nama_kecamatan ilike '%${nama_kecamatan}%'`
        }
        if(kota_id){
            isi+= ` and k2.kota_id = '${kota_id}'`
        }

        if(search){
          isi+= ` and k.nama_kelurahan ilike '%${search}%'`
        }

        let data = await sq.query(`select k.id as "kelurahan_id", k.*,k2.nama_kecamatan,k2.kota_id from kelurahan k join kecamatan k2 on k2.id = k.kecamatan_id where k."deletedAt" isnull and k2."deletedAt" isnull${isi} order by k.nama_kelurahan ${pagination}`,s);
        let jml = await sq.query(`select count(*) from kelurahan k join kecamatan k2 on k2.id = k.kecamatan_id where k."deletedAt" isnull and k2."deletedAt" isnull${isi}`,s);

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
      let data = await sq.query(`select k.id as "kelurahan_id", * from kelurahan k join kecamatan k2 on k2.id = k.kecamatan_id where k."deletedAt" isnull and k2."deletedAt" isnull and k.id = '${id}'`, s)
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }
  }

  static async listByKecamatanId(req, res) {
    const { kecamatan_id } = req.body
    try {
      let data = await sq.query(`select k.id as "kelurahan_id", * from kelurahan k join kecamatan k2 on k2.id = k.kecamatan_id where k."deletedAt" isnull and k2."deletedAt" isnull and k.kecamatan_id = '${kecamatan_id}' order by k.nama_kelurahan`, s);
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error })
    }
  }

  static update(req, res) {
    const { id, nama_kelurahan, kecamatan_id } = req.body;
    kelurahan.update({ nama_kelurahan, kecamatan_id }, { where: { id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data: data[1] });
    }).catch((err) => {
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body
    kelurahan.destroy({ where: { id: id } }).then(data => {
      res.status(200).json({ status: 200, message: "sukses" })
    }).catch(err => {
      res.status(500).json({ status: 500, message: "gagal", data: err })
    })
  }
}

module.exports = Controller;