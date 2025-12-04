const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const subTransaksi = require("./model");
const periode = require("../periode/model");
const msCoa = require("../ms_coa/model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static async register(req, res) {
        const { cc, cc_name, idgl, tgl, coa_code, amount_debet, amount_kredit, remark,identitas_transaksi,type_penerima_id,penerima_id,penerima_name,sub_type_penerima_id,sub_penerima_id,sub_penerima_name } = req.body
        try {
            const tanggal=new Date(tgl);
            const bulan=tanggal.getMonth();
            const tahun=tanggal.getFullYear();
            const retrievePeriode= await periode.findOne({where:{tahun,bulan},raw:true})
            console.log(retrievePeriode);
            if(!retrievePeriode || !retrievePeriode.status){
                return res.status(201).json({ status: 204, message: "periode tidak aktif" });
            }
            const checkCoa = await msCoa.findOne({where:{code:coa_code},raw:true})
            console.log(checkCoa);
            if(!checkCoa || checkCoa.level!=4){
                return res.status(201).json({ status: 204, message: "code coa tidak sesuai" });
            }
            const coa_name=checkCoa.name;
            const checkDuplicate = await subTransaksi.findOne({where:{idgl,coa_code,identitas_transaksi,type_penerima_id,penerima_id},raw:true})
            if(checkDuplicate){
                return res.status(201).json({ status: 204, message: "duplikasi data" });
            }
            const data = await subTransaksi.create({ id: uuid_v4(), cc, cc_name, idgl, tgl, coa_code, coa_name, amount_debet, amount_kredit, remark,identitas_transaksi,type_penerima_id,penerima_id,penerima_name,sub_type_penerima_id,sub_penerima_id,sub_penerima_name })
            return res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
       
    }

    static async update(req, res) {
        const { id, cc, cc_name, idgl, tgl, coa_code, amount_debet, amount_kredit, remark,identitas_transaksi,type_penerima_id,penerima_id,penerima_name,sub_type_penerima_id,sub_penerima_id,sub_penerima_name } = req.body
        try {
            const tanggal=new Date(tgl);
            const bulan=tanggal.getMonth();
            const tahun=tanggal.getFullYear();
            const retrievePeriode= await periode.findOne({where:{tahun,bulan},raw:true})
            if(!retrievePeriode || !retrievePeriode.status){
                return res.status(201).json({ status: 204, message: "periode tidak aktif" });
            }
            const checkCoa = await msCoa.findOne({where:{code:coa_code},raw:true})
            if(!checkCoa || checkCoa.level!=4){
                return res.status(201).json({ status: 204, message: "code coa tidak sesuai" });
            }
            const coa_name=checkCoa.name;
            const checkDuplicate = await subTransaksi.findOne({where:{idgl,coa_code,identitas_transaksi,type_penerima_id,penerima_id,id:{[Op.not]:id} },raw:true})
            if(checkDuplicate){
                return res.status(201).json({ status: 204, message: "duplikasi data" });
            }
            const data = await subTransaksi.update({cc, cc_name, idgl, tgl, coa_code, coa_name, amount_debet, amount_kredit, remark,identitas_transaksi,type_penerima_id,penerima_id,penerima_name,sub_type_penerima_id,sub_penerima_id,sub_penerima_name },{where:{id}})
            return res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }    
    }

    static delete(req, res) {
        const { id } = req.body

        subTransaksi.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static list(req, res) {

        subTransaksi.findAll({ order: [['createdAt', 'DESC']] }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static detailsById(req, res) {
        const { id } = req.params

        subTransaksi.findAll({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses", data });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }
    static async getDetailsByIDGL(req, res) {
        const { idgl } = req.body

        try {
            let data = await sq.query(`select st.id as sub_transaksi_id,* from sub_transaksi st join ms_gudang mg on mg.id = st.cc where st."deletedAt" isnull and st.idgl ='${idgl}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}
module.exports = Controller;