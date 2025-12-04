const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const sha1 = require('sha1');
const { QueryTypes } = require('sequelize');
const booking = require('./model');
const s = { type: QueryTypes.SELECT }

class Controller {

    static async registerDenganRM(req, res) {
        const { tgl_booking, jenis_booking, nik_booking, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, no_rm, flag_layanan, jadwal_dokter_id, user_id, tujuan_booking, pasien_id } = req.body

        try {
            let foto_surat_rujukan = ""
            if (req.files) {
                if (req.files.file1) {
                    foto_surat_rujukan = req.files.file1[0].filename
                }
            }
            let kode_sha1 = sha1(uuid_v4());
            let kode_booking = kode_sha1.substring(kode_sha1.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tgl_booking) = '${tgl_booking}' and b.status_booking > 0 `, s)
            // console.log(cekJumlah);

            if (cekJumlah[0].jumlah_booking < cekKuota[0].quota) {
                let data_booking = await booking.create({ id: uuid_v4(), tgl_booking, jenis_booking, nik_booking, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, no_rm, kode_booking, flag_layanan, jadwal_dokter_id, user_id, tujuan_booking, foto_surat_rujukan, pasien_id })
                res.status(200).json({ status: 200, message: "sukses", data: data_booking })
            } else {
                res.status(201).json({ status: 204, message: "kuota penuh" })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerTanpaRM(req, res) {
        const { tgl_booking, jenis_booking, nik_booking, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, jadwal_dokter_id, flag_layanan, user_id, tujuan_booking, pasien_id } = req.body

        try {
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let cekKuota = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal_dokter_id}' and date(b.tgl_booking) = '${tgl_booking}' and b.status_booking > 0 `, s)

            if (cekJumlah[0].jumlah_booking < cekKuota[0].quota) {
                let data_booking = await booking.create({ id: uuid_v4(), tgl_booking, jenis_booking, nik_booking, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, kode_booking, flag_layanan, jadwal_dokter_id, user_id, tujuan_booking, pasien_id })
                res.status(200).json({ status: 200, message: "sukses", data: data_booking })
            } else {
                res.status(201).json({ status: 204, message: "kuota penuh" })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static update(req, res) {
        const { id, tgl_booking, jenis_booking, nik_booking, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, no_rm, user_id, tujuan_booking, pasien_id } = req.body

        booking.update({ tgl_booking, jenis_booking, nik_booking, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, no_rm, user_id, tujuan_booking, pasien_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })

    }

    static async list(req, res) {
        const { tanggal_awal, tanggal_akhir, halaman, jumlah, status_booking, status_antrian, tgl_booking, booking_id } = req.body

        try {
            let isi = ''
            let offset=''
            let pagination=''
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (booking_id) {
                isi += ` and b.id = '${booking_id}' `
            }
            if (tanggal_awal) {
                isi += ` and b.tgl_booking >= ${tanggal_awal} `
            }
            if (tanggal_akhir) {
                isi += ` and b.tgl_booking <= ${tanggal_akhir} `
            }
            if (tgl_booking) {
                isi += ` and date(b.tgl_booking) = date('${tgl_booking}') `
            }
            if (status_booking) {
                isi += ` and b.status_booking = ${status_booking} `
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = ${status_antrian} `
            }
            console.log(isi)

            let data = await sq.query(`select b.id as "booking_id", al.id as antrian_list_id, * 
            from booking b
            join antrian_list al on al.booking_id = b.id 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            where b."deletedAt" isnull and jd."deletedAt" isnull${isi} order by b.id desc ${pagination}`, s)
            
            let jml = await sq.query(`select count(*)as total 
            from booking b 
            join antrian_list al on al.booking_id = b.id 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            where b."deletedAt" isnull and jd."deletedAt" isnull${isi} `, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async qr(req, res) {
        try {
            let text = req.query.text

            let data = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H', scale: 10 })

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listBookingByUserId(req, res) {
        let { user_id } = req.body
        try {
            let data = await sq.query(`select b.id as booking_id, u.username, u."role", b.*, md.*, mp.*, m.id as member_id 
            from booking b 
            join users u on u.id = b.user_id 
            join jadwal_dokter jd on jd.id = b.jadwal_dokter_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            left join "member" m on m.no_rm_pasien = b.no_rm 
            where b."deletedAt" isnull and u."deletedAt" isnull and b.user_id = '${user_id}' order by b."createdAt" desc`, s)
            
            for (let i = 0; i < data.length; i++) {
                if (data[i].no_rm) {
                    let data_pasien = await axios.get(purworejo + "/get-pasien?no=" + data[i].no_rm, config)
                    data[i].profil = data_pasien.data.data[0]
                }
            }

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsBookingByKodeBooking(req, res) {
        let { kode_booking } = req.params
        try {
            let data = await sq.query(`select b.id as booking_id,b.* , al.id as "antrian_list_id", al.tanggal_antrian ,al.is_master ,al.poli_layanan ,al.initial ,al.antrian_no ,al."sequence" ,al.is_cancel ,al.is_process ,al.status_antrian,al.poli_id as "antrian_list_poli_id" ,al.master_loket_id ,al.jenis_antrian_id, jd.* from booking b join jadwal_dokter jd on jd.id = b.jadwal_dokter_id left join antrian_list al on al.booking_id = b.id where b."deletedAt" isnull and b.kode_booking = '${kode_booking}'`, s)

            if (data.length == 0) {
                res.status(201).json({ status: 204, message: "data tidak ada" })
            } else {
                let kirim = await axios.get(purworejo + "/get-pasien?no=" + data[0].no_rm, config)

                data[0].no_bpjs = kirim.data.data[0].noBpjs

                res.status(200).json({ status: 200, message: "sukses", data })
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listAllBooking(req, res) {
        let { tgl_booking, jenis_booking, nik, nama_booking, no_hp_booking, no_rujukan, no_kontrol, status_booking, no_rm, kode_booking, flag_layanan, jadwal_dokter_id, user_id, ms_poliklinik_id } = req.body
        try {
            let tgl = moment().format('YYYY-MM-DD')
            let isi = ''
            if (tgl_booking) {
                isi += ` and b.tgl_booking = '${tgl_booking}' `
            }
            if (jenis_booking) {
                isi += ` and b.jenis_booking = '${jenis_booking}' `
            }
            if (nik) {
                isi += ` and b.nik = '${nik}' `
            }
            if (nama_booking) {
                isi += ` and b.nama_booking = '${nama_booking}' `
            }
            if (no_hp_booking) {
                isi += ` and b.no_hp_booking = '${no_hp_booking}' `
            }
            if (no_rujukan) {
                isi += ` and b.no_rujukan = '${no_rujukan}' `
            }
            if (no_kontrol) {
                isi += ` and b.no_kontrol = '${no_kontrol}' `
            }
            if (status_booking) {
                isi += ` and b.status_booking = '${status_booking}' `
            }
            if (no_rm) {
                isi += ` and b.no_rm = '${no_rm}' `
            }
            if (kode_booking) {
                isi += ` and b.kode_booking = '${kode_booking}' `
            }
            if (flag_layanan) {
                isi += ` and b.flag_layanan = '${flag_layanan}' `
            }
            if (jadwal_dokter_id) {
                isi += ` and b.jadwal_dokter_id = '${jadwal_dokter_id}' `
            }
            if (user_id) {
                isi += ` and b.user_id = '${user_id}' `
            }
            if (poli_id) {
                isi += ` and jd.ms_poliklinik_id = '${ms_poliklinik_id}' `
            }

            let data = await sq.query(`select b.id as "booking_id", * from booking b 
            left join jadwal_dokter jd on jd.id = b.jadwal_dokter_id 
            left join ms_dokter md on md.id = jd.ms_dokter_id 
            left join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
            left join users u on u.id = b.user_id 
            where b."deletedAt" isnull and date(b.tgl_booking) >= '${tgl}' and '${tgl}' <= date(b.tgl_booking) ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listBookingByTujuanBooking(req, res) {
        const { tujuan_booking } = req.body

        try {
            let data = await sq.query(`select b.id as "booking_id", * from booking b left join jadwal_dokter jd on jd.id = b.jadwal_dokter_id left join users u on u.id = b.user_id where b."deletedAt" isnull and b.tujuan_booking = ${tujuan_booking}`, s)

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

}

module.exports = Controller