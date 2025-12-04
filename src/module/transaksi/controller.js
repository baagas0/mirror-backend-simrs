const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const transaksi = require("./model");
const msTipeGl = require("../ms_tipe_gl/model");
const msGudang = require("../ms_gudang/model");
const msCoa = require("../ms_coa/model");
const periode = require("../periode/model");
const subTransaksi = require("../sub_transaksi/model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const t = await sq.transaction()
        let { idgl, tgl, judul, no_invoice, remark, code, sub_transaksi } = req.body;
        const tanggal=new Date(tgl);
        const bulan=tanggal.getMonth();
        const tahun=tanggal.getFullYear();
        const retrievePeriode= await periode.findOne({where:{tahun,bulan},raw:true})
        if(!retrievePeriode || !retrievePeriode.status){
            await t.rollback();
            return res.status(201).json({ status: 204, message: "periode tidak aktif" });
        }
        //isi code jika idgl from sequence dan idgl gk usah dikirim 
        try {
            let newSequence=false;
            if(code){
                 const checkGl=await msTipeGl.findOne({where:{code,sequence:{ [Op.not]: '0' }}})
                 if(!checkGl){
                    await t.rollback();
                    return res.status(201).json({ status: 204, message: "code tidak ditemukan" });
                 }
                 idgl=checkGl.dataValues.code+'_'+checkGl.dataValues.sequence
                 newSequence=(parseInt(checkGl.dataValues.sequence)+1);
            }
           
           let items=[]
           let responErr=[]
           let sum_debet=0;
           let sum_kredit=0;
                await Promise.all(sub_transaksi.map(async (item) => {
                    const gudang = await msGudang.findOne({where:{id:item.cc},raw:true})
                    const checkCoa = await msCoa.findOne({where:{code:item.coa_code},raw:true})
                    
                    if(!gudang){
                        responErr.push({message:'gudang tidak ditemukan',data:{id:item.cc}});
                    }
                    if(!checkCoa){
                        responErr.push({message:'coa tidak ditemukan',data:{code:item.coa_code}});
                    }
                    items.push({
                        id:uuid_v4(),
                        cc:item.cc,
                        cc_name:gudang.nama_gudang,
                        idgl:idgl,
                        tgl,
                        coa_code:item.coa_code,
                        coa_name:checkCoa.name,
                        amount_debet:parseFloat(item.amount_debet).toFixed(2),
                        amount_kredit:parseFloat(item.amount_kredit).toFixed(2),
                        remark:item.remark,
                        identitas_transaksi:item.identitas_transaksi,
                        type_penerima_id:item.type_penerima_id,
                        penerima_id:item.penerima_id,
                        penerima_name:item.penerima_name,
                        sub_type_penerima_id:item.sub_type_penerima_id,
                        sub_penerima_id:item.sub_penerima_id,
                        sub_penerima_name:item.sub_penerima_name
                    })
                    sum_debet+=parseFloat(item.amount_debet);
                    sum_kredit+=parseFloat(item.amount_kredit);
                    
                  }));
                  if(responErr.length){
                    await t.rollback();
                    return res.status(500).json({ status: 500, message: "gagal", data: responErr });
                  }
                  if(sum_debet!=sum_kredit){
                    await t.rollback();
                    return res.status(201).json({ status: 204, message: "amount tidak balance" });
                  }
                  const checkData= await transaksi.findAll({ where: { idgl: { [Op.iLike]: idgl } } })
                  let data;
                  if(checkData.length){
                    data = await transaksi.update({tgl, judul, no_invoice, remark, amount_debet:sum_debet, amount_kredit:sum_kredit},{where:{idgl}},{transaction:t})
                  }else{
                    data = await transaksi.create({ id: uuid_v4(), idgl, tgl, judul, no_invoice, remark, amount_debet:sum_debet, amount_kredit:sum_kredit },{transaction:t})
                  }  
                  const test=await subTransaksi.destroy({ where: {idgl},force:true }, { transaction: t });

                  const jmbt= await subTransaksi.bulkCreate(items,{transaction:t})
            
                  if(newSequence){
                    const updateSequence = await msTipeGl.update({sequence:newSequence},{where:{code}},{transaction:t})
                    console.log(updateSequence);
                   }
                   data.subTransaksi=jmbt;
           await t.commit();
           if(req.returnNull){
            return null;
           }
           return res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            await t.rollback();
            return res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, idgl, tgl, judul, no_invoice, remark, amount_debet, amount_kredit } = req.body
        transaksi.findAll({ where: { [Op.and]:{ idgl: { [Op.iLike]: idgl },id:{[Op.not]:id} }}}).then(data => {
            if (data.length > 0) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                transaksi.update({ idgl, tgl, judul, no_invoice, remark, amount_debet, amount_kredit}, { where: { id } }).then(dataa => {
                    console.log(dataa);
                    res.status(200).json({ status: 200, message: "sukses" });
                }).catch(err => {
                    res.status(500).json({ status: 500, message: "gagal", data: err });
                })
            }
        }).catch(err => {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
        
    }

    static delete(req, res) {
        const { id } = req.body

        transaksi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static list(req, res) {

        transaksi.findAll({ order: [['createdAt', 'DESC']] }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static detailsById(req, res) {
        const { id } = req.params

        transaksi.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
}
module.exports = Controller;