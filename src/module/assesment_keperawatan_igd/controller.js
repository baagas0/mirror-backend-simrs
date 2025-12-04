const assesment_keperawatan_igd = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { is_validasi,tipe_diagnosa, judul_diagnosa,json_assesment_keperawatan_igd,registrasi_id,ms_diagnosa_id } = req.body;

        try {
        
             let data= await assesment_keperawatan_igd.create({id:uuid_v4(),is_validasi,tipe_diagnosa, judul_diagnosa,json_assesment_keperawatan_igd,registrasi_id,ms_diagnosa_id,created_by:req.dataUsers.id,created_name:req.dataUsers.username}, {logging: console.log})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,is_validasi,tipe_diagnosa, judul_diagnosa,json_assesment_keperawatan_igd,registrasi_id,ms_diagnosa_id } = req.body;

      try {
         let data = await assesment_keperawatan_igd.update({is_validasi,tipe_diagnosa, judul_diagnosa,json_assesment_keperawatan_igd,registrasi_id,ms_diagnosa_id,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username},{where:{
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
       await assesment_keperawatan_igd.destroy({where:{id}})
       await assesment_keperawatan_igd.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{
        id
     }})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req,res){
      const{id}=req.body
      try {
        let data = await sq.query(`select aki.id as assesment_keperawatan_igd_id,* from assesment_keperawatan_igd aki 
        left join ms_diagnosa md on md.id = aki.ms_diagnosa_id 
        join registrasi r on r.id = aki.registrasi_id 
        join pasien p on p.id = r.pasien_id 
        where aki."deletedAt" isnull and aki.id = '${id}' `,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
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
          isi+= ` and aki.id = '${id}' `
        }

        if(registrasi_id){
          isi+= ` and aki.registrasi_id = '${registrasi_id}' `
        }

        let data = await sq.query(`select aki.id as assesment_keperawatan_igd_id,* from assesment_keperawatan_igd aki 
        left join ms_diagnosa md on md.id = aki.ms_diagnosa_id 
        join registrasi r on r.id = aki.registrasi_id 
        join pasien p on p.id = r.pasien_id 
        where aki."deletedAt" isnull  ${isi} order by aki."createdAt" desc ${pagination}`,s)

        let jml = await sq.query(`select count(*) from assesment_keperawatan_igd aki 
        left join ms_diagnosa md on md.id = aki.ms_diagnosa_id 
        join registrasi r on r.id = aki.registrasi_id 
        join pasien p on p.id = r.pasien_id 
        where aki."deletedAt" isnull  ${isi}`,s)
        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller