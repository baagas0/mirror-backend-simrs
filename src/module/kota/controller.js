const kota = require('./model');
const { sq } = require("../../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
  static register(req, res) {
    const { id, nama_kota, provinsi_id } = req.body;
    // console.log(req.body);
    kota.findAll({ where: { id: id, nama_kota: nama_kota } }).then(async data => {
      if (data.length) {
        res.status(200).json({ status: 200, message: "data sudah ada" });
      } else {
        await kota.create({ id, nama_kota, provinsi_id }).then((data2) => {
          res.status(200).json({ status: 200, message: "sukses" });
        })
      }
    }).catch((err) => {
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static update(req, res) {
    const { id, nama_kota, provinsi_id } = req.body;

    kota.update({ nama_kota, provinsi_id }, { where: { id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data: data[1] });
    }).catch((err) => {
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body

    kota.destroy({ where: { id: id } }).then(data => {
      res.status(200).json({ status: 200, message: "sukses" })
    }).catch(err => {
      res.status(500).json({ status: 500, message: "gagal", data: err })
    })
  }

  static async list(req, res) {
    const{halaman,jumlah,provinsi_id,nama_kota,search} = req.body

    try {
        let isi = ''
        let offset=''
        let pagination=''

        if(halaman && jumlah){
            offset = (+halaman -1) * jumlah;
            pagination=`limit ${jumlah} offset ${offset}`
        }

        if(nama_kota){
            isi+= ` and k.nama_kota ilike '%${nama_kota}%'`
        }
        if(provinsi_id){
            isi+= `  and k.provinsi_id ='${provinsi_id}'`
        }

        if(search){
          isi+= ` and k.nama_kota ilike '%${search}%'`
        }

        let data = await sq.query(`select k.id as kota_id,k.*,p.nama_provinsi from kota k join provinsi p on p.id = k.provinsi_id where k."deletedAt" isnull${isi} order by nama_kota ${pagination}`,s);
        let jml = await sq.query(`select count(*) from kota k join provinsi p on p.id = k.provinsi_id where k."deletedAt" isnull${isi}`,s);

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
      let data = await sq.query(`select k.id as kota_id,* from kota k join provinsi p on p.id = k.provinsi_id where k."deletedAt" isnull and k.id = '${id}'`, s);

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static async listByProvinsiId(req, res) {
    const { provinsi_id } = req.body;
    try {
      let data = await sq.query(`select k.id as kota_id,* from kota k join provinsi p on p.id = k.provinsi_id where k."deletedAt" isnull and k.provinsi_id ='${provinsi_id}' order by nama_kota`, s);

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }
}

module.exports = Controller;