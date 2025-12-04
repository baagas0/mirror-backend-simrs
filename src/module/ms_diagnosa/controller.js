const ms_diagnosa = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

class Controller {
    static async register(req, res) {
        const { kode_diagnosa,nama_diagnosa,non_spesialis,keterangan_diagnosa } = req.body;

        try {
            let cek_nama = await ms_diagnosa.findAll({where: {
                [Op.or]: [
                  { nama_diagnosa },
                  { kode_diagnosa }
                ]
              }})
            if (cek_nama.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" })
            } else {
             let data= await ms_diagnosa.create({id:uuid_v4(),kode_diagnosa,nama_diagnosa,non_spesialis,keterangan_diagnosa,is_bpjs:false })
              res.status(200).json({ status: 200, message: "sukses",data })
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async register_bulk(req, res) {
      let excelpath = `./asset/file/${req.files.file1[0].filename}`;
        try {
          const result = excelToJson({sourceFile: excelpath,header:{rows:1},sheets:['ms_diagnosa_202401162242']});
          let data = []
          console.log(result.ms_diagnosa_202401162242.length);
          result.ms_diagnosa_202401162242.forEach(e => {data.push({id:uuid_v4(),kode_diagnosa:e.A,nama_diagnosa:e.B,non_spesialis:e.C})})
          console.log(data.length);
          // await ms_diagnosa.bulkCreate(data)
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
      const { id,kode_diagnosa,nama_diagnosa,non_spesialis,keterangan_diagnosa } = req.body;

      try {
          let cek_nama = await sq.query(`select * from ms_diagnosa md where md."deletedAt" isnull  and md.id !='${id}' and (md.nama_diagnosa = '${nama_diagnosa}' or md.kode_diagnosa= '${kode_diagnosa}') `,s)
          // console.log(cek_nama);
          if (cek_nama.length) {
              res.status(201).json({ status: 204, message: "data sudah ada" })
          } else {
            await ms_diagnosa.update({kode_diagnosa,nama_diagnosa,non_spesialis,keterangan_diagnosa},{where:{id}})
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
       await ms_diagnosa.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,kode_diagnosa,nama_diagnosa,is_bpjs,non_spesialis,search}=req.body

      try {
        let isi = ''
        let offset=''
        let pagination=''
  
        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }

        if(id){
          isi+= ` and md.id = '${id}'`
        }
        if(kode_diagnosa){
          isi+= ` and md.kode_diagnosa ilike '%${kode_diagnosa}%'`
        }
        if(nama_diagnosa){
          isi+= ` and md.nama_diagnosa ilike '%${nama_diagnosa}%'`
        }
        if(non_spesialis){
          isi+= ` and md.non_spesialis = '${non_spesialis}'`
        }
        if(is_bpjs){
          isi+= ` and md.is_bpjs = '${is_bpjs}'`
        }
        if(search){
          isi+= ` and (md.nama_diagnosa ilike '%${search}%'or md.kode_diagnosa ilike '%${search}%')`
        }

        let data = await sq.query(`select * from ms_diagnosa md where md."deletedAt" isnull${isi} order by md."createdAt" desc ${pagination}`,s)
        let jml=await sq.query(`select count(*) from ms_diagnosa md where md."deletedAt" isnull${isi}`,s)
        
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
        let data = await sq.query(`select * from ms_diagnosa md where md."deletedAt" isnull and md.id = '${id}'`,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    }
}

module.exports = Controller