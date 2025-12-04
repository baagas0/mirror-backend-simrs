const cppt = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { asesmen,tanggal_cppt,nama_tenaga_medis,ms_tipe_tenaga_medis_id,registrasi_id,ms_dokter_id } = req.body;

        try {
            
        
             let data= await cppt.create({id:uuid_v4(),asesmen,tanggal_cppt,nama_tenaga_medis,created_by:req.dataUsers.id,created_name:req.dataUsers.username,ms_tipe_tenaga_medis_id,registrasi_id,ms_dokter_id})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,asesmen,tanggal_cppt,nama_tenaga_medis,ms_tipe_tenaga_medis_id,registrasi_id,ms_dokter_id,status_cppt } = req.body;

      try {
         let data = await cppt.update({asesmen,tanggal_cppt,nama_tenaga_medis,ms_tipe_tenaga_medis_id,registrasi_id,ms_dokter_id,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username,status_cppt},{where:{
            id
         }})
         if(data[0]==1){
            res.status(200).json({ status: 200, message: "sukses" })
         }
         else{
            res.status(200).json({ status: 201, message: "gagal, id salah" })
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
       await cppt.destroy({where:{id}})
       await cppt.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{
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
        let data = await sq.query(`select c.id as cppt_id,*, md.id as ms_dokter_id, c.ms_tipe_tenaga_medis_id as ms_tipe_tenaga_medis_id from cppt c 
        join ms_tipe_tenaga_medis mttm on mttm.id = c.ms_tipe_tenaga_medis_id 
        join registrasi r on r.id = c.registrasi_id 
        join ms_dokter md on md.id = c.ms_dokter_id
        join pasien p on p.id = r.pasien_id 
        where c."deletedAt" isnull  and c.id='${id}' `,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }

    }

    static async list(req, res) {
      const{halaman,jumlah,id,registrasi_id,ms_tipe_tenaga_medis_id, kode_tipe_tenaga_medis}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and c.id = '${id}' `
        }
        if(registrasi_id){
            isi+= ` and c.registrasi_id = '${registrasi_id}' `
        }
        if(ms_tipe_tenaga_medis_id){
            isi+= ` and c.ms_tipe_tenaga_medis_id = '${ms_tipe_tenaga_medis_id}' `
        }
        if(kode_tipe_tenaga_medis) {
          isi+= ` and mttm.kode_tipe_tenaga_medis = '${kode_tipe_tenaga_medis}'`
        }
        let data = await sq.query(`select c.id as cppt_id,*, md.id as ms_dokter_id, c.ms_tipe_tenaga_medis_id as ms_tipe_tenaga_medis_id from cppt c 
        join ms_tipe_tenaga_medis mttm on mttm.id = c.ms_tipe_tenaga_medis_id 
        join registrasi r on r.id = c.registrasi_id 
        join ms_dokter md on md.id = c.ms_dokter_id
        join pasien p on p.id = r.pasien_id 
        where c."deletedAt" isnull  ${isi} order by c."createdAt" desc ${pagination}`,s)
        let jml = await sq.query(`select count(*) from cppt c 
        join ms_tipe_tenaga_medis mttm on mttm.id = c.ms_tipe_tenaga_medis_id 
        join registrasi r on r.id = c.registrasi_id 
        join ms_dokter md on md.id = c.ms_dokter_id 
        join pasien p on p.id = r.pasien_id
        where c."deletedAt" isnull  ${isi} `,s)

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller