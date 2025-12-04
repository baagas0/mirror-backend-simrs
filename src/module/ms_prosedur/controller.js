const ms_prosedur = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

class Controller {
    static async register(req, res) {
        const { kode_prosedur,nama_prosedur } = req.body;

        try {
            let [result,created] = await ms_prosedur.findOrCreate({where: {[Op.or]: [{ kode_prosedur:[Op.iLike]=kode_prosedur },{ nama_prosedur:[Op.iLike]=nama_prosedur }]},defaults:{id:uuid_v4(),kode_prosedur,nama_prosedur}})
            if (!created) {
                return res.status(201).json({ status: 204, message: "data sudah ada" })
            }

            res.status(200).json({ status: 200, message: "sukses",data: [result] })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async register_bulk(req, res) {
      let excelpath = `./asset/file/${req.files.file1[0].filename}`;
        try {
          const result = excelToJson({sourceFile: excelpath,header:{rows:1}});
          let data = []
          result.masterprocedure.forEach(e => {data.push({id:uuid_v4(),kode_prosedur:e.A,nama_prosedur:e.B})})
          console.log(data.length);
          // await ms_prosedur.bulkCreate(data)
          fs.unlinkSync(excelpath);
          res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            fs.unlinkSync(excelpath);
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id, kode_prosedur,nama_prosedur } = req.body;

      try {
          let cek = await sq.query(`select * from ms_prosedur mp where mp."deletedAt" isnull and mp.id <> '${id}' and (mp.kode_prosedur ilike '${kode_prosedur?kode_prosedur:''}' or mp.nama_prosedur ilike '${nama_prosedur?nama_prosedur:''}')`,s)
          if (cek.length > 0) {
              return res.status(201).json({ status: 204, message: "data sudah ada" })
          }

          await ms_prosedur.update({ kode_prosedur,nama_prosedur},{where:{id}})
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
        await ms_prosedur.destroy({where:{id}})
        res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,kode_prosedur,nama_prosedur,search}=req.body

      try {
        let isi = ''
        let offset=''
        let pagination=''
  
        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }

        if(kode_prosedur){
          isi+= ` and mp.kode_prosedur ilike '%${kode_prosedur}%'`
        }
        if(nama_prosedur){
          isi+= ` and mp.nama_prosedur ilike '%${nama_prosedur}%'`
        }
        if(search){
          isi+= ` and (mp.nama_prosedur ilike '%${search}%'or mp.kode_prosedur ilike '%${search}%')`
        }

        let data = await sq.query(`select * from ms_prosedur mp where mp."deletedAt" isnull${isi} order by mp.nama_prosedur ${pagination}`,s)
        let jml=await sq.query(`select count(*) from ms_prosedur mp where mp."deletedAt" isnull${isi}`,s)
        
        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
  }

    static async detailsById(req, res) {
      const{id}=req.body

      try {
        let data = await sq.query(`select * from ms_prosedur mp where mp."deletedAt" isnull and mp.id = '${id}'`,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    }
}

module.exports = Controller