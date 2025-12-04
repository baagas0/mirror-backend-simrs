const casemix_resume_medis_ranap = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { validasi_dokter,json_casemix_resume_medis_ranap,registrasi_id, tanggal, nama_tenaga_medis, ms_tipe_tenaga_medis_id, ms_dokter_id } = req.body;

        try {
        
             let data= await casemix_resume_medis_ranap.create({id:uuid_v4(),validasi_dokter,json_casemix_resume_medis_ranap,registrasi_id, tanggal, nama_tenaga_medis, ms_tipe_tenaga_medis_id, ms_dokter_id})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,validasi_casemix,json_casemix_resume_medis_ranap,registrasi_id, tanggal, nama_tenaga_medis, ms_tipe_tenaga_medis_id, ms_dokter_id } = req.body;


      try {
         let data = casemix_resume_medis_ranap.update({validasi_casemix,json_casemix_resume_medis_ranap,registrasi_id, tanggal, nama_tenaga_medis, ms_tipe_tenaga_medis_id, ms_dokter_id},{where:{
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
       await casemix_resume_medis_ranap.destroy({where:{id}})
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
          isi+= ` and rmi.id = '${id}' `
        }
        if(registrasi_id){
          isi+= ` and rmi.registrasi_id = '${registrasi_id}' `
        }

        let data = await sq.query(`
          select 
            rmi.id as casemix_resume_medis_ranap_id, * 

          from casemix_resume_medis_ranap rmi
            join registrasi r on r.id = rmi.registrasi_id 
            join ms_dokter md on md.id = rmi.ms_dokter_id 
            left join ms_tipe_tenaga_medis mtm on mtm.id = rmi.ms_tipe_tenaga_medis_id 

          where rmi."deletedAt" isnull  ${isi} order by rmi."createdAt" desc ${pagination}
        `,s)


        let jml = await sq.query(`select count(*) from casemix_resume_medis_ranap rmi
        join registrasi r on r.id = rmi.registrasi_id 
        where rmi."deletedAt" isnull  ${isi} `)
        
        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async detailsById(req,res){

      const {id}=req.body

      try {
        let data = await sq.query(`select rmi.id as casemix_resume_medis_ranap_id,* from casemix_resume_medis_ranap rmi
        join registrasi r on r.id = rmi.registrasi_id 
        where rmi."deletedAt" isnull  and rmi.id = '${id}'`,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    }
}

module.exports = Controller