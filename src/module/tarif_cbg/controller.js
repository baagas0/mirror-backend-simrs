const tarif_cbg = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { kode_bridge,nama_tarif_cbg,status_tarif_cbg,keterangan_tarif_cbg } = req.body;

        try {
            let cek_nama = await tarif_cbg.findAll({where: {
                [Op.or]: [
                  {kode_bridge}
                ]
              }})
            if (cek_nama.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" })
            } else {
             let data= await tarif_cbg.create({id:uuid_v4(),kode_bridge,nama_tarif_cbg,status_tarif_cbg,keterangan_tarif_cbg })
              res.status(200).json({ status: 200, message: "sukses",data })
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,kode_bridge,nama_tarif_cbg,status_tarif_cbg,keterangan_tarif_cbg } = req.body;

      try {
          let cek_nama = await sq.query(`select * from tarif_cbg md where md."deletedAt" isnull  and md.id !='${id}' and (md.nama_tarif_cbg = '${nama_tarif_cbg}' or md.kode_bridge= '${kode_bridge}') `,s)
          // console.log(cek_nama);
          if (cek_nama.length) {
              res.status(201).json({ status: 204, message: "data sudah ada" })
          } else {
            await tarif_cbg.update({kode_bridge,nama_tarif_cbg,status_tarif_cbg,keterangan_tarif_cbg},{where:{id}})
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
       await tarif_cbg.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,kode_bridge,nama_tarif_cbg,status_tarif_cbg}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }



      try {

        if(id){
          isi+= ` and tc.id = '${id}' `
        }
        if(kode_bridge){
            isi+=` and tc.kode_bridge ilike %'${kode_bridge}'% `
        }
        if(nama_tarif_cbg){
            isi+=` and tc.nama_tarif_cbg ilike %'${nama_tarif_cbg}'% `
        }
        if(status_tarif_cbg){
            isi+= ` and tc.status_tarif_cbg = ${status_tarif_cbg} `
          }

        let data = await sq.query(`select * from tarif_cbg tc where tc."deletedAt" isnull  ${isi} order by tc."createdAt" desc ${pagination}`,s)

        let jml=await sq.query(`select count(*) from tarif_cbg tc where tc."deletedAt" isnull  ${isi}`,s)
        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async detailsById(req,res){
        const{id}=req.body
        try {
            
        let data = await sq.query(`select * from tarif_cbg tc where tc."deletedAt" isnull  and tc.id = '${id}' `,s)
        res.status(200).json({ status: 200, message: "sukses",data})
        } catch (error) {
            console.log(req.body);
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }
}

module.exports = Controller