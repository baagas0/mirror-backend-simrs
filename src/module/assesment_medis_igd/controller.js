const assesment_medis_igd = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { judul_diagnosa,json_assesment_medis_igd,registrasi_id,is_validasi } = req.body;

        try {
        
             let data= await assesment_medis_igd.create({id:uuid_v4(),judul_diagnosa,json_assesment_medis_igd,registrasi_id,is_validasi})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,judul_diagnosa,json_assesment_medis_igd,registrasi_id,is_validasi } = req.body;

      try {
         let data = await assesment_medis_igd.update({judul_diagnosa,json_assesment_medis_igd,registrasi_id,is_validasi},{where:{
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
       await assesment_medis_igd.destroy({where:{id}})
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
          isi+= ` and ami.id = '${id}' `
        }
        if(registrasi_id){
          isi+= ` and ami.registrasi_id = '${registrasi_id}' `
        }

        let data = await sq.query(`select ami.id as assesment_medis_igd_id,* from assesment_medis_igd ami 
        join registrasi r on r.id = ami.registrasi_id 
        where ami."deletedAt" isnull  ${isi} order by ami."createdAt" desc ${pagination}`,s)

        let jml = await sq.query(`select count(*) from assesment_medis_igd ami 
        join registrasi r on r.id = ami.registrasi_id 
        where ami."deletedAt" isnull  ${isi}`,s)

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async details_by_id(req, res) {
      const{id}=req.body


      try {


        let data = await sq.query(`select ami.id as assesment_medis_igd_id,* from assesment_medis_igd ami 
        join registrasi r on r.id = ami.registrasi_id 
        where ami."deletedAt" isnull and ami.id = '${id}' order by ami."createdAt" desc`,s)
        res.status(200).json({ status: 200, message: "sukses" ,data})
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller