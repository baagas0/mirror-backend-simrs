const OperasiBmhp = require('./model');
const penjualanBmhp = require('../penjualan_bmhp/model');
const penjualan = require('../penjualan/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {

    static async register(req, res) {
        const { jadwal_operasi_id, qty, ms_satuan_barang_id, harga_satuan, jenis, keterangan } = req.body
        const ms_barang_id = req.body['barang.nama_barang'];
        const user_id = req.dataUsers?.id || req.headers.user_id;

        let hasil_operasi_id = '';
        const hasil_operasi = await sq.query(`select id from hasil_operasi where jadwal_operasi_id = '${jadwal_operasi_id}' and "deletedAt" isnull`, s)
        if (hasil_operasi.length === 0) {
            // return res.status(400).json({ status: 400, message: "Hasil operasi tidak ditemukan untuk jadwal operasi tersebut." });
            hasil_operasi_id = uuid_v4();
            await sq.query(`insert into hasil_operasi (id, jadwal_operasi_id, "createdAt", "updatedAt") values 
            ('${hasil_operasi_id}', '${jadwal_operasi_id}', now(), now())`);
        } else {
            hasil_operasi_id = hasil_operasi[0].id;
        }

        OperasiBmhp.findAll({ where: { hasil_operasi_id, ms_barang_id, deletedAt: null } }).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            }
            else {
                await OperasiBmhp.create({
                    id: uuid_v4(),
                    hasil_operasi_id,
                    ms_barang_id,
                    qty: parseInt(qty),
                    ms_satuan_barang_id: ms_satuan_barang_id || null,
                    harga_satuan: parseFloat(harga_satuan),
                    total_harga: parseInt(qty) * parseFloat(harga_satuan),
                    jenis: jenis || 'BMHP',
                    keterangan: keterangan || '',
                    user_input_id: user_id,
                    status: 'draft',
                    waktu_input: new Date()
                }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, qty, harga_satuan, jenis, keterangan, status } = req.body

        // Calculate total harga if qty or harga_satuan changed
        const updateData = {};
        if (qty !== undefined) updateData.qty = parseInt(qty);
        if (harga_satuan !== undefined) updateData.harga_satuan = parseFloat(harga_satuan);
        if (jenis !== undefined) updateData.jenis = jenis;
        if (keterangan !== undefined) updateData.keterangan = keterangan;
        if (status !== undefined) updateData.status = status;

        // Recalculate total harga
        if (qty !== undefined || harga_satuan !== undefined) {
            OperasiBmhp.findOne({ where: { id } }).then(existingData => {
                const finalQty = qty !== undefined ? parseInt(qty) : existingData.qty;
                const finalHarga = harga_satuan !== undefined ? parseFloat(harga_satuan) : existingData.harga_satuan;
                updateData.total_harga = finalQty * finalHarga;

                OperasiBmhp.update(updateData, { where: { id } }).then(hasil => {
                    res.status(200).json({ status: 200, message: "sukses" })
                })
            })
        } else {
            OperasiBmhp.update(updateData, { where: { id } }).then(hasil => {
                res.status(200).json({ status: 200, message: "sukses" })
            })
        }
    }

    static async list(req, res) {
        const { halaman, jumlah, jenis, status, jadwal_operasi_id } = req.body
        let hasil_operasi_id = '';
        if (jadwal_operasi_id) {
            const hasil_operasi = await sq.query(`select id from hasil_operasi where jadwal_operasi_id = '${jadwal_operasi_id}' and "deletedAt" isnull`, s)
            if (hasil_operasi.length > 0) {
                hasil_operasi_id = hasil_operasi[0].id
            } else {
                return res.status(200).json({ status: 200, message: "sukses", data: [], count: 0, jumlah, halaman })
            }
        }
        try {
            let isi = ''
            let offset = ''
            let pagination = ''
            if (halaman && jumlah) {
                offset = (+halaman - 1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`
            }

            if (hasil_operasi_id) {
                isi += ` and ob.hasil_operasi_id = '${hasil_operasi_id}'`
            }

            if (jenis) {
                isi += ` and ob.jenis ilike '%${jenis}%'`
            }

            if (status) {
                isi += ` and ob.status = '${status}'`
            }

            let data = await sq.query(`select ob.*, mb.nama_barang, mb.kode_produk, msb.nama_satuan from operasi_bmhp ob
                left join ms_barang mb on ob.ms_barang_id = mb.id and mb."deletedAt" isnull
                left join ms_satuan_barang msb on ob.ms_satuan_barang_id = msb.id and msb."deletedAt" isnull
                where ob."deletedAt" isnull${isi} order by ob."createdAt" desc ${pagination}`, s)
            let jml = await sq.query(`select count(*) from operasi_bmhp ob where ob."deletedAt" isnull${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select ob.*, mb.nama_barang, mb.kode_produk, msb.nama_satuan, u.username from operasi_bmhp ob
                left join ms_barang mb on ob.ms_barang_id = mb.id and mb."deletedAt" isnull
                left join ms_satuan_barang msb on ob.ms_satuan_barang_id = msb.id and msb."deletedAt" isnull
                left join users u on ob.user_input_id = u.id and u."deletedAt" isnull
                where ob."deletedAt" isnull and ob.id = '${id}'`, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        OperasiBmhp.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async setConfirmed(req, res) {
        console.log('===> controller.js:132 ~ req', req);
        const { id } = req.params;

        try {
            let operasiBmhpData = await sq.query(`
                select ob.*, ho.jadwal_operasi_id, jo.registrasi_id
                from operasi_bmhp ob
                join hasil_operasi ho on ho.id = ob.hasil_operasi_id
                join jadwal_operasi jo on jo.id = ho.jadwal_operasi_id
                where ob."deletedAt" isnull and ob.id = '${id}'
            `, s);

            if (operasiBmhpData.length == 0) {
                return res.status(404).json({ status: 404, message: "operasi_bmhp tidak ditemukan" })
            }

            if (operasiBmhpData[0].status === 'confirmed') {
                return res.status(201).json({ status: 204, message: "operasi_bmhp sudah confirmed" })
            }

            await sq.transaction(async t => {
                await OperasiBmhp.update({ status: 'confirmed' }, { where: { id }, transaction: t });

                let existingPenjualan = await sq.query(`
                    select id from penjualan 
                    where "deletedAt" isnull 
                    and registrasi_id = '${operasiBmhpData[0].registrasi_id}' 
                    order by "createdAt" desc
                    limit 1
                `, { ...s, transaction: t });

                let penjualanId;
                if (existingPenjualan.length > 0) {
                    penjualanId = existingPenjualan[0].id;
                } else {
                    let newPenjualan = await penjualan.create({
                        id: uuid_v4(),
                        tgl_penjualan: new Date(),
                        is_bmhp: true,
                        registrasi_id: operasiBmhpData[0].registrasi_id,
                        status_penjualan: 1,
                        harga_total_barang: 0,
                        harga_total_jasa: 0,
                        harga_total_fasilitas: 0,
                        harga_total_bmhp: 0,
                        discount: 0,
                        tax: 0,
                        total_penjualan: 0
                    }, { transaction: t });
                    penjualanId = newPenjualan.id;
                }

                // Create penjualan_bmhp
                await penjualanBmhp.create({
                    id: uuid_v4(),
                    operasi_bmhp_id: id,
                    penjualan_id: penjualanId,
                    qty: operasiBmhpData[0].qty,
                    harga_satuan: operasiBmhpData[0].harga_satuan,
                    total_harga: operasiBmhpData[0].total_harga,
                    jenis: operasiBmhpData[0].jenis,
                    keterangan: operasiBmhpData[0].keterangan,
                    status_penjualan_bmhp: 1
                }, { transaction: t });

                // Hitung total semua penjualan_bmhp untuk penjualan ini
                let totalBmhp = await sq.query(`
                    select COALESCE(sum(total_harga), 0) as total_bmhp 
                    from penjualan_bmhp 
                    where "deletedAt" isnull and penjualan_id = '${penjualanId}'
                `, { ...s, transaction: t });

                // Update total penjualan dengan total BMHP
                let totalBmhpValue = parseFloat(totalBmhp[0].total_bmhp) || 0;
                await penjualan.update({
                    harga_total_bmhp: totalBmhpValue,
                }, { where: { id: penjualanId }, transaction: t });
            });

            res.status(200).json({ status: 200, message: "sukses, operasi_bmhp confirmed dan penjualan_bmhp telah dibuat" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static setCancelled(req, res) {
        const { id } = req.params;

        OperasiBmhp.update({ status: 'cancelled' }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

}

module.exports = Controller