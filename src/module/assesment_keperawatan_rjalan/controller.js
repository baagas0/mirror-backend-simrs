const assesment_keperawatan_jalan = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { is_validasi,json_assesment_keperawatan_rjalan,registrasi_id} = req.body;

        try {
            // console.log(req.dataUsers);
        
            let data= await assesment_keperawatan_jalan.create({id:uuid_v4(),is_validasi,json_assesment_keperawatan_rjalan,created_by:req.dataUsers.id,created_name:req.dataUsers.username,registrasi_id})
            res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,is_validasi,json_assesment_keperawatan_rjalan,registrasi_id } = req.body;
    //   console.log(req.body);

      try {
         let data = await assesment_keperawatan_jalan.update({is_validasi,json_assesment_keperawatan_rjalan,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username,registrasi_id},{where:{
            id
         }})
         res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
       await assesment_keperawatan_jalan.destroy({where:{id}})
       await assesment_keperawatan_jalan.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{
        id
     }})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,registrasi_id}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and akj.id = '${id}' `
        }

        if(registrasi_id){
          isi+= ` and akj.registrasi_id = '${registrasi_id}' `
        }

        let data = await sq.query(`select * from assesment_keperawatan_rjalan akj where akj."deletedAt" isnull  ${isi} order by akj."createdAt" desc ${pagination}`,s)
        res.status(200).json({ status: 200, message: "sukses" ,data})
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async detailsById(req,res){
        const {id}=req.params

        try {
            let data = await sq.query(`select * from assesment_keperawatan_rjalan akj where akj."deletedAt" isnull and akj.id='${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (error) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller