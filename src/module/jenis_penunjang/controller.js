const jenis_penunjang = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { nama_jenis_penunjang,status_jenis_penunjang,keterangan_jenis_penunjang } = req.body;

        try {
            let cek_nama = await jenis_penunjang.findAll({where: {
                [Op.or]: [
                  { nama_jenis_penunjang }
                ]
              }})
            if (cek_nama.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" })
            } else {
             let data= await jenis_penunjang.create({id:uuid_v4(),nama_jenis_penunjang,status_jenis_penunjang,keterangan_jenis_penunjang })
              res.status(200).json({ status: 200, message: "sukses",data })
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { nama_jenis_penunjang,status_jenis_penunjang,id,keterangan_jenis_penunjang } = req.body;

      try {
          let cek_nama = await sq.query(`select * from jenis_penunjang md where md."deletedAt" isnull  and md.id !='${id}' and md.nama_jenis_penunjang = '${nama_jenis_penunjang}' `,s)
          // console.log(cek_nama);
          if (cek_nama.length) {
              res.status(201).json({ status: 204, message: "data sudah ada" })
          } else {
            await jenis_penunjang.update({nama_jenis_penunjang,status_jenis_penunjang,keterangan_jenis_penunjang},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
          }
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req,res){
      const{id}=req.body

      try {
        let data = await jenis_penunjang.findAll({where:{id}})
        res.status(200).json({ status: 200, message: "sukses",data })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }

     
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
       await jenis_penunjang.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,status_jenis_penunjang}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and sjp.id = '${id}' `
        }
        if(status_jenis_penunjang){
          isi+= ` and sjp.status_jenis_penunjang = '${status_jenis_penunjang}' `
        }

        let data = await sq.query(`select * from jenis_penunjang sjp where sjp."deletedAt" isnull  ${isi} order by sjp."createdAt" desc ${pagination}`,s)
        res.status(200).json({ status: 200, message: "sukses" ,data})
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller