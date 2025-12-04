const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const tagihan = require('./model')
const poolRegistrasi = require('../pool_registrasi/model');
const poolExternal = require('../pool_external/model');
const penanggung = require('../penanggung/model');
const pembayaranPenjualan = require('../pembayaran_tagihan/model');
const s = { type: QueryTypes.SELECT };
const moment = require("moment");

class Controller {

    static async register(req, res) {
        const {no_asuransi, tgl_tagihan, nama_tagihan, no_npwp_tagihan, no_sep_tagihan, keterangan_tagihan, idgl_tagihan, total_tagihan, usia_pasien_tagihan, total_bayar_tagihan, selisih_lebih_ditanggung_tagihan, selisih_kurang_ditanggung_tagihan, pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id,registrasi_id,bulk_penjualan} = req.body;
        
        try {
                let cekTagihan = await sq.query(`select * from tagihan t where t."deletedAt" isnull and date(t.tgl_tagihan) = '${tgl_tagihan}' and (t.pasien_id='${pasien_id}' or t.nama_tagihan ilike '${nama_tagihan}') and t.ms_asuransi_id = '${ms_asuransi_id}'`,s);
                if(cekTagihan.length>0){
                    res.status(201).json({ status: 204, message: "tagihan dengan tanggal, pasien, dan asuransi tersebut sudah ada" })
                }else{
                    let tagihan_id = uuid_v4();
                    let hasil = await sq.transaction(async t=>{
                        let data = await tagihan.create({id:tagihan_id,no_asuransi, tgl_tagihan, nama_tagihan, no_npwp_tagihan, no_sep_tagihan, keterangan_tagihan, idgl_tagihan, total_tagihan, usia_pasien_tagihan, total_bayar_tagihan, selisih_lebih_ditanggung_tagihan, selisih_kurang_ditanggung_tagihan, pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id},{transaction:t});
                        if(registrasi_id){
                            await poolRegistrasi.create({id:uuid_v4(),registrasi_id,tagihan_id,is_main:true},{transaction:t})
                        }else if(bulk_penjualan){
                            for (let i = 0; i < bulk_penjualan.length; i++) {
                                bulk_penjualan[i].id = uuid_v4();
                                bulk_penjualan[i].tagihan_id = tagihan_id
                            }
                            await poolExternal.bulkCreate(bulk_penjualan,{transaction:t})
                        }
                        
                        return data   
                    })  

                    res.status(200).json({ status: 200, message: "sukses", data:hasil })
                }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
        const { id, no_asuransi, tgl_tagihan, nama_tagihan, no_npwp_tagihan, no_sep_tagihan, keterangan_tagihan, idgl_tagihan, total_tagihan, usia_pasien_tagihan, total_bayar_tagihan, selisih_lebih_ditanggung_tagihan, selisih_kurang_ditanggung_tagihan, pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id } = req.body;

        try {
                await tagihan.update({no_asuransi, tgl_tagihan, nama_tagihan, no_npwp_tagihan, no_sep_tagihan, keterangan_tagihan, idgl_tagihan, total_tagihan, usia_pasien_tagihan, total_bayar_tagihan, selisih_lebih_ditanggung_tagihan, selisih_kurang_ditanggung_tagihan, pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id},{where:{id}})

                res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req, res) {
        const { id} = req.body;

        try {
            let cekTagihan = await tagihan.findAll({where:{id}})

            if(cekTagihan[0].status_tagihan != 1){
                res.status(201).message({ status:204, message:"status tagihan bukan 1" })
            }else{
                await sq.transaction(async t=>{
                    await tagihan.destroy({where:{id},transaction:t})
                    await poolRegistrasi.destroy({where:{tagihan_id:id},transaction:t})
                    await poolExternal.destroy({where:{tagihan_id:id},transaction:t})
                    await penanggung.destroy({where:{tagihan_id:id},transaction:t})
                    await pembayaranPenjualan.destroy({where:{tagihan_id:id},transaction:t})
                })
                res.status(200).json({ status: 200, message: "sukses" });
            }
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        const {pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id} = req.body;
        
        try {
            let isi =''
            if(pasien_id){
                isi+=` and t.pasien_id = '${pasien_id}'`
            }
            if(kelas_kunjungan_id){
                isi+=` and t.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if(ms_asuransi_id){
                isi+=` and t.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if(ms_jenis_layanan_id){
                isi+=` and t.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }

            let data = await sq.query(`select t.id as tagihan_id, t.*,p.no_rm, p.tgl_lahir, p.tempat_lahir,p.jenis_kelamin, p.alamat_sekarang, p.alamat_ktp ,
            kk.nama_kelas_kunjungan,kk.ms_tarif_id,mt.nama_tarif ,ma.nama_asuransi,ma.tipe_asuransi,ma.ms_harga_id ,mh.nama_harga,
            mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull ${isi} order by t."createdAt" desc `,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listPerHalaman(req, res) {
        const {halaman,jumlah,pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id, status_tagihan, nama_lengkap, kode_tagihan, jenis_kelamin, nik, no_rm, no_asuransi, tgl_tagihan_mulai, tgl_tagihan_selesai} = req.body;

        try {
            let offset = (+halaman -1) * jumlah
            let isi =''
            if(pasien_id){
                isi+=` and t.pasien_id = '${pasien_id}'`
            }
            if(kelas_kunjungan_id){
                isi+=` and t.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if(ms_asuransi_id){
                isi+=` and t.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if(ms_jenis_layanan_id){
                isi+=` and t.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if(nama_lengkap){
                isi+=` and p.nama_lengkap ilike '%${nama_lengkap}%'`
            }
            if(status_tagihan){
                isi+=` and t.status_tagihan = '${status_tagihan}'`
            }
            if(kode_tagihan){
                isi+=` and t.kode_tagihan ilike '%${kode_tagihan}%'`
            }
            if(jenis_kelamin){
                isi+=` and p.jenis_kelamin ilike '${jenis_kelamin}'`
            }
            if(nik){
                isi+=` and p.nik ilike'%${nik}%'`
            }
            if(no_rm){
                isi+=` and p.no_rm ilike '%${no_rm}%'`
            }
            if(no_asuransi){
                isi+=` and t.no_asuransi ilike '%${no_asuransi}%'`
            }
            if(tgl_tagihan_mulai){
                isi+=` and date(t.tgl_tagihan) >= '${tgl_tagihan_mulai}'`
            }
            if(tgl_tagihan_selesai){
                isi+=` and date(t.tgl_tagihan) <= '${tgl_tagihan_selesai}'`
            }

            let data = await sq.query(`select t.id as tagihan_id, t.*,p.no_rm, p.tgl_lahir, p.tempat_lahir,p.jenis_kelamin, p.alamat_sekarang, p.alamat_ktp ,
            kk.nama_kelas_kunjungan,kk.ms_tarif_id,mt.nama_tarif ,ma.nama_asuransi,ma.tipe_asuransi,ma.ms_harga_id ,mh.nama_harga,
            mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull ${isi} order by t."createdAt" desc limit ${jumlah} offset ${offset}`,s);
            let jml = await sq.query(`select count(*)as total
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull ${isi}`,s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listTagihanByPasienId(req, res) {
        const {pasien_id} = req.body;
        try {
            let data = await sq.query(`select t.id as tagihan_id, t.*,p.no_rm, p.tgl_lahir, p.tempat_lahir,p.jenis_kelamin, p.alamat_sekarang, p.alamat_ktp ,
            kk.nama_kelas_kunjungan,kk.ms_tarif_id,mt.nama_tarif ,ma.nama_asuransi,ma.tipe_asuransi,ma.ms_harga_id ,mh.nama_harga,
            mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull
            and t.pasien_id = '${pasien_id}' order by t."createdAt" desc `,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listTagihanByMsJenisLayananId(req, res) {
        const {ms_jenis_layanan_id} = req.body;
        try {
            let data = await sq.query(`select t.id as tagihan_id, t.*,p.no_rm, p.tgl_lahir, p.tempat_lahir,p.jenis_kelamin, p.alamat_sekarang, p.alamat_ktp ,
            kk.nama_kelas_kunjungan,kk.ms_tarif_id,mt.nama_tarif ,ma.nama_asuransi,ma.tipe_asuransi,ma.ms_harga_id ,mh.nama_harga,
            mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull
            and t.ms_jenis_layanan_id = '${ms_jenis_layanan_id}' order by t."createdAt" desc `,s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`select t.id as tagihan_id, t.*,p.no_rm, p.tgl_lahir, p.tempat_lahir,p.jenis_kelamin, p.alamat_sekarang, p.alamat_ktp ,
            kk.nama_kelas_kunjungan,kk.ms_tarif_id,mt.nama_tarif ,ma.nama_asuransi,ma.tipe_asuransi,ma.ms_harga_id ,mh.nama_harga,
            mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull and t.id = '${id}'`,s);
            
            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async closeTagihan(req, res) {
        const { id, status_tagihan, total_tagihan, total_bayar_tagihan, selisih_lebih_ditanggung_tagihan, selisih_kurang_ditanggung_tagihan } = req.body

        try {
            let cekTagihan = await tagihan.findAll({where:{id}})
            if(cekTagihan[0].status_tagihan == 3){
                res.status(201).json({status:204,message:"status tagihan sudah 3"})
            }else{
                await sq.transaction(async t =>{
                    if(status_tagihan == 2 || status_tagihan == 3){
                        //penjualan
                        await sq.query(`update penjualan p set status_penjualan =$status,"updatedAt" = $update 
                        where (p.id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = $id)
                        or p.id in (select p.id from pool_registrasi pr join penjualan p on p.registrasi_id = pr.registrasi_id 
                        where pr."deletedAt" isnull and pr.tagihan_id = $id))`,{bind:{status:status_tagihan,update:moment(),id:id},transaction:t})

                        //barang
                        await sq.query(`update penjualan_barang pb set status_penjualan_barang = $status,"updatedAt" = $update
                        from penjualan p 
                        where pb.penjualan_id = p.id
                        and (pb.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = $id)
                        or pb.penjualan_id in (select p.id from pool_registrasi pr join penjualan p on p.registrasi_id = pr.registrasi_id 
                        where pr."deletedAt" isnull and pr.tagihan_id = $id))`,{bind:{status:status_tagihan,update:moment(),id:id},transaction:t})

                        //fasilitas
                        await sq.query(`update penjualan_fasilitas pf set status_penjualan_fasilitas = $status,"updatedAt" = $update
                        from penjualan p
                        where p.id = pf.penjualan_id 
                        and (pf.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = $id)
                        or pf.penjualan_id in (select p.id from pool_registrasi pr join penjualan p on p.registrasi_id = pr.registrasi_id 
                        where pr."deletedAt" isnull and pr.tagihan_id = $id))`,{bind:{status:status_tagihan,update:moment(),id:id},transaction:t})

                        //jasa
                        await sq.query(`update penjualan_jasa pj set status_penjualan_jasa = $status, "updatedAt" = $update
                        from penjualan p
                        where p.id = pj.penjualan_id 
                        and (pj.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = $id)
                        or pj.penjualan_id in (select p.id from pool_registrasi pr join penjualan p on p.registrasi_id = pr.registrasi_id 
                        where pr."deletedAt" isnull and pr.tagihan_id = $id))`,{bind:{status:status_tagihan,update:moment(),id:id},transaction:t})
                    }
                    await tagihan.update({status_tagihan, total_tagihan, total_bayar_tagihan, selisih_lebih_ditanggung_tagihan, selisih_kurang_ditanggung_tagihan},{where:{id},transaction:t})
                })
                res.status(200).json({ status: 200, message: "sukses" });
            }            
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsSumary(req, res) {
        const { id } = req.body

        try {
            let barang = await sq.query(`select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,
			mb.harga_beli_terahir,mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
			p.kode_penjualan
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join penjualan p on p.id = pb.penjualan_id
            where pb."deletedAt" isnull and (p.registrasi_id in 
            (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull and pr.tagihan_id = '${id}') 
            or pb.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = '${id}'))
            order by p.kode_penjualan,mb.nama_barang`,s);
            let fasilitas = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,mf.ms_jenis_fasilitas_id,mjf.nama_jenis_fasilitas,p.kode_penjualan  
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id
            join penjualan p on p.id = pf.penjualan_id
            where pf."deletedAt" isnull and 
            (pf.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = '${id}')
            or p.registrasi_id in (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull and pr.tagihan_id = '${id}'))
            order by p.kode_penjualan,mf.nama_fasilitas`,s);
            let jasa = await sq.query(`select pj.id as penjualan_jasa_id,pj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mjj.nama_jenis_jasa,p.kode_penjualan  
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id
            join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id
            join penjualan p on p.id = pj.penjualan_id
            where pj."deletedAt" isnull and (pj.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id= '${id}')
            or p.registrasi_id in (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull and pr.tagihan_id = '${id}'))
            order by p.kode_penjualan, mj.nama_jasa`,s);
            let penunjang = await sq.query(`select pp.id as penjualan_penunjang_id,pp.*,p.nama_penunjang,p.jenis_penunjang_id,
            p.tarif_cbg_id,p.satuan,p.parameter_normal,jp.nama_jenis_penunjang,p2.kode_penjualan 
            from penjualan_penunjang pp 
            join penunjang p on p.id = pp.penunjang_id  
            join jenis_penunjang jp on jp.id = p.jenis_penunjang_id
            join penjualan p2 on p2.id = pp.penjualan_id 
            where pp."deletedAt" isnull and (pp.penjualan_id in (select pe.penjualan_id from pool_external pe where pe."deletedAt" isnull and pe.tagihan_id = '${id}')
            or p2.registrasi_id in (select pr.registrasi_id from pool_registrasi pr where pr."deletedAt" isnull and pr.tagihan_id = '${id}'))
            order by p2.kode_penjualan,p.nama_penunjang`,s);

            res.status(200).json({ status: 200, message: "sukses", data:[{barang:barang,fasilitas:fasilitas,jasa:jasa,penunjang:penunjang}] });            
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsSumaryByRegistrasiId(req, res) {
        const { registrasi_id } = req.body

        try {
            let barang = await sq.query(`select pb.id as penjualan_barang_id,pb.*,mb.nama_barang,mb.kode_produk,mb.qjb,mb.harga_pokok,mb.harga_tertinggi,
			mb.harga_beli_terahir,mb.ms_jenis_obat_id,mjo.nama_jenis_obat,mb.komposisi, mb.ms_satuan_jual_id,msb.nama_satuan,
			p.kode_penjualan
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id
            join ms_jenis_obat mjo on mjo.id = mb.ms_jenis_obat_id
            join ms_satuan_barang msb on msb.id = mb.ms_satuan_barang_id
            join penjualan p on p.id = pb.penjualan_id
            where pb."deletedAt" isnull and p.registrasi_id = '${registrasi_id}' 
            order by p.kode_penjualan,mb.nama_barang`,s);
            let fasilitas = await sq.query(`select pf.id as penjualan_fasilitas_id, pf.*,mf.nama_fasilitas,mf.ms_jenis_fasilitas_id,mjf.nama_jenis_fasilitas,p.kode_penjualan  
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id
            join ms_jenis_fasilitas mjf on mjf.id = mf.ms_jenis_fasilitas_id
            join penjualan p on p.id = pf.penjualan_id
            where pf."deletedAt" isnull and p.registrasi_id = '${registrasi_id}'
            order by p.kode_penjualan,mf.nama_fasilitas`,s);
            let jasa = await sq.query(`select pj.id as penjualan_jasa_id,pj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mjj.nama_jenis_jasa,p.kode_penjualan  
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id
            join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id
            join penjualan p on p.id = pj.penjualan_id
            where pj."deletedAt" isnull and p.registrasi_id = '${registrasi_id}'
            order by p.kode_penjualan, mj.nama_jasa`,s);
            let penunjang = await sq.query(`select pp.id as penjualan_penunjang_id,pp.*,p.nama_penunjang,p.jenis_penunjang_id,
            p.tarif_cbg_id,p.satuan,p.parameter_normal,jp.nama_jenis_penunjang,p2.kode_penjualan 
            from penjualan_penunjang pp 
            join penunjang p on p.id = pp.penunjang_id  
            join jenis_penunjang jp on jp.id = p.jenis_penunjang_id
            join penjualan p2 on p2.id = pp.penjualan_id 
            where pp."deletedAt" isnull and p2.registrasi_id = '${registrasi_id}'
            order by p2.kode_penjualan,p.nama_penunjang`,s);

            res.status(200).json({ status: 200, message: "sukses", data:[{barang:barang,fasilitas:fasilitas,jasa:jasa,penunjang:penunjang}] });            
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsTarifCbgByTagihanId(req, res) {
        const { tagihan_id } = req.body

        try {
            let x = [{total:0,data:[]}]
            let data = await sq.query(`select t.tarif_cbg_id,t.kode_bridge,t.nama_tarif_cbg,sum(t.harga_barang_custom)as harga_total from 
            (select pb.penjualan_id,p.registrasi_id,mb.tarif_cbg_id,mb.nama_barang,pb.harga_barang_custom,tc.kode_bridge,tc.nama_tarif_cbg,pb."createdAt",pb."updatedAt",pb."deletedAt"
            from penjualan_barang pb 
            join ms_barang mb on mb.id = pb.ms_barang_id 
            join penjualan p on p.id = pb.penjualan_id
            join tarif_cbg tc on tc.id = mb.tarif_cbg_id
            where pb."deletedAt" isnull and p."deletedAt" isnull 
            union all
            select pf.penjualan_id,p.registrasi_id,mf.tarif_cbg_id,mf.nama_fasilitas,pf.harga_fasilitas_custom,tc.kode_bridge,tc.nama_tarif_cbg,pf."createdAt",pf."updatedAt",pf."deletedAt" 
            from penjualan_fasilitas pf 
            join ms_fasilitas mf on mf.id = pf.ms_fasilitas_id 
            join penjualan p on p.id = pf.penjualan_id 
            join tarif_cbg tc on tc.id = mf.tarif_cbg_id
            where pf."deletedAt" isnull and p."deletedAt" isnull 
            union all
            select pj.penjualan_id,p.registrasi_id,mj.tarif_cbg_id,mj.nama_jasa,pj.harga_jasa_custom ,tc.kode_bridge,tc.nama_tarif_cbg,pj."createdAt",pj."updatedAt",pj."deletedAt"
            from penjualan_jasa pj 
            join ms_jasa mj on mj.id = pj.ms_jasa_id 
            join penjualan p on p.id = pj.penjualan_id
            join tarif_cbg tc on tc.id = mj.tarif_cbg_id
            where pj."deletedAt" isnull and p."deletedAt" isnull
            union all
            select pp.penjualan_id,p2.registrasi_id,p.tarif_cbg_id,p.nama_penunjang,pp.harga_custom_penjualan_penunjang,tc.kode_bridge,tc.nama_tarif_cbg,pp."createdAt",pp."updatedAt",pp."deletedAt" 
            from penjualan_penunjang pp 
            join penunjang p on p.id = pp.penunjang_id
            join penjualan p2 on p2.id = pp.penjualan_id 
            join tarif_cbg tc on tc.id = p.tarif_cbg_id 
            where p."deletedAt" isnull and p."deletedAt" isnull) as t
            join pool_registrasi pr on pr.registrasi_id = t.registrasi_id
            where t."deletedAt" isnull and pr.tagihan_id = '${tagihan_id}'
            group by t.tarif_cbg_id,t.kode_bridge,t.nama_tarif_cbg
            order by t.kode_bridge,t.nama_tarif_cbg`,s);
            data.forEach(e => {x[0].total+=e.harga_total});
            if(data.length>0)x[0].data=data
            
            res.status(200).json({ status: 200, message: "sukses", data: x });            
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async listTagihanBPJS(req, res) {
        const {halaman,jumlah,pasien_id, kelas_kunjungan_id, ms_asuransi_id, ms_jenis_layanan_id, status_tagihan, nama_lengkap, kode_tagihan, jenis_kelamin, nik, no_rm, no_asuransi, tgl_tagihan_mulai, tgl_tagihan_selesai, tagihan_id} = req.body;

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if(pasien_id){
                isi+=` and t.pasien_id = '${pasien_id}'`
            }
            if(kelas_kunjungan_id){
                isi+=` and t.kelas_kunjungan_id = '${kelas_kunjungan_id}'`
            }
            if(ms_asuransi_id){
                isi+=` and t.ms_asuransi_id = '${ms_asuransi_id}'`
            }
            if(ms_jenis_layanan_id){
                isi+=` and t.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }
            if(nama_lengkap){
                isi+=` and p.nama_lengkap ilike '%${nama_lengkap}%'`
            }
            if(status_tagihan){
                isi+=` and t.status_tagihan = '${status_tagihan}'`
            }
            if(kode_tagihan){
                isi+=` and t.kode_tagihan ilike '%${kode_tagihan}%'`
            }
            if(jenis_kelamin){
                isi+=` and p.jenis_kelamin ilike '${jenis_kelamin}'`
            }
            if(nik){
                isi+=` and p.nik ilike'%${nik}%'`
            }
            if(no_rm){
                isi+=` and p.no_rm ilike '%${no_rm}%'`
            }
            if(no_asuransi){
                isi+=` and t.no_asuransi ilike '%${no_asuransi}%'`
            }
            if(tgl_tagihan_mulai){
                isi+=` and date(t.tgl_tagihan) >= '${tgl_tagihan_mulai}'`
            }
            if(tgl_tagihan_selesai){
                isi+=` and date(t.tgl_tagihan) <= '${tgl_tagihan_selesai}'`
            }
            if(tagihan_id){
                isi+=` and t.id = '${tagihan_id}'`
            }
            let data = await sq.query(`select t.id as tagihan_id, t.*,p.no_rm, p.tgl_lahir, p.tempat_lahir,p.jenis_kelamin, p.alamat_sekarang, p.alamat_ktp ,
            kk.nama_kelas_kunjungan,kk.ms_tarif_id,mt.nama_tarif ,ma.nama_asuransi,ma.tipe_asuransi,ma.ms_harga_id ,mh.nama_harga,
            mjl.nama_jenis_layanan,mjl.kode_jenis_layanan,mjl.kode_bridge
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull and ma.nama_asuransi in ('BPJS','KEMENKES')${isi} order by t."createdAt" desc ${pagination}`,s);
            let jml = await sq.query(`select count(*)as total
            from tagihan t 
            left join pasien p on p.id = t.pasien_id 
            join kelas_kunjungan kk on kk.id = t.kelas_kunjungan_id 
            join ms_asuransi ma on ma.id = t.ms_asuransi_id 
            join ms_jenis_layanan mjl on mjl.id = t.ms_jenis_layanan_id 
            join ms_tarif mt on mt.id = kk.ms_tarif_id 
            join ms_harga mh on mh.id = ma.ms_harga_id 
            where t."deletedAt" isnull and ma.nama_asuransi in ('BPJS','KEMENKES')${isi}`,s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }
}

module.exports = Controller