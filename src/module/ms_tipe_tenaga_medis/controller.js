const ms_tipe_tenaga_medis = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { kode_tipe_tenaga_medis,nama_tipe_tenaga_medis,keterangan_tipe_tenaga_medis,status_tipe_tenaga_medis } = req.body;

        try {
            let cek_nama = await ms_tipe_tenaga_medis.findAll({where: {
                [Op.or]: [
                  { kode_tipe_tenaga_medis },
                  { nama_tipe_tenaga_medis }
                ]
              }})
            if (cek_nama.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" })
            } else {
             let data= await ms_tipe_tenaga_medis.create({id:uuid_v4(),kode_tipe_tenaga_medis,nama_tipe_tenaga_medis,keterangan_tipe_tenaga_medis,status_tipe_tenaga_medis })
              res.status(200).json({ status: 200, message: "sukses",data })
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,kode_tipe_tenaga_medis,nama_tipe_tenaga_medis,keterangan_tipe_tenaga_medis,status_tipe_tenaga_medis } = req.body;

      try {
          let cek_nama = await sq.query(`select * from ms_tipe_tenaga_medis md where md."deletedAt" isnull  and md.id !='${id}' and (md.kode_tipe_tenaga_medis = '${kode_tipe_tenaga_medis}' or md.nama_tipe_tenaga_medis= '${nama_tipe_tenaga_medis}') `,s)
          // console.log(cek_nama);
          if (cek_nama.length) {
              res.status(201).json({ status: 204, message: "data sudah ada" })
          } else {
            await ms_tipe_tenaga_medis.update({kode_tipe_tenaga_medis,nama_tipe_tenaga_medis,keterangan_tipe_tenaga_medis,status_tipe_tenaga_medis},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
          }
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
       await ms_tipe_tenaga_medis.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,kode_tipe_tenaga_medis,status_tipe_tenaga_medis}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }



      try {

        if(id){
          isi+= ` and md.id = '${id}' `
        }
        if(kode_tipe_tenaga_medis){
            isi+= ` and md.kode_tipe_tenaga_medis = '${kode_tipe_tenaga_medis}' `
          }
        if(status_tipe_tenaga_medis){
            isi+= ` and md.status_tipe_tenaga_medis = '${status_tipe_tenaga_medis}' `
          }

        let data = await sq.query(`select * from ms_tipe_tenaga_medis md where md."deletedAt" isnull  ${isi} order by md."createdAt" desc ${pagination}`,s)

        let jml=await sq.query(`select count(*) from ms_tipe_tenaga_medis md where md."deletedAt" isnull  ${isi}`,s)
        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async detailsById(req, res) {
      const{id}=req.body

      try {
        let data = await sq.query(`select * from ms_tipe_tenaga_medis md where md."deletedAt" isnull and md.id = '${id}'`,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller