const diagnosaKeperawatan = require('./model');
const { v4: uuidv4 } = require('uuid');
const { QueryTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const s = { type: QueryTypes.SELECT }

class Controller {

    static register(req, res) {
        const { kode_diagnosa, nama_diagnosa } = req.body
        diagnosaKeperawatan.create({ id: uuidv4(), kode_diagnosa, nama_diagnosa }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, kode_diagnosa, nama_diagnosa } = req.body
        diagnosaKeperawatan.update({ kode_diagnosa, nama_diagnosa }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
      const{halaman,jumlah,id,kode_diagnosa,nama_diagnosa,search}=req.body

      try {
        let isi = ''
        let offset=''
        let pagination=''
  
        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }

        if(id){
          isi+= ` and dk.id = '${id}'`
        }
        if(kode_diagnosa){
          isi+= ` and dk.kode_diagnosa ilike '${kode_diagnosa}'`
        }
        if(nama_diagnosa){
          isi+= ` and dk.nama_diagnosa ilike '%${nama_diagnosa}%'`
        }
        if(search) {
          isi += ` and dk.kode_diagnosa ilike '%${search}%' or dk.nama_diagnosa ilike '%${search}%' `
        }

        let data = await sq.query(`select * from diagnosa_keperawatan dk where dk."deletedAt" isnull${isi} order by dk.nama_diagnosa ${pagination}`,s)
        let jml=await sq.query(`select count(*) from diagnosa_keperawatan dk where dk."deletedAt" isnull${isi}`,s)

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    }

    static async detailsById(req, res) {
        const { id } = req.body;
        try {
            let data = await sq.query(`select * from diagnosa_keperawatan d where d."deletedAt" isnull and d.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        diagnosaKeperawatan.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }
        ).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
}

module.exports = Controller