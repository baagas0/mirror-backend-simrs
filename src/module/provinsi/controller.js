const provinsi = require('./model');
const { sq } = require("../../config/connection");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {
  static register(req, res) {
    const { id, nama_provinsi } = req.body;
    provinsi.findAll({ where: { id: id, nama_provinsi: nama_provinsi } }).then(async data => {
      if (data.length) {
        res.status(200).json({ status: 200, message: "data sudah ada" });
      } else {
        await provinsi.create({ id, nama_provinsi }).then((data) => {
          res.status(200).json({ status: 200, message: "sukses" });
        })
      }
    }).catch((err) => {
        res.status(500).json({ status: 500, message: "gagal", data: err });
      });
  }

  static update(req, res) {
    const { id, nama_provinsi } = req.body;

    provinsi.update({ nama_provinsi }, { where: { id }, returning: true }).then((data) => {
        res.status(200).json({ status: 200, message: "sukses", data: data[1] });
      }).catch((err) => {
        res.status(500).json({ status: 500, message: "gagal", data: err });
      });
  }

  static delete(req, res) {
    const { id } = req.body
    
    provinsi.destroy({ where: { id: id } }).then(data => {
      res.status(200).json({ status: 200, message: "sukses" })
    }).catch(err => {
      res.status(500).json({ status: 500, message: "gagal", data: err })
    })
  }
  
  static async list(req, res) {
    const{halaman,jumlah,nama_provinsi,search} = req.body
    console.log(req.body);

    try {
        let isi = ''
        let offset=''
        let pagination=''

        if(halaman && jumlah){
            offset = (+halaman -1) * jumlah;
            pagination=`limit ${jumlah} offset ${offset}`
        }

        if(nama_provinsi){
          isi+= ` and p.nama_provinsi ilike '%${nama_provinsi}%'`
        }

        if(search){
          isi+= ` and p.nama_provinsi ilike '%${search}%'`
        }

        let data = await sq.query(`select * from provinsi p where p."deletedAt" isnull${isi} order by p.nama_provinsi ${pagination}`,s);
        let jml = await sq.query(`select count(*) from provinsi p where p."deletedAt" isnull${isi}`,s);

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman });
    } catch (err) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
    }
}

  static detailsById(req, res) {
    const { id } = req.body;

    provinsi.findAll({ where: { id: id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data: data });
    }).catch((err) => {
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }
}

module.exports = Controller;