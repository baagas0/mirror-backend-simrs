const jadwalOperasi = require('./model');
const hasilOperasi = require('../hasil_operasi/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const sha1 = require('sha1');
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');

class Controller {

    static register(req, res) {
        const { registrasi_id, ms_kelas_kamar_id, ms_ruang_id, tanggal_operasi, waktu_mulai, waktu_selesai, ms_dokter_id, ms_jasa_id, remark, ms_poliklinik_id } = req.body
        
        let kode_sha1 = sha1(uuid_v4());
        let kode_booking = kode_sha1.substring(kode_sha1.length - 6).toUpperCase();
        
        jadwalOperasi.findAll({ where: { registrasi_id, tanggal_operasi: { [Op.gte]: moment(tanggal_operasi) }, waktu_mulai, waktu_selesai, ms_poliklinik_id }}).then(async hasil1 => {
            if (hasil1.length) {
                res.status(201).json({ status: 204, message: "jadwal sudah ada." });
            }
            else {
                await jadwalOperasi.create({ id: uuid_v4(), kode_booking, registrasi_id, ms_kelas_kamar_id, ms_ruang_id, tanggal_operasi, waktu_mulai, waktu_selesai, ms_dokter_id, ms_jasa_id, remark, ms_poliklinik_id }).then(hasil2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: hasil2 })
                })
            }
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static update(req, res) {
        const { id, registrasi_id, ms_kelas_kamar_id, ms_ruang_id, tanggal_operasi, waktu_mulai, waktu_selesai, ms_dokter_id, ms_jasa_id, remark, ms_poliklinik_id } = req.body
        jadwalOperasi.update({ registrasi_id, ms_kelas_kamar_id, ms_ruang_id, tanggal_operasi, waktu_mulai, waktu_selesai, ms_dokter_id, ms_jasa_id, remark, ms_poliklinik_id }, { where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const {halaman,jumlah,registrasi_id,ms_kelas_kamar_id,ms_ruang_id,tanggal_operasi,waktu_mulai,waktu_selesai,ms_dokter_id,ms_jasa_id, ms_poliklinik_id} = req.body
        try {
            let isi = ''
            let offset=''
            let pagination=''
            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            let whereClause = '';

            if (registrasi_id) {
                whereClause += ` and jo.registrasi_id = '${registrasi_id}'`;
            }

            if (ms_kelas_kamar_id) {
                whereClause += ` and jo.ms_kelas_kamar_id = '${ms_kelas_kamar_id}'`;
            }

            if (ms_ruang_id) {
                whereClause += ` and jo.ms_ruang_id = '${ms_ruang_id}'`;
            }

            if (tanggal_operasi) {
                whereClause += ` and to_char(jo.tanggal_operasi, 'YYYY-MM-DD') = '${tanggal_operasi}'`;
            }

            if (waktu_mulai) {
                whereClause += ` and jo.waktu_mulai = '${waktu_mulai}'`;
            }

            if (waktu_selesai) {
                whereClause += ` and jo.waktu_selesai = '${waktu_selesai}'`;
            }

            if (ms_dokter_id) {
                whereClause += ` and jo.ms_dokter_id = '${ms_dokter_id}'`;
            }

            if (ms_jasa_id) {
                whereClause += ` and jo.ms_jasa_id = '${ms_jasa_id}'`;
            }
            if (ms_poliklinik_id) {
                whereClause += ` and jo.ms_poliklinik_id = '${ms_poliklinik_id}'`;
            }

            let data = await sq.query(`
                select 
                    jo.id as jadwal_operasi_id, 
                    (
                        select json_agg(json_build_object(
                            'tanggal', dd.tanggal,
                            'tipe', dd.tipe,
                            'kode_diagnosa', dd.kode_diagnosa,
                            'nama_diagnosa', dd.nama_diagnosa
                        ))
                        from data_diagnosa dd 
                        where dd.registrasi_id = r.id
                    ) as data_diagnosa,
                    *,
                    (select mapping_operasi from hasil_operasi mo where mo.jadwal_operasi_id = jo.id) as data_mapping_operasi,
                    (select ho.id from hasil_operasi ho where ho.jadwal_operasi_id = jo.id) as hasil_operasi_id
                from jadwal_operasi jo 
                LEFT JOIN registrasi r ON jo.registrasi_id = r.id
                LEFT JOIN pasien p on p.id = r.pasien_id
                LEFT JOIN ms_kelas_kamar k ON jo.ms_kelas_kamar_id = k.id
                LEFT JOIN ms_ruang ru ON jo.ms_ruang_id = ru.id
                LEFT JOIN ms_dokter d ON jo.ms_dokter_id = d.id
                LEFT JOIN ms_jasa m ON jo.ms_jasa_id = m.id
                where jo."deletedAt" isnull ${whereClause} 
                order by jo."createdAt" 
                desc ${pagination}
            `, s)
            let jml = await sq.query(`
                select count(*) 
                from jadwal_operasi jo 
                LEFT JOIN registrasi r ON jo.registrasi_id = r.id
                LEFT JOIN pasien p on p.id = r.pasien_id
                LEFT JOIN ms_kelas_kamar k ON jo.ms_kelas_kamar_id = k.id
                LEFT JOIN ms_ruang ru ON jo.ms_ruang_id = ru.id
                LEFT JOIN ms_dokter d ON jo.ms_dokter_id = d.id
                LEFT JOIN ms_jasa m ON jo.ms_jasa_id = m.id
                where jo."deletedAt" isnull ${whereClause}
            `,s)

            data = data.map((x) => {
                return {
                    ...x,
                    data_diagnosa: x.data_diagnosa ? x.data_diagnosa : []
                }
            })

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`
                select 
                    jo.id as jadwal_operasi_id, 
                    (
                        select json_agg(json_build_object(
                            'tanggal', dd.tanggal,
                            'tipe', dd.tipe,
                            'kode_diagnosa', dd.kode_diagnosa,
                            'nama_diagnosa', dd.nama_diagnosa
                        ))
                        from data_diagnosa dd 
                        where dd.registrasi_id = r.id
                    ) as data_diagnosa,
                    *,
                    (select ho.id from hasil_operasi ho where ho.jadwal_operasi_id = jo.id) as hasil_operasi_id
                    
                from jadwal_operasi jo 
                LEFT JOIN registrasi r ON jo.registrasi_id = r.id
                LEFT JOIN pasien p on p.id = r.pasien_id
                LEFT JOIN ms_kelas_kamar k ON jo.ms_kelas_kamar_id = k.id
                LEFT JOIN ms_ruang ru ON jo.ms_ruang_id = ru.id
                LEFT JOIN ms_dokter d ON jo.ms_dokter_id = d.id
                LEFT JOIN ms_jasa m ON jo.ms_jasa_id = m.id
                where jo."deletedAt" isnull and jo.id = '${id}'
            `, s)
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static delete(req, res) {
        const { id } = req.body
        jadwalOperasi.destroy({ where: { id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    // Kalau masih menunggu bisa dibatalkan
    static async set_batal(req, res) {
        const { jadwal_operasi_id } = req.body
        
        try {
            const jadwal_operasi = await jadwalOperasi.findOne({ where: { id: jadwal_operasi_id } })
            if (!jadwal_operasi) throw new Error("Jadwal Operasi tidak ditemukan")
            if (jadwal_operasi.status === 0) throw new Error("Tidak dapat membatalkan jadwal operasi, jadwal telah dibatalkan.")
            // if (jadwal_operasi.status === 1) throw new Error("Tidak dapat membatalkan jadwal operasi, status masih menunggu.")
            // if (jadwal_operasi.status === 2) throw new Error("Tidak dapat membatalkan jadwal operasi, status telah diproses.")
            if (jadwal_operasi.status === 3) throw new Error("Status operasi telah selesai.")

            await jadwalOperasi.update({ status: 0 }, { where: { id: jadwal_operasi_id } })

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ status: 500, message: error.message ?? 'gagal' })
        }
    }

    // Kalau masih menunggu bisa lanjutkan ke proses
    static async set_menunggu(req, res) {
        const { jadwal_operasi_id } = req.body
        
        try {
            const jadwal_operasi = await jadwalOperasi.findOne({ where: { id: jadwal_operasi_id } })
            console.log('jadwal_operasi', jadwal_operasi.status)
            if (!jadwal_operasi) throw new Error("Jadwal Operasi tidak ditemukan")
            if (jadwal_operasi.status === 0) throw new Error("Tidak dapat memproses jadwal operasi, jadwal telah dibatalkan.")
            // if (jadwal_operasi.status === 1) throw new Error("Tidak dapat memproses jadwal operasi, status masih menunggu.")
            // if (jadwal_operasi.status === 2) throw new Error("Tidak dapat memproses jadwal operasi, status telah diproses.")
            if (jadwal_operasi.status === 3) throw new Error("Status operasi telah selesai.")

            await jadwalOperasi.update({ status: 1 }, { where: { id: jadwal_operasi_id } })

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ status: 500, message: error.message ?? 'gagal' })
        }
    }

    // Kalau masih menunggu bisa lanjutkan ke proses
    static async set_proses(req, res) {
        const { jadwal_operasi_id } = req.body
        
        try {
            const jadwal_operasi = await jadwalOperasi.findOne({ where: { id: jadwal_operasi_id } })
            console.log('jadwal_operasi', jadwal_operasi.status)
            if (!jadwal_operasi) throw new Error("Jadwal Operasi tidak ditemukan")
            if (jadwal_operasi.status === 0) throw new Error("Tidak dapat memproses jadwal operasi, jadwal telah dibatalkan.")
            // if (jadwal_operasi.status === 1) throw new Error("Tidak dapat memproses jadwal operasi, status masih menunggu.")
            if (jadwal_operasi.status === 2) throw new Error("Tidak dapat memproses jadwal operasi, status telah diproses.")
            if (jadwal_operasi.status === 3) throw new Error("Status operasi telah selesai.")

            await jadwalOperasi.update({ status: 2 }, { where: { id: jadwal_operasi_id } })

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ status: 500, message: error.message ?? 'gagal' })
        }
    }

    // status harus dalam proses, baru bisa menyelesaikan
    static async set_selesai(req, res) {
        const { jadwal_operasi_id } = req.body
        
        try {
            const jadwal_operasi = await jadwalOperasi.findOne({ where: { id: jadwal_operasi_id } })
            if (!jadwal_operasi) throw new Error("Jadwal Operasi tidak ditemukan")
            if (jadwal_operasi.status === 0) throw new Error("Tidak dapat menyelesaikan jadwal operasi, jadwal telah dibatalkan.")
            if (jadwal_operasi.status === 1) throw new Error("Tidak dapat menyelesaikan jadwal operasi, status masih menunggu.")
            if (jadwal_operasi.status === 3) throw new Error("Status operasi telah selesai.")

            const hasil_operasi = await hasilOperasi.findOne({ where: { jadwal_operasi_id } })
            if (!hasil_operasi) throw new Error("Tidak dapat menyelesaikan jadwal operasi, hasil operasi belum diinput.")
            if (!hasil_operasi.laporan_operasi) throw new Error("Anda harus mengiri laporan operasi terlebih dahulu.")

            await jadwalOperasi.update({ status: 3 }, { where: { id: jadwal_operasi_id } })
            await jadwalOperasi.update({ tanggal_selesai: moment() }, { where: { jadwal_operasi_id } })

            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ status: 500, message: error.message ?? 'gagal' })
        }
    }

    // API untuk Pasien Operasi - data pasien yang akan/selesai operasi
    static async pasienOperasiList(req, res) {
        const { halaman, jumlah, status, tanggal_mulai, tanggal_selesai, ms_ruang_id, ms_dokter_id, cari } = req.body

        try {
            let isi = ''
            let offset = ''
            let pagination = ''
            if (halaman && jumlah) {
                offset = (+halaman - 1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`
            }

            let whereClause = '';

            // Filter berdasarkan status operasi: 1=menunggu/akan operasi, 3=selesai operasi
            if (status) {
                if (status === 'akan_operasi') {
                    whereClause += ` and jo.status IN (1, 2)`; // menunggu atau proses
                } else if (status === 'selesai_operasi') {
                    whereClause += ` and jo.status = 3`; // selesai
                } else if (status === 'batal') {
                    whereClause += ` and jo.status = 0`; // batal
                } else {
                    whereClause += ` and jo.status = ${status}`;
                }
            }

            // Filter berdasarkan rentang tanggal
            if (tanggal_mulai && tanggal_selesai) {
                whereClause += ` and jo.tanggal_operasi::date >= '${tanggal_mulai}' and jo.tanggal_operasi::date <= '${tanggal_selesai}'`;
            } else if (tanggal_mulai) {
                whereClause += ` and jo.tanggal_operasi::date >= '${tanggal_mulai}'`;
            } else if (tanggal_selesai) {
                whereClause += ` and jo.tanggal_operasi::date <= '${tanggal_selesai}'`;
            }

            // Filter berdasarkan ruangan
            if (ms_ruang_id) {
                whereClause += ` and jo.ms_ruang_id = '${ms_ruang_id}'`;
            }

            // Filter berdasarkan dokter
            if (ms_dokter_id) {
                whereClause += ` and jo.ms_dokter_id = '${ms_dokter_id}'`;
            }

            // Pencarian berdasarkan nama pasien atau kode booking
            if (cari) {
                whereClause += ` and (lower(p.nama) like lower('%${cari}%') or lower(jo.kode_booking) like lower('%${cari}%'))`;
            }

            let data = await sq.query(`
                select
                    jo.id as jadwal_operasi_id,
                    jo.kode_booking,
                    jo.status,
                    jo.tanggal_operasi,
                    jo.waktu_mulai,
                    jo.waktu_selesai,
                    jo.remark,
                    jo."createdAt" as jadwal_dibuat,
                    jo."updatedAt" as jadwal_diupdate,
                    -- Data pasien
                    p.id as pasien_id,
                    p.no_rm,
                    p.nama as nama_pasien,
                    p.tanggal_lahir,
                    p.jenis_kelamin,
                    p.alamat,
                    p.no_hp,
                    -- Data registrasi
                    r.id as registrasi_id,
                    r.no_registrasi,
                    r.tanggal_registrasi,
                    -- Data ruangan
                    ru.id as ruang_id,
                    ru.nama_ruang,
                    ru.kode_ruang,
                    -- Data kelas kamar
                    k.id as kelas_id,
                    k.nama_kelas,
                    -- Data dokter
                    d.id as dokter_id,
                    d.nama_dokter,
                    d.kode_dokter,
                    -- Data poliklinik
                    pol.id as poliklinik_id,
                    pol.nama_poliklinik,
                    pol.kode_poliklinik,
                    -- Data jasa
                    j.id as jasa_id,
                    j.nama_jasa,
                    j.kode_jasa,
                    -- Status label
                    case
                        when jo.status = 0 then 'Dibatalkan'
                        when jo.status = 1 then 'Menunggu'
                        when jo.status = 2 then 'Sedang Proses'
                        when jo.status = 3 then 'Selesai'
                        else 'Status Tidak Diketahui'
                    end as status_label,
                    -- Hitung umur pasien
                    EXTRACT(YEAR FROM AGE(p.tanggal_lahir)) as umur_tahun,
                    EXTRACT(MONTH FROM AGE(p.tanggal_lahir)) as umur_bulan,
                    -- Data diagnosa (jika ada)
                    (
                        select json_agg(json_build_object(
                            'tanggal', dd.tanggal,
                            'tipe', dd.tipe,
                            'kode_diagnosa', dd.kode_diagnosa,
                            'nama_diagnosa', dd.nama_diagnosa
                        ))
                        from data_diagnosa dd
                        where dd.registrasi_id = r.id
                    ) as data_diagnosa
                from jadwal_operasi jo
                LEFT JOIN registrasi r ON jo.registrasi_id = r.id
                LEFT JOIN pasien p on p.id = r.pasien_id
                LEFT JOIN ms_kelas_kamar k ON jo.ms_kelas_kamar_id = k.id
                LEFT JOIN ms_ruang ru ON jo.ms_ruang_id = ru.id
                LEFT JOIN ms_dokter d ON jo.ms_dokter_id = d.id
                LEFT JOIN ms_jasa j ON jo.ms_jasa_id = j.id
                LEFT JOIN ms_poliklinik pol ON jo.ms_poliklinik_id = pol.id
                where jo."deletedAt" isnull ${whereClause}
                order by jo.tanggal_operasi asc, jo.waktu_mulai asc
                ${pagination}
            `, s)

            let jml = await sq.query(`
                select count(*)
                from jadwal_operasi jo
                LEFT JOIN registrasi r ON jo.registrasi_id = r.id
                LEFT JOIN pasien p on p.id = r.pasien_id
                LEFT JOIN ms_kelas_kamar k ON jo.ms_kelas_kamar_id = k.id
                LEFT JOIN ms_ruang ru ON jo.ms_ruang_id = ru.id
                LEFT JOIN ms_dokter d ON jo.ms_dokter_id = d.id
                LEFT JOIN ms_jasa j ON jo.ms_jasa_id = j.id
                LEFT JOIN ms_poliklinik pol ON jo.ms_poliklinik_id = pol.id
                where jo."deletedAt" isnull ${whereClause}
            `, s)

            data = data.map((x) => {
                return {
                    ...x,
                    data_diagnosa: x.data_diagnosa ? x.data_diagnosa : []
                }
            })

            res.status(200).json({
                status: 200,
                message: "sukses",
                data,
                count: jml[0].count,
                jumlah,
                halaman
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    // Details pasien operasi berdasarkan ID jadwal
    static async pasienOperasiDetails(req, res) {
        const { id } = req.body

        try {
            let data = await sq.query(`
                select
                    jo.id as jadwal_operasi_id,
                    jo.kode_booking,
                    jo.status,
                    jo.tanggal_operasi,
                    jo.waktu_mulai,
                    jo.waktu_selesai,
                    jo.remark,
                    jo."createdAt" as jadwal_dibuat,
                    jo."updatedAt" as jadwal_diupdate,
                    -- Data pasien
                    p.id as pasien_id,
                    p.no_rm,
                    p.nama as nama_pasien,
                    p.tanggal_lahir,
                    p.jenis_kelamin,
                    p.alamat,
                    p.no_hp,
                    p.tempat_lahir,
                    p.gol_darah,
                    p.pekerjaan,
                    p.agama,
                    p.status_nikah,
                    -- Data registrasi
                    r.id as registrasi_id,
                    r.no_registrasi,
                    r.tanggal_registrasi,
                    -- Data ruangan
                    ru.id as ruang_id,
                    ru.nama_ruang,
                    ru.kode_ruang,
                    -- Data kelas kamar
                    k.id as kelas_id,
                    k.nama_kelas,
                    -- Data dokter
                    d.id as dokter_id,
                    d.nama_dokter,
                    d.kode_dokter,
                    d.spesialisasi,
                    -- Data poliklinik
                    pol.id as poliklinik_id,
                    pol.nama_poliklinik,
                    pol.kode_poliklinik,
                    -- Data jasa
                    j.id as jasa_id,
                    j.nama_jasa,
                    j.kode_jasa,
                    -- Status label
                    case
                        when jo.status = 0 then 'Dibatalkan'
                        when jo.status = 1 then 'Menunggu'
                        when jo.status = 2 then 'Sedang Proses'
                        when jo.status = 3 then 'Selesai'
                        else 'Status Tidak Diketahui'
                    end as status_label,
                    -- Hitung umur pasien lengkap
                    EXTRACT(YEAR FROM AGE(p.tanggal_lahir)) as umur_tahun,
                    EXTRACT(MONTH FROM AGE(p.tanggal_lahir)) as umur_bulan,
                    EXTRACT(DAY FROM AGE(p.tanggal_lahir)) as umur_hari,
                    -- Data diagnosa lengkap
                    (
                        select json_agg(json_build_object(
                            'tanggal', dd.tanggal,
                            'tipe', dd.tipe,
                            'kode_diagnosa', dd.kode_diagnosa,
                            'nama_diagnosa', dd.nama_diagnosa
                        ))
                        from data_diagnosa dd
                        where dd.registrasi_id = r.id
                    ) as data_diagnosa,
                    -- Data hasil operasi (jika sudah selesai)
                    (
                        select json_build_object(
                            'id', ho.id,
                            'laporan_operasi', ho.laporan_operasi,
                            'catatan_anestesi', ho.catatan_anestesi,
                            'komplikasi', ho.komplikasi,
                            'tindakan', ho.tindakan,
                            'dokter_anestesi', ho.dokter_anestesi,
                            'dokter_operator', ho.dokter_operator,
                            'perawat_circulating', ho.perawat_circulating,
                            'perawat_instrument', ho.perawat_instrument
                        )
                        from hasil_operasi ho
                        where ho.jadwal_operasi_id = jo.id
                    ) as hasil_operasi
                from jadwal_operasi jo
                LEFT JOIN registrasi r ON jo.registrasi_id = r.id
                LEFT JOIN pasien p on p.id = r.pasien_id
                LEFT JOIN ms_kelas_kamar k ON jo.ms_kelas_kamar_id = k.id
                LEFT JOIN ms_ruang ru ON jo.ms_ruang_id = ru.id
                LEFT JOIN ms_dokter d ON jo.ms_dokter_id = d.id
                LEFT JOIN ms_jasa j ON jo.ms_jasa_id = j.id
                LEFT JOIN ms_poliklinik pol ON jo.ms_poliklinik_id = pol.id
                where jo."deletedAt" isnull and jo.id = '${id}'
            `, s)

            if (data.length === 0) {
                return res.status(404).json({ status: 404, message: "Data pasien operasi tidak ditemukan" })
            }

            let result = data[0];
            result.data_diagnosa = result.data_diagnosa ? result.data_diagnosa : [];
            result.hasil_operasi = result.hasil_operasi ? result.hasil_operasi : null;

            res.status(200).json({ status: 200, message: "sukses", data: result })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

}

module.exports = Controller