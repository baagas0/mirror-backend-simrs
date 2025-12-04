const rad_test_list = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller{

    static async register(req, res) {
        const { queue,keterangan_rad_test_list,penunjang_id,rad_test_id } = req.body;

        try {
             let data= await rad_test_list.create({id:uuid_v4(),rad_test_id,queue,keterangan_rad_test_list,penunjang_id,created_by:req.dataUsers.id,created_name:req.dataUsers.username  })
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,queue,keterangan_rad_test_list,penunjang_id,rad_test_id } = req.body;
      try {
            await rad_test_list.update({queue,rad_test_id,keterangan_rad_test_list,penunjang_id,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
        const{halaman,jumlah,id,rad_test_id,penunjang_id}=req.body
        let isi = ''
        let offset=''
        let pagination=''
  
        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }
  
  
        try {
  
          if(id){
            isi+= ` and rtl.id = '${id}' `
          }
          if(rad_test_id){
            isi+= ` and rtl.rad_test_id = '${rad_test_id}' `
          }
          if(penunjang_id){
            isi+= ` and rtl.penunjang_id = '${penunjang_id}' `
          } 
  
          let data = await sq.query(`select rtl.id as rad_test_list_id,* from rad_test_list rtl
          join rad_test rt on rt.id=rtl.rad_test_id
          join penunjang p on p.id=rtl.penunjang_id
          where rtl."deletedAt" isnull  ${isi} order by rt."createdAt" desc ${pagination}`,s)
  
          let jml = await sq.query(`select count(*) from rad_test_list rtl where rtl."deletedAt" isnull  ${isi} `,s)
          console.log(data);
  
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
          let data = await sq.query(`select rtl.id as rad_test_list_id,* from rad_test_list rtl
          join rad_test rt on rt.id=rtl.rad_test_id
          join penunjang p on p.id=rtl.penunjang_id
          where rt."deletedAt" isnull and rtl.id='${id}'`,s)
          res.status(200).json({ status: 200, message: "sukses",data })
        } catch (error) {
          console.log(req.body);
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error });
        }
      }

      static async delete(req,res){
        const{id}= req.body
        try {
        await rad_test_list.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{id}})
         await rad_test_list.destroy({where:{id}})
         res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
          console.log(req.body);
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
      }

    

}

module.exports=Controller