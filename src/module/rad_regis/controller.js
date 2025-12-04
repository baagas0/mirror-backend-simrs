const rad_regis = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const radHasil = require('../rad_hasil/model');
const radtest = require('../rad_test/model');
const radTestList = require('../rad_test_list/model');
const penunjang = require('../penunjang/model');
const penjualan_penunjang = require('../penjualan_penunjang/model');

class Controller{

    static async register(req,res){
        const{diagnosa,tanggal_request,list_test,klinis,is_cito,is_registrasi,keterangan_rad_regis,ms_dokter_id,registrasi_id, proyeksi, kv, mas, ffd, bsf, inak, jumlah_penyinaran, dosis_radiasi, is_puasa, status}=req.body
        try {
            let data= await rad_regis.create({id:uuid_v4(),registrasi_id,ms_dokter_id,diagnosa,tanggal_request,list_test,klinis,is_cito,is_registrasi,keterangan_rad_regis, proyeksi, kv, mas, ffd, bsf, inak, jumlah_penyinaran, dosis_radiasi, is_puasa, status, created_by:req.dataUsers.id,created_name:req.dataUsers.username})
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req,res){
        const{id,diagnosa,tanggal_request,list_test,klinis,is_cito,is_registrasi,keterangan_rad_regis,ms_dokter_id,registrasi_id, proyeksi, kv, mas, ffd, bsf, inak, jumlah_penyinaran, dosis_radiasi, is_puasa, status}=req.body
        try {
            await rad_regis.update({ms_dokter_id,registrasi_id,diagnosa,tanggal_request,list_test,klinis,is_cito,is_registrasi,keterangan_rad_regis, proyeksi, kv, mas, ffd, bsf, inak, jumlah_penyinaran, dosis_radiasi, is_puasa, status, updated_by:req.dataUsers.id,updated_name:req.dataUsers.username},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async updateSampel(req,res) {
      const { id, tanggal_ambil_sampel, status } = req.body

      try {
        await rad_regis.update({ tanggal_ambil_sampel, status },{where:{id}})
        res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async createRadHasil(req, res) {
      const t = await sq.transaction()
      const {id,forceUpdate} = req.body;
      try {
          //buat ambil penjualan id
          //select pj.id as penjualan_id, lr.id as lab_regis_id from lab_regis lr join registrasi r on lr.registrasi_id = r.id join penjualan pj on r.id = pj.registrasi_id where lr.id='0f9c39c7-0f84-4fa0-8339-4b7784a5da85' 
          //check labHasil exist
          let getId = await sq.query(`select pj.id as penjualan_id, rr.id as rad_regis_id,mt.id as ms_tarif_id, mh.id as ms_harga_id  from rad_regis rr
          join registrasi r on rr.registrasi_id = r.id
          join penjualan pj on r.id = pj.registrasi_id 
          join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
          join ms_tarif mt on mt.id = kk.ms_tarif_id
          join ms_asuransi ma on ma.id = r.ms_asuransi_id
          join ms_harga mh on mh.id = ma.ms_harga_id
where rr.id='${id}' `)
// console.log(getId[0]);
          const checkRadHasil = await radHasil.findAll({where:{rad_regis_id:id}})
          if(checkRadHasil.length>0 && !forceUpdate){
              return res.status(500).json({ status: 500, message: "gagal", data: "radHasil sudah ada" })
          }
          const dataRadRegis = await rad_regis.findOne({where:{id}});
          let radHasilBulk=[];
          let penjualan=[];
          for(let item of dataRadRegis.list_test){
              console.log('item', item);
              const dataRadTestList = await radTestList.findAll({where:{rad_test_id:item.rad_test_id},include:[penunjang,radtest]});
              // console.log(dataLabPaket);
              for(let itemm of dataRadTestList){
                  console.log('itemm', itemm);
                  let getHarga = await sq.query(`select * from ms_harga_penunjang mhp 
                 where mhp.penunjang_id='${itemm.penunjang_id}' and mhp.ms_tarif_id='${getId[0][0].ms_tarif_id}' and mhp.ms_harga_id= '${getId[0][0].ms_harga_id}'`)
              //    console.log(getHarga[0]);
                 if(getId[0].length){
                  if(getHarga[0].length){
                       penjualan.push({
                      id:uuid_v4(),
                      qty_penjualan_penunjang:1,
                      harga_penjualan_penunjang:getHarga[0][0].harga_jual_penunjang,
                      harga_custom_penjualan_penunjang: getHarga[0][0].harga_jual_penunjang,
                      penunjang_id: itemm.penunjang_id,
                      penjualan_id:getId[0][0].penjualan_id
                  })
                  }
                   
                 }
                
                 radHasilBulk.push({
                      id:uuid_v4(),
                      tanggal_pemeriksaan: new Date,
                      rad_test_id:itemm.rad_test_id,
                      penunjang_id:itemm.penunjang_id,
                      queue:itemm.queue,
                      keterangan_rad_hasil:itemm.keterangan_rad_test_list,
                      rad_regis_id:id,
                      hasil:''
                  });
              }
          }
          // console.log(penjualan);
          await rad_regis.update({ status: 3 }, {where:{id}})
          await radHasil.destroy({where:{rad_regis_id:id},force:true},{transaction:t})
          const data= await radHasil.bulkCreate(radHasilBulk,{transaction:t})
          await penjualan_penunjang.destroy({where:{penjualan_id:getId[0][0].penjualan_id},force:true},{transaction:t})
          await penjualan_penunjang.bulkCreate(penjualan, { updateOnDuplicate: ['penunjang_id', 'penjualan_id'], transaction:t })
         
          await t.commit()
          res.status(200).json({ status: 200, message: "sukses", data})
      } catch (error) {
          console.log(error);
          await t.rollback()
          res.status(500).json({ status: 500, message: "gagal", data: error })
      }
  }
    static async detailsById(req,res){
        const{id}=req.body
        try {
            let data = await sq.query(`select rr.id as rad_regis_id,* from rad_regis rr join ms_dokter md on md.id=rr.ms_dokter_id left join registrasi r on r.id=rr.registrasi_id left join pasien p on p.id=r.pasien_id where rr."deletedAt" isnull and rr.id='${id}'`,s)
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (error) {
            console.log(req.body);
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }}
    
    static async list(req, res) {
        const{tanggal_request,no_rm,registrasi_id,halaman,jumlah,id,dokter_id,tanggal_request_awal,tanggal_request_akhir,klinis,is_cito,is_registrasi,ms_dokter_id}=req.body
        let isi = ''
        let offset=''
        let pagination=''
  
        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }
  
        try {
  
          if(id){
            isi+= ` and rr.id = '${id}' `
          }
          if(tanggal_request){
            isi+=` and rr.tanggal_request::date = '${tanggal_request}' `
          }
          if(tanggal_request_awal){
            isi+=` and date(rr.tanggal_request) >= date('${tanggal_request_awal}') `
          }
          if(tanggal_request_akhir){
            isi+=` and date(rr.tanggal_request) <= date('${tanggal_request_akhir}') `
          }
          if(dokter_id){
            isi+=` and rr.dokter_id = '${dokter_id}' `
          }
          if(klinis){
            isi+=` and rr.klinis = '${klinis}' `
          }
          if(typeof is_cito=='boolean'){
            isi+=` and rr.is_cito = '${is_cito}' `
          }
          if(typeof is_registrasi=='boolean'){
            isi+=` and rr.is_registrasi = '${is_registrasi}' `
          }
          if(ms_dokter_id){
            isi+=` and rr.ms_dokter_id = '${ms_dokter_id}' `
          }

          if(no_rm) isi += ` and p.no_rm = '${no_rm}' `
          if(registrasi_id) isi += ` and rr.registrasi_id = '${registrasi_id}' `
  
          let data = await sq.query(`select rr.id as rad_regis_id,rr.*,md.*,p.*,r.tgl_registrasi,r.no_kunjungan from rad_regis rr join ms_dokter md on md.id=rr.ms_dokter_id left join registrasi r on r.id=rr.registrasi_id left join pasien p on p.id=r.pasien_id where rr."deletedAt" isnull  ${isi} order by rr."createdAt" desc ${pagination}`,s)
  
          let jml = await sq.query(`select count(*) from rad_regis rr join ms_dokter md on md.id=rr.ms_dokter_id left join registrasi r on r.id=rr.registrasi_id left join pasien p on p.id=r.pasien_id where rr."deletedAt" isnull ${isi}`,s)
  
          res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
          
        } catch (error) {
          console.log(req.body);
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error });
        }
      
      }

    static async delete(req,res){
        const{id}=req.body
        try {
            await rad_regis.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{id}})
            await rad_regis.destroy({where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }}

    static async statistic(req, res) {
      try {
          let data = await sq.query(`
              select count(A.id) as new from rad_regis A where A.status = 0 and A."deletedAt" isnull
          `, s)
          
          res.status(200).json({ status: 200, message: "sukses", data: { new: data[0].new } })
      } catch (error) {
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error })
      }
    }

    static async cancel(req,res){
      const{id,reason}=req.body
      try {
          await rad_regis.update({status:4, reason},{where:{id}})
          res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }
}

module.exports=Controller