const dform_triage_options = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const {label_options,code_options,dform_triage_id } = req.body;

        try {
        
             let data= await dform_triage_options.create({id:uuid_v4(),label_options,code_options,dform_triage_id})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,label_options,code_options,dform_triage_id } = req.body;

      try {
         let data = dform_triage_options.update({label_options,code_options,dform_triage_id},{where:{
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
       await dform_triage_options.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,dform_triage_id}=req.body
      let isi = '';
      let offset = (+halaman -1) * jumlah;

      try {
        
        if(dform_triage_id) isi += ` and dto.dform_triage_id = '${dform_triage_id}' `;

        if(id){
          isi+= ` and dto.id = '${id}' `
        }

        let data = await sq.query(`select dto.*,dt."label"  from dform_triage_options dto
        join dform_triage dt on dt.id = dto.dform_triage_id 
        where dto."deletedAt" isnull  ${isi} order by dto."createdAt" desc limit ${jumlah} offset ${offset}`,s)
        res.status(200).json({ status: 200, message: "sukses" ,data})
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async detailsById(req, res) {
      const { id } = req.params
      try {
          let data = await sq.query(`select * from dform_triage_options aki where aki."deletedAt" isnull and aki.id= '${id}'`, s)

          res.status(200).json({ status: 200, message: "sukses", data })
      } catch (error) {
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error })
      }
  }
    
}

module.exports = Controller