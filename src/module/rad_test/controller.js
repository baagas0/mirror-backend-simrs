const rad_test = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { nama_rad_test,keterangan_rad_test,ms_gudang_id } = req.body;

        try {
             let data= await rad_test.create({id:uuid_v4(),nama_rad_test,keterangan_rad_test,ms_gudang_id,created_by:req.dataUsers.id,created_name:req.dataUsers.username  })
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    
    }

    static async update(req, res) {
      const { id,nama_rad_test,keterangan_rad_test,ms_gudang_id} = req.body;
      try {
            await rad_test.update({nama_rad_test,keterangan_rad_test,ms_gudang_id,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req,res){
      const{id}=req.body

      try {
        let data = await sq.query(`select rt.id as rad_test_id,* from rad_test rt join ms_gudang g on g.id=rt.ms_gudang_id where rt."deletedAt" isnull and rt.id='${id}'`,s)
        res.status(200).json({ status: 200, message: "sukses",data })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }

     
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
        await rad_test.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{id}})
       await rad_test.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{nama_penunjang,halaman,jumlah,id,search}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and rt.id = '${id}' `
        }
        if(nama_penunjang) {
            isi += `
                AND rt.id IN (
                    SELECT
                        lpl.rad_test_id 
                    FROM
                      rad_test_list lpl
                    LEFT JOIN penunjang p ON
                        p.id = lpl.penunjang_id 
                    WHERE
                        p.nama_penunjang ilike '%${nama_penunjang}%'
                )
            `
        }
        if(search) {
          isi += `
            and rt.nama_rad_test ilike '%${search}%'
          `
        }

        let data = await sq.query(`
          select
            rt.id as rad_test_id,
            *,
            (
              select
                jsonb_agg(
                  json_build_object(
                    'rad_test_list', A.id,
                    -- 'penunjang_id', B.id,
                    'nama_penunjang', B.nama_penunjang
                  ) 
                ) 
              from rad_test_list A
              join penunjang B on B.id = A.penunjang_id 
              where A."deletedAt" isnull and A.rad_test_id = rt.id
            ) as rad_test_list
          from
            rad_test rt
          join ms_gudang g on
            g.id = rt.ms_gudang_id
          where
            rt."deletedAt" isnull
            ${isi} 
          order by rt."createdAt" desc ${pagination}`,s)

        let jml = await sq.query(`select count(*) from rad_test rt join ms_gudang g on g.id=rt.ms_gudang_id where rt."deletedAt" isnull  ${isi} `,s)
        console.log(data);

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}


module.exports = Controller