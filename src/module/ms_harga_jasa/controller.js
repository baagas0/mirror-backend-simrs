const msHargaJasa = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { harga_beli, harga_jual, ms_jasa_id, ms_tarif_id, ms_harga_id } = req.body

        msHargaJasa.create({ id: uuid_v4(), harga_beli, harga_jual, ms_jasa_id, ms_tarif_id, ms_harga_id }).then(hasil2 => {
            res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, harga_beli, harga_jual, ms_jasa_id, ms_tarif_id, ms_harga_id } = req.body

        msHargaJasa.update({ harga_beli, harga_jual, ms_jasa_id, ms_tarif_id, ms_harga_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async updateBulk(req, res) {
        const { bulk_ms_harga_Jasa } = req.body

        try {
            await msHargaJasa.bulkCreate(bulk_ms_harga_Jasa, { updateOnDuplicate: ['harga_beli', 'harga_jual'] })
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async list(req, res) {
        const { halaman, jumlah, ms_tarif_id, ms_harga_id, ms_jasa_id } = req.body;

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (ms_tarif_id) {
                isi += ` and mhj.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and mhj.ms_harga_id = '${ms_harga_id}'`
            }
            if (ms_jasa_id) {
                isi += ` and mhj.ms_jasa_id = '${ms_jasa_id}'`
            }

            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull${isi}
            order by mhj."createdAt" desc ${pagination}`, s)
            let jml = await sq.query(`select count(*)
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull${isi} `, s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerHalaman(req, res) {
        const { halaman, jumlah, ms_tarif_id, ms_harga_id, ms_jasa_id, ms_jenis_jasa_id, nama_jasa } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;
            if (ms_tarif_id) {
                isi += ` and mhj.ms_tarif_id = '${ms_tarif_id}'`
            }
            if (ms_harga_id) {
                isi += ` and mhj.ms_harga_id = '${ms_harga_id}'`
            }
            if (ms_jasa_id) {
                isi += ` and mhj.ms_jasa_id = '${ms_jasa_id}'`
            }
            if (ms_jenis_jasa_id) {
                isi += ` and mj.ms_jenis_jasa_id = '${ms_jenis_jasa_id}'`
            }
            if (nama_jasa) {
                isi += ` and mj.nama_jasa ilike '%${nama_jasa}%'`
            }

            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id", mhj.*, mj.nama_jasa, mj.ms_jenis_jasa_id, mh.nama_harga, mh.keterangan, mt.nama_tarif, mt.keterangan, mjj.nama_jenis_jasa 
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id 
            where mhj."deletedAt" isnull ${isi} 
            order by mhj."createdAt" desc 
            limit ${jumlah} offset ${offset}`, s)

            let jml = await sq.query(`select count(*) as "total" 
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull ${isi} `, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaJasaByMsHargaMsTarifId(req, res) {
        const { ms_tarif_id, ms_harga_id } = req.body;

        try {
            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.ms_harga_id = '${ms_harga_id}' and and mhj.ms_tarif_id = '${ms_tarif_id}'
            order by mhj."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaJasaByMsHargaMsJasaId(req, res) {
        const { ms_harga_id, ms_jasa_id } = req.body;
        try {
            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.ms_harga_id = '${ms_harga_id}' and mhj.ms_jasa_id = '${ms_jasa_id}'
            order by mhj."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaJasaByMsHargaId(req, res) {
        const { ms_harga_id, ms_jasa_id } = req.body;
        try {
            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.ms_harga_id = '${ms_harga_id}'
            order by mhj."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaJasaByMsJasaId(req, res) {
        const { ms_jasa_id } = req.body
        try {
            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.ms_jasa_id = '${ms_jasa_id}'
            order by mhj."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaJasaByMsTarifId(req, res) {
        const { ms_tarif_id } = req.body
        try {
            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.ms_tarif_id = '${ms_tarif_id}'
            order by mhj."createdAt" desc`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMsHargaJasaPerHalaman(req, res) {
        const { halaman, jumlah, nama_jasa, nama_jenis_jasa, ms_jenis_jasa_id, ms_harga_id } = req.body
        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (nama_jasa) {
                isi += ` and mj.nama_jasa ilike '%${nama_jasa}%'`
            }
            if (nama_jenis_jasa) {
                isi += ` and mjj.nama_jenis_jasa ilike '%${nama_jenis_jasa}%'`
            }
            if (ms_jenis_jasa_id) {
                isi += ` and mj.ms_jenis_jasa_id='${ms_jenis_jasa_id}'`
            }

            let msJasa = await sq.query(`select mj.id as ms_jasa_id,mj.*,mjj.nama_jenis_jasa from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull ${isi} order by mj."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*)as total from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id where mj."deletedAt" isnull ${isi}`, s);
            let msHarga = await sq.query(`select mhj.id as ms_harga_jasa_id,mhj.*,mh.nama_harga,mt.nama_tarif from ms_harga_jasa mhj
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.ms_harga_id = '${ms_harga_id}'
            and mhj.ms_jasa_id in (select mj.id as ms_jasa_id from ms_jasa mj join ms_jenis_jasa mjj on mjj.id = mj.ms_jenis_jasa_id 
            where mj."deletedAt" isnull ${isi})`, s);

            for (let i = 0; i < msJasa.length; i++) {
                msJasa[i].nama_harga = msHarga.length > 0 ? msHarga[0].nama_harga : ""
                msJasa[i].harga_jasa = []
                for (let j = 0; j < msHarga.length; j++) {
                    if (msJasa[i].ms_jasa_id == msHarga[j].ms_jasa_id) {
                        msJasa[i].harga_jasa.push(msHarga[j])
                    }
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data: msJasa, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select mhj.id as "ms_harga_jasa_id",mhj.*,mj.nama_jasa,mj.ms_jenis_jasa_id,mh.nama_harga,mh.keterangan,mt.nama_tarif,mt.keterangan 
            from ms_harga_jasa mhj 
            join ms_jasa mj on mj.id = mhj.ms_jasa_id 
            join ms_harga mh on mh.id = mhj.ms_harga_id 
            join ms_tarif mt on mt.id = mhj.ms_tarif_id 
            where mhj."deletedAt" isnull and mhj.id = '${id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body

        msHargaJasa.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }
}

module.exports = Controller