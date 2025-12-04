const penunjang = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const ms_harga_penunjang=require('../ms_harga_penunjang/model')

class Controller {
    static async register(req, res) {
        const { kode_loinc, nama_loinc, nama_penunjang,status_penunjang,keterangan_penunjang,jenis_penunjang_id,tarif_cbg_id,parameter_normal,satuan,bulk_tarif } = req.body;
        const t = await sq.transaction();
        try {
            let cek_nama = await penunjang.findAll({where: {
                [Op.or]: [
                  { nama_penunjang }
                ]
              }})
            if (cek_nama.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" })
            } else {
            let harga = await sq.query(`select * from ms_harga mh where mh."deletedAt" isnull `, s)
            let data_penunjang= await penunjang.create({id:uuid_v4(),kode_loinc, nama_loinc, nama_penunjang,status_penunjang,keterangan_penunjang,jenis_penunjang_id,tarif_cbg_id,parameter_normal,satuan },{ transaction: t })
              let bulk_harga_penunjang = []
              for (let i = 0; i < bulk_tarif.length; i++) {
                  for (let j = 0; j < harga.length; j++) {
                      let obj = {
                          id: uuid_v4(),
                          penunjang_id: data_penunjang.dataValues.id,
                          ms_tarif_id: bulk_tarif[i].ms_tarif_id,
                          ms_harga_id: harga[j].id,
                          harga_jual_penunjang: bulk_tarif[i].harga_jual_penunjang,
                          harga_beli_penunjang: bulk_tarif[i].harga_beli_penunjang
                      }
                      bulk_harga_penunjang.push(obj)
                  }
              }
              console.log(bulk_harga_penunjang);
              await ms_harga_penunjang.bulkCreate(bulk_harga_penunjang, { transaction: t })
              await t.commit();
              // await t.rollback()
              res.status(200).json({ status: 200, message: "sukses" })
            }
        } catch (err) {
          await t.rollback()
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { kode_loinc, nama_loinc, nama_penunjang,status_penunjang,id,keterangan_penunjang,jenis_penunjang_id,tarif_cbg_id,parameter_normal,satuan } = req.body;

      try {
          let cek_nama = await sq.query(`select * from penunjang md where md."deletedAt" isnull  and md.id !='${id}' and md.nama_penunjang = '${nama_penunjang}' `,s)
          // console.log(cek_nama);
          if (cek_nama.length) {
              res.status(201).json({ status: 204, message: "data sudah ada" })
          } else {
            await penunjang.update({kode_loinc, nama_loinc,nama_penunjang,status_penunjang,keterangan_penunjang,jenis_penunjang_id,tarif_cbg_id,parameter_normal,satuan},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
          }
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async detailsById(req,res){
      const{id}=req.body

      try {
        let data = await sq.query(`select p.id as penunjang_id,* from penunjang p 
        join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
        left join tarif_cbg tc on tc.id = p.tarif_cbg_id 
        where p."deletedAt" isnull and p.id = '${id}'`,s)
        res.status(200).json({ status: 200, message: "sukses",data })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }

     
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
       await penunjang.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,status_penunjang,tarif_cbg_id, jenis_penunjang_id, nama_jenis_penunjang, search}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and p.id = '${id}' `
        }
        if(status_penunjang){
          isi+= ` and p.status_penunjang = '${status_penunjang}' `
        }
        if(tarif_cbg_id){
            isi+= ` and p.tarif_cbg_id = '${tarif_cbg_id}' `
        }
        if(jenis_penunjang_id) {
          isi += ` and p.jenis_penunjang_id = '${jenis_penunjang_id}' `
        }
        if(nama_jenis_penunjang) {
          isi += ` and jp.nama_jenis_penunjang = '${nama_jenis_penunjang}' `
        }

        if(search) {
          isi += ` and p.nama_penunjang ilike '%${search}%' `
        }

        let data = await sq.query(`select p.id as penunjang_id,* from penunjang p 
        join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
        left join tarif_cbg tc on tc.id = p.tarif_cbg_id 
        where p."deletedAt" isnull  ${isi} order by p."createdAt" desc ${pagination}`,s)

        let jml = await sq.query(`select count(*) from penunjang p
        join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
        left join tarif_cbg tc on tc.id = p.tarif_cbg_id 
        where p."deletedAt" isnull  ${isi} `,s)


        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller