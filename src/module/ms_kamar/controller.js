const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const msKamar = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { nama_kamar,ms_ruang_id,keterangan_kamar } = req.body

        msKamar.findAll({ where: { nama_kamar: { [Op.iLike]: nama_kamar },ms_ruang_id } }).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                msKamar.create({ id: uuid_v4(), nama_kamar,ms_ruang_id,keterangan_kamar }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data });
                }).catch(err => {
                    console.log(req.body);
                    console.log(err);
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, nama_kamar,ms_ruang_id,keterangan_kamar } = req.body

        msKamar.update({ nama_kamar,ms_ruang_id,keterangan_kamar }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        msKamar.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const{halaman,jumlah,nama_kamar,keterangan_kamar,ms_ruang_id} = req.body

      try {
        let isi = ''
        let offset=''
        let pagination=''
        if(halaman && jumlah){
            offset = (+halaman -1) * jumlah;
            pagination=`limit ${jumlah} offset ${offset}`
        }

        if(nama_kamar){
            isi+= ` and mk.nama_kamar ilike '%${nama_asuransi}%'`
        }
        if(keterangan_kamar){
            isi+= ` and mk.keterangan_kamar ilike '%${keterangan_kamar}%'`
        }
        if(ms_ruang_id){
            isi+= ` and mk.ms_ruang_id = '${ms_ruang_id}'`
        }

          let data = await sq.query(`select mk.id as ms_kamar_id,* from ms_kamar mk join ms_ruang mr on mr.id = mk.ms_ruang_id where mk."deletedAt" isnull${isi} order by mk."createdAt" desc ${pagination}`,s);
          let jml = await sq.query(`select count(*) from ms_kamar mk join ms_ruang mr on mr.id = mk.ms_ruang_id where mk."deletedAt" isnull${isi}`,s)

          res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
      } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`select mk.id as ms_kamar_id,* from ms_kamar mk join ms_ruang mr on mr.id = mk.ms_ruang_id where mk."deletedAt" isnull and mk.id ='${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;