const penjualan_penunjang = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const { status_penjualan_penunjang,keterangan_penjualan_penunjang,qty_penjualan_penunjang,harga_penjualan_penunjang,harga_custom_penjualan_penunjang,penunjang_id,penjualan_id } = req.body;

        try {
        
             let data= await penjualan_penunjang.create({id:uuid_v4(),status_penjualan_penunjang,keterangan_penjualan_penunjang,qty_penjualan_penunjang,harga_penjualan_penunjang,harga_custom_penjualan_penunjang,penunjang_id,penjualan_id})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,status_penjualan_penunjang,keterangan_penjualan_penunjang,qty_penjualan_penunjang,harga_penjualan_penunjang,harga_custom_penjualan_penunjang,penunjang_id,penjualan_id } = req.body;

      try {
         let data = await penjualan_penunjang.update({status_penjualan_penunjang,keterangan_penjualan_penunjang,qty_penjualan_penunjang,harga_penjualan_penunjang,harga_custom_penjualan_penunjang,penunjang_id,penjualan_id},{where:{
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
       await penjualan_penunjang.destroy({where:{id}})
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
        let data = await sq.query(`select * from penjualan_penunjang pp where pp."deletedAt" isnull and pp.id='${id}' `,s)

        res.status(200).json({ status: 200, message: "sukses",data})
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }

    }

    static async list(req, res) {
      const{halaman,jumlah,id}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and aki.id = '${id}' `
        }
        let data = await sq.query(`select * from penjualan_penunjang pp where pp."deletedAt" isnull ${isi} order by pp."createdAt" desc ${pagination}`,s)
        let jml = await sq.query(`select count(*) from penjualan_penunjang pp where pp."deletedAt" isnull  ${isi} `,s)

        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
    
    static async listPenjualanPenunjangnByPenjualanId(req, res) {
      const{penjualan_id}=req.body

      try {
        let data = await sq.query(`select pp.id as penjualan_penunjang_id,pp.*,p.nama_penunjang,p.jenis_penunjang_id,p.tarif_cbg_id,p.parameter_normal,p.satuan,jp.nama_jenis_penunjang  
        from penjualan_penunjang pp 
        join penunjang p on p.id = pp.penunjang_id 
        join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
        where pp."deletedAt" isnull and pp.penjualan_id = '${penjualan_id}'`,s);
        
        res.status(200).json({ status: 200, message: "sukses",data })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
    
    static async listPenjualanPenunjangnByPenunjangId(req, res) {
      const{penunjang_id}=req.body

      try {
        let data = await sq.query(`select pp.id as penjualan_penunjang_id,pp.*,p.nama_penunjang,p.jenis_penunjang_id,p.tarif_cbg_id,p.parameter_normal,p.satuan,jp.nama_jenis_penunjang  
        from penjualan_penunjang pp 
        join penunjang p on p.id = pp.penunjang_id 
        join jenis_penunjang jp on jp.id = p.jenis_penunjang_id 
        where pp."deletedAt" isnull and pp.penunjang_id = '${penunjang_id}'`,s);

        res.status(200).json({ status: 200, message: "sukses",data })
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }
}

module.exports = Controller