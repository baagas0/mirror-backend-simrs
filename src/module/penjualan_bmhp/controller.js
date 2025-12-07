const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualanBmhp = require('./model')
const penjualan = require('../penjualan/model')
const operasiBmhp = require('../operasi_bmhp/model')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const { operasi_bmhp_id, penjualan_id, qty, harga_satuan, total_harga, jenis, keterangan, status_penjualan_bmhp } = req.body;
        
        try {
            // Validasi penjualan exists
            let cekPenjualan = await penjualan.findAll({where:{id:penjualan_id}})
            if(cekPenjualan.length==0){
                res.status(201).json({ status: 204, message: "penjualan_id tidak ada" })
            }else{
                if(cekPenjualan[0].status_penjualan != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bukan 1" })
                }else{
                    // Validasi operasi_bmhp exists
                    let cekOperasiBmhp = await operasiBmhp.findAll({where:{id:operasi_bmhp_id}})
                    if(cekOperasiBmhp.length==0){
                        res.status(201).json({ status: 204, message: "operasi_bmhp_id tidak ada" })
                    }else{
                        // Check if already exists
                        let cekPenjualanBmhp = await penjualanBmhp.findAll({where:{penjualan_id, operasi_bmhp_id}})
                        if(cekPenjualanBmhp.length>0){
                            res.status(201).json({ status: 204, message: "data sudah ada" })
                        }else{
                            let hasil = await sq.transaction(async t =>{
                                let data = await penjualanBmhp.create({
                                    id:uuid_v4(),
                                    operasi_bmhp_id, 
                                    penjualan_id, 
                                    qty: qty || cekOperasiBmhp[0].qty, 
                                    harga_satuan: harga_satuan || cekOperasiBmhp[0].harga_satuan, 
                                    total_harga: total_harga || cekOperasiBmhp[0].total_harga, 
                                    jenis: jenis || cekOperasiBmhp[0].jenis, 
                                    keterangan: keterangan || cekOperasiBmhp[0].keterangan,
                                    status_penjualan_bmhp: status_penjualan_bmhp || 1
                                },{transaction:t});
                                
                                return data
                            })
                            
                            res.status(200).json({ status: 200, message: "sukses", data:hasil })
                        }
                    }
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, qty, harga_satuan, total_harga, jenis, keterangan, status_penjualan_bmhp } = req.body;

        try {
            let dataBmhp = await sq.query(`select pb.* from penjualan_bmhp pb where pb."deletedAt" isnull and pb.id = '${id}'`,s);
            if(dataBmhp.length==0){
                res.status(201).json({ status: 204, message: "data tidak ditemukan" });
            }else{
                if(dataBmhp[0].status_penjualan_bmhp != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bmhp bukan 1" });
                }else{
                    await sq.transaction(async t=>{
                        await penjualanBmhp.update({ 
                            qty, 
                            harga_satuan, 
                            total_harga, 
                            jenis, 
                            keterangan, 
                            status_penjualan_bmhp 
                        }, { where: { id },transaction:t })
                    })

                    res.status(200).json({ status: 200, message: "sukses" });
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;

        try {
            let dataBmhp = await sq.query(`select pb.* from penjualan_bmhp pb where pb."deletedAt" isnull and pb.id = '${id}'`,s);

            if(dataBmhp.length==0){
                res.status(201).json({ status: 204, message: "data tidak ditemukan" });
            }else{
                if(dataBmhp[0].status_penjualan_bmhp != 1){
                    res.status(201).json({ status: 204, message: "status penjualan bmhp bukan 1" });
                }else{
                    await sq.transaction(async t =>{
                        await penjualanBmhp.destroy({ where: {id},transaction:t })
                    })

                    res.status(200).json({ status: 200, message: "sukses" });
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        try {
            let data = await sq.query(`select pb.id as penjualan_bmhp_id, pb.*,
            ob.ms_barang_id, ob.hasil_operasi_id,
            mb.nama_barang, mb.kode_produk, 
            msb.nama_satuan,
            p.kode_penjualan
            from penjualan_bmhp pb 
            join operasi_bmhp ob on ob.id = pb.operasi_bmhp_id
            join ms_barang mb on mb.id = ob.ms_barang_id
            left join ms_satuan_barang msb on msb.id = ob.ms_satuan_barang_id
            join penjualan p on p.id = pb.penjualan_id
            where pb."deletedAt" isnull order by pb."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanBmhpByPenjualanId(req, res) {
        const {penjualan_id, order} = req.body;
        try {
            let urut = order
            if (urut != 'desc' && urut != 'asc') {
                urut = 'desc'
            }

            let data = await sq.query(`select pb.id as penjualan_bmhp_id, pb.*,
            ob.ms_barang_id, ob.hasil_operasi_id, ob.waktu_input, ob.user_input_id,
            mb.nama_barang, mb.kode_produk, 
            msb.nama_satuan,
            p.kode_penjualan, p.ms_gudang_id,
            mg.nama_gudang, mg.tipe_gudang
            from penjualan_bmhp pb
            join penjualan p on p.id = pb.penjualan_id
            join operasi_bmhp ob on ob.id = pb.operasi_bmhp_id
            join ms_barang mb on mb.id = ob.ms_barang_id
            left join ms_satuan_barang msb on msb.id = ob.ms_satuan_barang_id
            join ms_gudang mg on mg.id = p.ms_gudang_id
            where pb."deletedAt" isnull and pb.penjualan_id = '${penjualan_id}' 
            order by pb."createdAt" ${urut}`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
    
    static async listPenjualanBmhpByOperasiBmhpId(req, res) {
        const {operasi_bmhp_id} = req.body;
        try {
            let data = await sq.query(`select pb.id as penjualan_bmhp_id, pb.*,
            ob.ms_barang_id, ob.hasil_operasi_id,
            mb.nama_barang, mb.kode_produk, 
            msb.nama_satuan,
            p.kode_penjualan
            from penjualan_bmhp pb 
            join operasi_bmhp ob on ob.id = pb.operasi_bmhp_id
            join ms_barang mb on mb.id = ob.ms_barang_id
            left join ms_satuan_barang msb on msb.id = ob.ms_satuan_barang_id
            join penjualan p on p.id = pb.penjualan_id
            where pb."deletedAt" isnull and pb.operasi_bmhp_id = '${operasi_bmhp_id}' 
            order by pb."createdAt" desc`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanBmhpByRegistrasiId(req, res) {
        const {registrasi_id} = req.body;
        try {
            let data = await sq.query(`select pb.id as penjualan_bmhp_id, pb.*,
            ob.ms_barang_id, ob.hasil_operasi_id,
            mb.nama_barang, mb.kode_produk, 
            msb.nama_satuan,
            p.kode_penjualan, p.registrasi_id
            from penjualan_bmhp pb 
            join penjualan p on p.id = pb.penjualan_id
            join operasi_bmhp ob on ob.id = pb.operasi_bmhp_id
            join ms_barang mb on mb.id = ob.ms_barang_id
            left join ms_satuan_barang msb on msb.id = ob.ms_satuan_barang_id
            where pb."deletedAt" isnull and p.registrasi_id = '${registrasi_id}' 
            order by p.kode_penjualan, mb.nama_barang`,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params

        try {
            let data = await sq.query(`select pb.id as penjualan_bmhp_id, pb.*,
            ob.ms_barang_id, ob.hasil_operasi_id, ob.waktu_input, ob.user_input_id, ob.status as status_operasi_bmhp,
            mb.nama_barang, mb.kode_produk, 
            msb.nama_satuan,
            p.kode_penjualan, p.registrasi_id, p.tgl_penjualan,
            u.username
            from penjualan_bmhp pb 
            join operasi_bmhp ob on ob.id = pb.operasi_bmhp_id
            join ms_barang mb on mb.id = ob.ms_barang_id
            left join ms_satuan_barang msb on msb.id = ob.ms_satuan_barang_id
            join penjualan p on p.id = pb.penjualan_id
            left join users u on u.id = ob.user_input_id
            where pb."deletedAt" isnull and pb.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    // Method untuk create penjualan_bmhp dari operasi_bmhp yang di-confirm
    static async createFromOperasiBmhp(req, res) {
        const { operasi_bmhp_id, penjualan_id } = req.body;
        
        try {
            // Get operasi_bmhp data
            let operasiBmhpData = await sq.query(`
                select ob.*, ho.jadwal_operasi_id, jo.registrasi_id
                from operasi_bmhp ob
                join hasil_operasi ho on ho.id = ob.hasil_operasi_id
                join jadwal_operasi jo on jo.id = ho.jadwal_operasi_id
                where ob."deletedAt" isnull and ob.id = '${operasi_bmhp_id}'
            `, s);

            if(operasiBmhpData.length == 0){
                return res.status(201).json({ status: 204, message: "operasi_bmhp_id tidak ditemukan" })
            }

            // Check if operasi_bmhp status is confirmed
            if(operasiBmhpData[0].status !== 'confirmed'){
                return res.status(201).json({ status: 204, message: "status operasi_bmhp bukan confirmed" })
            }

            // Check if already created
            let existingData = await penjualanBmhp.findAll({where:{operasi_bmhp_id}})
            if(existingData.length > 0){
                return res.status(201).json({ status: 204, message: "penjualan_bmhp untuk operasi_bmhp ini sudah ada" })
            }

            // Create penjualan if penjualan_id not provided
            let finalPenjualanId = penjualan_id;
            if(!finalPenjualanId){
                // Create new penjualan with is_bmhp = true
                let newPenjualan = await penjualan.create({
                    id: uuid_v4(),
                    tgl_penjualan: new Date(),
                    is_bmhp: true,
                    registrasi_id: operasiBmhpData[0].registrasi_id,
                    status_penjualan: 1
                });
                finalPenjualanId = newPenjualan.id;
            }

            // Create penjualan_bmhp
            let hasil = await penjualanBmhp.create({
                id: uuid_v4(),
                operasi_bmhp_id: operasi_bmhp_id,
                penjualan_id: finalPenjualanId,
                qty: operasiBmhpData[0].qty,
                harga_satuan: operasiBmhpData[0].harga_satuan,
                total_harga: operasiBmhpData[0].total_harga,
                jenis: operasiBmhpData[0].jenis,
                keterangan: operasiBmhpData[0].keterangan,
                status_penjualan_bmhp: 1
            });

            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller

