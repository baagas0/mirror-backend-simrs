const assesment_medis_rjalan = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const resepRjalan = require("../resep_rjalan/model");
const resepDetailRjalan = require("../resep_detail_rjalan/model");
const resepRacik = require("../resep_racik/model");
class Controller {
    static async register(req, res) {
        const { is_validasi,json_assesment_medis_rjalan,registrasi_id} = req.body;

        try {
            // console.log(req.dataUsers);
        
            let data= await assesment_medis_rjalan.create({id:uuid_v4(),is_validasi,json_assesment_medis_rjalan,created_by:req.dataUsers.id,created_name:req.dataUsers.username,registrasi_id})
            res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const t = await sq.transaction()
      const { id,is_validasi,json_assesment_medis_rjalan,registrasi_id } = req.body;
    //   console.log(req.body);

      try {
          await assesment_medis_rjalan.update({is_validasi,json_assesment_medis_rjalan,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username,registrasi_id},{where:{
            id
         }},{transaction:t})
         if(is_validasi){
          const retrieveResep = await resepRjalan.findOne({where:{registrasi_id}})
          console.log(retrieveResep);
          if(!retrieveResep){
            const id=uuid_v4();
            const createResep = await resepRjalan.create({id,registrasi_id,createdBy:req.dataUsers.id},{transaction:t})
            let dataBulkRacik = [];
            let dataBulkDetail = [];
            if (json_assesment_medis_rjalan.planning && json_assesment_medis_rjalan.planning && json_assesment_medis_rjalan.planning.obat_racikan) {
              for(let item of json_assesment_medis_rjalan.planning.obat_racikan){
                let idResepRacik = uuid_v4();
                dataBulkRacik.push({
                  id:idResepRacik,
                  resep_rjalan_id:id,
                  nama_racik:item.nama_obat,
                  qty:item.jumlah,
                  signa:item.signa,
                  satuan:item.nama_satuan,
                  kronis:item.kronis,
                  aturan_pakai:item.aturan_pakai
                })
                for(let itemm of item.obat_jadi){
                  dataBulkDetail.push({
                    id:uuid_v4(),
                    resep_id:id,
                    resep_racik_id:idResepRacik,
                    awal_id_obat:itemm.nama_obat.id,
                    awal_nama_obat:itemm.nama_obat.nama_barang,
                    awal_signa:itemm.signa,
                    awal_harga:itemm.nama_obat.harga_pokok,
                    awal_qty:itemm.jumlah,
                    awal_satuan:itemm.nama_obat.nama_satuan,
                    awal_aturan_pakai:itemm.aturan_pakai,
                    final_id_obat:itemm.nama_obat.id,
                    final_nama_obat:itemm.nama_obat.nama_barang,
                    final_signa:itemm.signa,
                    final_harga:itemm.nama_obat.harga_pokok,
                    final_qty:itemm.jumlah,
                    final_satuan:itemm.nama_obat.nama_satuan,
                    final_aturan_pakai:itemm.aturan_pakai
                  })
                }
              }
            }
            if (json_assesment_medis_rjalan.planning && json_assesment_medis_rjalan.planning && json_assesment_medis_rjalan.planning.obat_jadi) {
              for(let item of json_assesment_medis_rjalan.planning.obat_jadi){
                dataBulkDetail.push({
                  id:uuid_v4(),
                  resep_id:id,
                  awal_id_obat:item.nama_obat.id,
                  awal_nama_obat:item.nama_obat.nama_barang,
                  awal_signa:item.signa,
                  awal_harga:item.nama_obat.harga_pokok,
                  awal_qty:item.jumlah,
                  awal_satuan:item.nama_obat.nama_satuan,
                  awal_aturan_pakai:item.aturan_pakai,
                  final_id_obat:item.nama_obat.id,
                  final_nama_obat:item.nama_obat.nama_barang,
                  final_signa:item.signa,
                  final_harga:item.nama_obat.harga_pokok,
                  final_qty:item.jumlah,
                  final_satuan:item.nama_obat.nama_satuan,
                  final_aturan_pakai:item.aturan_pakai
                })
              }
            }
            await resepRacik.bulkCreate(dataBulkRacik,{transaction:t})
            await resepDetailRjalan.bulkCreate(dataBulkDetail,{transaction:t})
          }
         }
         await t.commit()
         res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
          console.log(req.body);
          console.log(err);
          await t.rollback()
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
       await assesment_medis_rjalan.destroy({where:{id}})
       await assesment_medis_rjalan.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username,registrasi_id},{where:{
        id
     }})
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
          isi+= ` and amr.id = '${id}' `
        }
        if(registrasi_id){
          isi+= ` and amr.registrasi_id = '${registrasi_id}' `
        }

        let data = await sq.query(`select amr.id as assesment_medis_rjalan_id,* from assesment_medis_rjalan amr  
        join registrasi r on r.id = amr.registrasi_id 
        where amr."deletedAt" isnull ${isi} order by amr."createdAt" desc ${pagination}`,s)

        let jml = await sq.query(`select count(*) from assesment_medis_rjalan amr  
        join registrasi r on r.id = amr.registrasi_id 
        where amr."deletedAt" isnull ${isi}`,s)

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
            let data = await sq.query(`select amr.id as assesment_medis_rjalan_id,* from assesment_medis_rjalan amr  
            join registrasi r on r.id = amr.registrasi_id 
            where amr."deletedAt" isnull and amr.id='${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (error) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

}

module.exports = Controller