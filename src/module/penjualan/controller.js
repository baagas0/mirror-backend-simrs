const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const penjualan = require('./model')
const penjualanExternal = require('../penjualan_external/model')
const penjualanFasilitas = require('../penjualan_fasilitas/model')
const penjualanJasa = require('../penjualan_jasa/model')
const penjualanBarang = require('../penjualan_barang/model')
const penjualanOperasi = require('../penjualan_operasi/model')
const penjualanPenunjang = require('../penjualan_penunjang/model')
const stockBarang = require('../stock/model')
const historyInv = require('../history_inventory/model')
const {kurangiStock,kembaliStock} = require('../../helper/stock_barang')
const {cekTagihanByRegistrasiId,cekTagihanByPenjualanId} = require('../../helper/cek_tagihan')
const s = { type: QueryTypes.SELECT };

class Controller {

    static async register(req, res) {
        const { tgl_penjualan, is_external, jenis_rawat, NIK, nama, harga_total_barang, harga_total_jasa, harga_total_fasilitas, discount, tax, total_penjualan, status_penjualan, penjualan_external_id, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, bulk_fasilitas, bulk_jasa, bulk_barang } = req.body;

        try {
            let data = await penjualan.create({ id:uuid_v4(),tgl_penjualan, is_external, jenis_rawat, NIK, nama, harga_total_barang, harga_total_jasa, harga_total_fasilitas, discount, tax, total_penjualan, status_penjualan, penjualan_external_id, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, bulk_fasilitas, bulk_jasa, bulk_barang }, { transaction: t });

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async registerBulk(req, res) {
        const { tgl_penjualan, is_bmhp, remark,is_external, jenis_rawat, NIK, nama, harga_total_barang, harga_total_jasa, harga_total_fasilitas, discount, tax, total_penjualan, status_penjualan, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, nama_penjualan_external,alamat_penjualan_external,keterangan_penjualan_external,pasien_id } = req.body;
        let { bulk_fasilitas, bulk_jasa, bulk_barang, bulk_penunjang, bulk_operasi } = req.body
        
        try {
            let cekTagihan = await cekTagihanByRegistrasiId({registrasi_id})
            if(cekTagihan){
                res.status(201).json({status:204, message:"Tagihan telah ditutup atau dikunci"})
            }else{
                let penjualan_id = uuid_v4();
                let isi = ''
                let hisInv = []
                let stock = []
                let stockKurang = []
    
                if (!bulk_jasa || !bulk_jasa.length) bulk_jasa = []
                if (!bulk_fasilitas || !bulk_fasilitas.length) bulk_fasilitas = []
                if (!bulk_barang || !bulk_barang.length) bulk_barang = []
                if (!bulk_penunjang || !bulk_penunjang.length) bulk_penunjang = []
                if (!bulk_operasi || !bulk_operasi.length) bulk_operasi = []
                for (let i = 0; i < bulk_jasa.length; i++) {
                    bulk_jasa[i].id = uuid_v4()
                    bulk_jasa[i].penjualan_id = penjualan_id
                }
                for (let i = 0; i < bulk_fasilitas.length; i++) {
                    bulk_fasilitas[i].id = uuid_v4()
                    bulk_fasilitas[i].penjualan_id = penjualan_id
                }
                for (let i = 0; i < bulk_barang.length; i++) {
                    bulk_barang[i].id = uuid_v4()
                    bulk_barang[i].penjualan_id = penjualan_id
                    isi+= `,'${bulk_barang[i].ms_barang_id}'`
                }
                for (let i = 0; i < bulk_penunjang.length; i++) {
                    bulk_penunjang[i].id = uuid_v4()
                    bulk_penunjang[i].penjualan_id = penjualan_id
                }
                for (let i = 0; i < bulk_operasi.length; i++) {
                    bulk_operasi[i].id = uuid_v4()
                    bulk_operasi[i].penjualan_id = penjualan_id
                }
                if(bulk_barang.length>0){
                    let barang = await kurangiStock({ms_gudang_id,bulk_barang,isi:isi.substring(1)})
                    if(barang.cekHasil.length>0){
                        stockKurang = barang.cekHasil
                    }else{
                        stock = barang.stock
                        hisInv = barang.hisInv
                    }
                }
    
                if(stockKurang.length>0){
                    res.status(201).json({status:204, message:"stock tidak cukup", data: stockKurang})
                }else{
                    let hasil = await sq.transaction(async t =>{
                        let external_id = uuid_v4();
                        if(is_external){
                            await penjualanExternal.create({id:external_id,nama_penjualan_external,alamat_penjualan_external,keterangan_penjualan_external,pasien_id},{transaction:t})
                        }
    
                        let data = await penjualan.create({ id: penjualan_id, tgl_penjualan, is_bmhp, remark,is_external, jenis_rawat, NIK, nama, harga_total_barang, harga_total_jasa, harga_total_fasilitas, discount, tax, total_penjualan, status_penjualan, penjualan_external_id:!is_external?null:external_id, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id }, { transaction: t });
                        await penjualanFasilitas.bulkCreate(bulk_fasilitas, { transaction: t })
                        await penjualanPenunjang.bulkCreate(bulk_penunjang, { transaction: t })
                        await penjualanJasa.bulkCreate(bulk_jasa, { transaction: t })
                        await penjualanBarang.bulkCreate(bulk_barang, { transaction: t })
                        await penjualanOperasi.bulkCreate(bulk_operasi.map((x) => ({
                            ...x,
                            id: x.id,
                            qty:x.qty_barang,
                            harga_satuan:x.harga_barang,
                            harga_satuan_custom:x.harga_barang_custom,
                            harga_pokok:x.harga_pokok_barang,
                            jenis: "BMHP",
                            keterangan:x.keterangan_penjualan_operasi,
                            status_penjualan_operasi:x.status_penjualan_operasi,
                            penjualan_id: penjualan_id,
                            
                        })), { transaction: t })
                        await stockBarang.bulkCreate(stock,{updateOnDuplicate:['qty'],transaction:t})
                        await historyInv.bulkCreate(hisInv,{transaction:t})
    
                        return data
                    });
    
                    res.status(200).json({ status: 200, message: "sukses", data: hasil })
                }
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static update(req, res) {
        const { id, tgl_penjualan, is_external, jenis_rawat, NIK, nama, harga_total_barang, harga_total_jasa, harga_total_fasilitas, discount, tax, total_penjualan, status_penjualan, penjualan_external_id, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, bulk_fasilitas, bulk_jasa, bulk_barang } = req.body;

        penjualan.update({ tgl_penjualan, is_external, jenis_rawat, NIK, nama, harga_total_barang, harga_total_jasa, harga_total_fasilitas, discount, tax, total_penjualan, status_penjualan, penjualan_external_id, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, bulk_fasilitas, bulk_jasa, bulk_barang }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async delete(req, res) {
        const { id } = req.body;
        
        try {
            let cekTagihan = await cekTagihanByPenjualanId({penjualan_id:id})
            if(cekTagihan){
                res.status(201).json({ status: 204, message: "status tagihan bukan 1" });
            }else{
                let cekPenjualan = await penjualan.findAll({ where: { id } })
                if (cekPenjualan[0].status_penjualan != 1) {
                    res.status(201).json({ status: 204, message: "status penjualan bukan 1" });
                } else {
                    let dataBarang = await sq.query(`select pb.*,p.ms_gudang_id from penjualan_barang pb join penjualan p on p.id = pb.penjualan_id where pb."deletedAt" isnull and pb.penjualan_id = '${id}'`,s);

                    await sq.transaction(async t =>{
                        await penjualan.destroy({where: { id },transaction:t})
                        await penjualanFasilitas.destroy({ where: { penjualan_id: id },transaction:t })
                        await penjualanJasa.destroy({ where: { penjualan_id: id },transaction:t })
                        await penjualanPenunjang.destroy({ where: { penjualan_id: id },transaction:t })
                        await penjualanOperasi.destroy({ where: { penjualan_id: id },transaction:t })
                        if(cekPenjualan[0].penjualan_external_id){
                            await penjualanExternal.destroy({where:{id:cekPenjualan[0].penjualan_external_id},transaction:t})
                        }
                        if(dataBarang.length>0){
                            let isi = ''
                            for (let i = 0; i < dataBarang.length; i++) {
                                isi+=`,'${dataBarang[i].ms_barang_id}'`
                            }
                            let barang = await kembaliStock({ms_gudang_id:dataBarang[0].ms_gudang_id,bulk_barang:dataBarang,isi:isi.substring(1)})
                            await stockBarang.bulkCreate(barang.stock,{updateOnDuplicate:['qty'],transaction:t})
                            await historyInv.bulkCreate(barang.hisInv,{transaction:t})
                            await penjualanBarang.destroy({where:{penjualan_id:id},transaction:t})
                        }
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
        const { halaman,jumlah, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, status_penjualan, no_kunjungan, kode_penjualan, no_rm } = req.body;

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (registrasi_id) {
                isi += ` and p.registrasi_id = '${registrasi_id}'`
            }
            if (kelas_kunjungan_id) {
                isi += ` and p.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if (ms_asuransi_id) {
                isi += ` and p.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (ms_gudang_id) {
                isi += ` and p.ms_gudang_id = '${ms_gudang_id}'`
            }
            if (ms_dokter_id) {
                isi += ` and p.ms_dokter_id = '${ms_dokter_id}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and p.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (status_penjualan) {
                isi += ` and p.status_penjualan = '${status_penjualan}'`
            }
            if (no_kunjungan) {
                isi += ` and r.no_kunjungan = '${no_kunjungan}'`
            }
            if (kode_penjualan) {
                isi += ` and p.kode_penjualan = '${kode_penjualan}'`
            }
            if (no_rm) {
                isi += ` and p2.no_rm = '${no_rm}'`
            }
            let data = await sq.query(`select p.id as penjualan_id,p.*,r.no_kunjungan,r.tgl_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.status_registrasi,
			kk.nama_kelas_kunjungan,kk.ms_tarif_id,ma.nama_asuransi,ma.ms_harga_id,
            mg.nama_gudang,md.nama_dokter,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,pe.*,p3.no_rm as no_rm_penjualan_external,p2.no_rm 
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull${isi} order by p."createdAt" desc ${pagination}`, s);
            let jml = await sq.query(`select count(*) from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanByRegistrasiId(req, res) {
        const { registrasi_id, status_penjualan } = req.body;

        try {
            let isi = ''

            if (status_penjualan) {
                isi += ` and p.status_penjualan = ${status_penjualan}`
            }

            let data = await sq.query(`select p.id as penjualan_id,p.*,r.no_kunjungan,r.tgl_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.status_registrasi,
			kk.nama_kelas_kunjungan,kk.ms_tarif_id,ma.nama_asuransi,ma.ms_harga_id,
            mg.nama_gudang,md.nama_dokter,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,pe.*,p3.no_rm as no_rm_penjualan_external,p2.no_rm 
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull p.registrasi_id = '${registrasi_id}' ${isi} order by p."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPerhalaman(req, res) {
        const { halaman, jumlah, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, status_penjualan } = req.body;

        try {
            let offset = (+halaman - 1) * jumlah
            let isi = ''
            if (registrasi_id) {
                isi += ` and p.registrasi_id = '${registrasi_id}'`
            }
            if (kelas_kunjungan_id) {
                isi += ` and p.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if (ms_asuransi_id) {
                isi += ` and p.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (ms_gudang_id) {
                isi += ` and p.ms_gudang_id = '${ms_gudang_id}'`
            }
            if (ms_dokter_id) {
                isi += ` and p.ms_dokter_id = '${ms_dokter_id}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and p.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (status_penjualan) {
                isi += ` and p.status_penjualan = '${status_penjualan}'`
            }

            let data = await sq.query(`select p.id as penjualan_id,p.*,r.no_kunjungan,r.tgl_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.status_registrasi,
			kk.nama_kelas_kunjungan,kk.ms_tarif_id,ma.nama_asuransi,ma.ms_harga_id,
            mg.nama_gudang,md.nama_dokter,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,pe.*,p3.no_rm as no_rm_penjualan_external,p2.no_rm 
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull ${isi} order by p."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*)as total
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull ${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanNonTagihanPerHalaman(req, res) {
        const { halaman, jumlah, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, status_penjualan,is_external, no_rm_penjualan_external, nama, NIK, tgl_awal, tgl_akhir, kode_penjualan } = req.body;
        // is_external nilai 1 => true, 0=> false (string not number)
        try {
            let offset = (+halaman - 1) * jumlah
            let isi = ''
            if (is_external) {
                if(is_external == "1"){
                    isi += ` and p.id not in (select pe3.penjualan_id from pool_external pe3 where pe3."deletedAt" isnull) and p.is_external = true`
                }else{
                    isi+= ` and p.registrasi_id not in (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull) and p.is_external = false`
                }
            }
            if (registrasi_id) {
                isi += ` and p.registrasi_id = '${registrasi_id}'`
            }
            if (kelas_kunjungan_id) {
                isi += ` and p.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if (ms_asuransi_id) {
                isi += ` and p.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (ms_gudang_id) {
                isi += ` and p.ms_gudang_id = '${ms_gudang_id}'`
            }
            if (ms_dokter_id) {
                isi += ` and p.ms_dokter_id = '${ms_dokter_id}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and p.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (status_penjualan) {
                isi += ` and p.status_penjualan = '${status_penjualan}'`
            }
            if (no_rm_penjualan_external) {
                isi += ` and p3.no_rm ilike '%${no_rm_penjualan_external}%'`
            }
            if (nama) {
                isi += ` and p.nama ilike '%${nama}%'`
            }
            if (NIK) {
                isi += ` and p."NIK" ilike '%${NIK}%'`
            }
            if (tgl_awal) {
                isi += ` and date(p.tgl_penjualan) >= '${tgl_awal}'`
            }
            if (tgl_akhir) {
                isi += ` and date(p.tgl_penjualan) <= '${tgl_akhir}'`
            }
            if (kode_penjualan) {
                isi += ` and p.kode_penjualan = ${kode_penjualan}`
            }
            

            let data = await sq.query(`select p.id as penjualan_id,p.*,r.no_kunjungan,r.tgl_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.status_registrasi,
			kk.nama_kelas_kunjungan,kk.ms_tarif_id,ma.nama_asuransi,ma.ms_harga_id,
            mg.nama_gudang,md.nama_dokter,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,pe.*,p3.no_rm as no_rm_penjualan_external,p2.no_rm 
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull ${isi} 
            order by p."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*)as total
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull ${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanByTagihanId(req, res) {
        const { tagihan_id, registrasi_id, kelas_kunjungan_id, ms_asuransi_id, ms_gudang_id, ms_dokter_id, ms_jenis_layanan_id, status_penjualan,is_external } = req.body;
        
        try {
            let isi = ''
            if (registrasi_id) {
                isi += ` and p.registrasi_id = '${registrasi_id}'`
            }
            if (kelas_kunjungan_id) {
                isi += ` and p.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if (ms_asuransi_id) {
                isi += ` and p.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if (ms_gudang_id) {
                isi += ` and p.ms_gudang_id = '${ms_gudang_id}'`
            }
            if (ms_dokter_id) {
                isi += ` and p.ms_dokter_id = '${ms_dokter_id}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and p.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if (status_penjualan) {
                isi += ` and p.status_penjualan = '${status_penjualan}'`
            }
            if (is_external) {
                let ket = is_external=='1'?true:false
                isi += ` and p.is_external = ${ket}`
            }

            let data = await sq.query(`select p.id as penjualan_id,p.*,r.no_kunjungan,r.tgl_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.status_registrasi,
			kk.nama_kelas_kunjungan,kk.ms_tarif_id,ma.nama_asuransi,ma.ms_harga_id,
            mg.nama_gudang,md.nama_dokter,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,pe.*,p3.no_rm as no_rm_penjualan_external,p2.no_rm 
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull
            and (p.id in (select pe2.penjualan_id from pool_external pe2 where pe2."deletedAt" isnull and pe2.tagihan_id='${tagihan_id}')
            or p.registrasi_id in (select pr.registrasi_id from pool_registrasi pr join registrasi r2 
            on r2.id = pr.registrasi_id where pr."deletedAt" isnull and pr.tagihan_id = '${tagihan_id}')) ${isi}
            order by p.tgl_penjualan,p.kode_penjualan`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPenjualanOperasi(req, res) {
        const { registrasi_id, penjualan_id } = req.body

        try {
            let isi = ''
            if(penjualan_id) {
                isi +=  ` and A.id = '${penjualan_id}' `
            }
            if(registrasi_id) {
                isi +=  ` and A.registrasi_id = '${registrasi_id}' `
            }

            let data = await sq.query(`
                select
                    A.*,
                    B.nama_gudang,
                    C.ms_harga_id,
                    D.ms_tarif_id,
                    (
                        select 
                            jsonb_agg(
                                json_build_object(
                                    'id', PO.id,
                                    'ms_barang_id', PO.ms_barang_id,
                                    'nama_barang', MB.nama_barang,
                                    'kode_produk', MB.kode_produk,
                                    'qty', PO.qty,
                                    'harga_satuan', PO.harga_satuan,
                                    'harga_satuan_custom', PO.harga_satuan_custom,
                                    'harga_pokok', PO.harga_pokok,
                                    'total_harga', (PO.qty * PO.harga_satuan),
                                    'jenis', PO.jenis,
                                    'keterangan', PO.keterangan,
                                    'nama_satuan', MSB.nama_satuan
                                ) 
                            ) 
                        from penjualan_operasi PO
                        join ms_barang MB on MB.id = PO.ms_barang_id
                        join ms_jenis_obat MJO on MJO.id = MB.ms_jenis_obat_id
                        join ms_satuan_barang MSB on MSB.id = MB.ms_satuan_barang_id
                        where PO.penjualan_id = A.id and PO."deletedAt" isnull
                        order by MB.nama_barang asc
                    ) as bulk_operasi
                from penjualan A
                left join ms_gudang B on B.id = A.ms_gudang_id
                left join ms_asuransi C on C.id = A.ms_asuransi_id 
                left join kelas_kunjungan D on D.id = A.kelas_kunjungan_id 
                where A."deletedAt" is null and A.is_bmhp = true ${isi}
            `, s);
            
            // HANDLE bulk_operasi = null
            for (let i = 0; i < data.length; i++) {
                const e = data[i];
                if(!e.bulk_operasi) data[i].bulk_operasi = []
            }

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`select p.id as penjualan_id,p.*,r.no_kunjungan,r.tgl_registrasi,r.no_asuransi_registrasi,r.no_rujukan,r.status_registrasi,
			kk.nama_kelas_kunjungan,kk.ms_tarif_id,ma.nama_asuransi,ma.ms_harga_id,
            mg.nama_gudang,md.nama_dokter,mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,pe.*,p3.no_rm as no_rm_penjualan_external,p2.no_rm
            from penjualan p 
            left join registrasi r on r.id = p.registrasi_id 
            left join pasien p2 on p2.id = r.pasien_id
            left join kelas_kunjungan kk on kk.id = p.kelas_kunjungan_id 
            left join ms_asuransi ma on ma.id = p.ms_asuransi_id 
            left join ms_gudang mg on mg.id = p.ms_gudang_id 
            left join ms_dokter md on md.id = p.ms_dokter_id 
            left join ms_jenis_layanan mjl on mjl.id = p.ms_jenis_layanan_id 
            left join penjualan_external pe on pe.id = p.penjualan_external_id
            left join pasien p3 on p3.id = pe.pasien_id
            where p."deletedAt" isnull and p.id = '${id}'`, s);
            let fasilitas = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,mf.ms_jenis_fasilitas_id,mjf.nama_jenis_fasilitas  
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id
            where pf."deletedAt" isnull and pf.penjualan_id = '${id}' order by mf.nama_fasilitas`, s);
            let penunjang = await sq.query(`select pp.id as penjualan_penunjang_id, pp.*,mp.nama_penunjang,mp.jenis_penunjang_id,mjp.nama_jenis_penunjang
            from penjualan_penunjang pp
            join penunjang mp on mp.id = pp.penunjang_id
            join jenis_penunjang mjp on mjp.id = mp.jenis_penunjang_id
            where pp."deletedAt" isnull and pp.penjualan_id = '${id}' order by mp.nama_penunjang`, s);
            let jasa = await sq.query(`select pj.id as penjualan_jasa_id,pj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mjj.nama_jenis_jasa  
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id
            join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id
            where pj."deletedAt" isnull and pj.penjualan_id = '${id}' order by mj.nama_jasa`, s);
            let barang = await sq.query(`select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,mb.harga_beli_terahir,
            mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
            (select sum(s.qty)as total_stock_barang from stock s where s."deletedAt" isnull and s.ms_barang_id = pb.ms_barang_id and s.ms_gudang_id='${data.length>0?data[0].ms_gudang_id:""}') 
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where pb."deletedAt" isnull and pb.penjualan_id = '${id}' order by mb.nama_barang`,s);
            let operasi = await sq.query(`select po.id as penjualan_operasi_id, po.*,
            mb.nama_barang, mb.kode_produk, mb.qjb, mb.harga_pokok, mb.harga_tertinggi, mb.harga_beli_terahir,
            mb.ms_jenis_obat_id, mjo.nama_jenis_obat, mb.komposisi, mb.ms_satuan_jual_id, msb.nama_satuan
            from penjualan_operasi po 
            join ms_barang mb on mb.id = po.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            where po."deletedAt" isnull and po.penjualan_id = '${id}' 
            order by mb.nama_barang`,s);
            let pembayaran = await sq.query(`select pt.tipe_pembayaran_tagihan,pt.kartu_bank_pembayaran_tagihan,pt.kas_id,k.name as nama_kas
            from pembayaran_tagihan pt
            join kas k on k.id = pt.kas_id
            where pt."deletedAt" isnull and (pt.tagihan_id in (select pe.tagihan_id from pool_external pe where pe."deletedAt" isnull and pe.penjualan_id = '${id}')
            or pt.tagihan_id in (select pr.tagihan_id from pool_registrasi pr join penjualan p on p.registrasi_id = pr.registrasi_id where pr."deletedAt" isnull and p.id = '${id}' ))`,s);
            let tagihan = await sq.query(`select t.* from tagihan t where t."deletedAt" isnull and (t.id = (select pr.tagihan_id from pool_registrasi pr join penjualan p2 on p2.registrasi_id = pr.registrasi_id where pr."deletedAt" isnull and p2.id = '${id}') 
            or t.id = (select pe.tagihan_id from pool_external pe where pe."deletedAt" isnull and pe.penjualan_id = '${id}'))`,s)

            if (data.length > 0) {
                data[0].tipe_pembayaran_tagihan = pembayaran.length>0?pembayaran[0].tipe_pembayaran_tagihan:null
                data[0].kas_id = pembayaran.length>0?pembayaran[0].kas_id:null
                data[0].nama_kas = pembayaran.length>0?pembayaran[0].nama_kas:null
                data[0].kode_tagihan = tagihan.length>0?tagihan[0].kode_tagihan:null
                data[0].status_tagihan = tagihan.length>0?tagihan[0].status_tagihan:null
                data[0].fasilitas = fasilitas
                data[0].jasa = jasa
                data[0].barang = barang
                data[0].operasi = operasi
                data[0].penunjang = penunjang
            }

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async changeStatusPenjualan(req, res) {
        const { id, status_penjualan } = req.body

        try {
            let cekTagihan = await cekTagihanByPenjualanId({penjualan_id:id})
            if(cekTagihan){
                res.status(201).json({ status: 204, message: "status tagihan bukan 1" });
            }else{
                    let cekStatus = await penjualan.findAll({ where: { id } })
                    if (cekStatus[0].status_penjualan == 3) {
                        res.status(201).json({ status: 204, message: "status penjualan sudah 3" });
                    } else {
                        await sq.transaction(async t =>{
                            if (status_penjualan == 1) {
                                await penjualanFasilitas.update({ status_penjualan_fasilitas: 1 }, { where: { penjualan_id: id }, transaction: t })
                                await penjualanJasa.update({ status_penjualan_jasa: 1 }, { where: { penjualan_id: id }, transaction: t })
                                await penjualanBarang.update({ status_penjualan_barang: 1 }, { where: { penjualan_id: id }, transaction: t })
                                await penjualanOperasi.update({ status_penjualan_operasi: 1 }, { where: { penjualan_id: id }, transaction: t })
                            } else if (status_penjualan == 2) {
                                await penjualanFasilitas.update({ status_penjualan_fasilitas: 2 }, { where: { penjualan_id: id }, transaction: t })
                                await penjualanJasa.update({ status_penjualan_jasa: 2 }, { where: { penjualan_id: id }, transaction: t })
                                await penjualanBarang.update({ status_penjualan_barang: 2 }, { where: { penjualan_id: id }, transaction: t })
                                await penjualanOperasi.update({ status_penjualan_operasi: 2 }, { where: { penjualan_id: id }, transaction: t })
                            }
                            await penjualan.update({ status_penjualan }, { where: { id }, transaction: t })
                        })
                        res.status(200).json({ status: 200, message: "sukses" });
                    }
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller