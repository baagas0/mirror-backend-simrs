const { sq } = require("../../../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const sha1 = require('sha1');
const { QueryTypes, json, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const axios = require('axios');
const moment = require('moment');
const pcare = require('../../../../helper/pcare');
const jwt = require("../../../../helper/jwt");
const jadwalDokter = require("../../../jadwal_dokter/model");

const pasienModel = require('../../../pasien/model');
const bookingModel = require('../../../booking/model');
const antrian_listModel = require('../../../antrian_list/model');

const { buildFilter } = require("../../../../helper/general");

let buildResponse = (status, data) => {
    let res = {
        "metadata": {
            "message": status.message ? status.message : (status.code == 200 ? 'Ok' : (status == 200 ? 'Ok' : 'Error')),
            "code": status.code ? status.code : status
        }
    }
    if(data != null) res["response"] = data;

    return res
}

// Fungsi untuk menghitung estimasi waktu dilayani dalam milidetik berdasarkan jadwal dan jumlah antrian
function calculateEstimasiDilayani(jadwal, jumlahAntrian) {
    const jadwalDokterISO = `${jadwal.tgl_jadwal_date} ${jadwal.waktu_mulai}`;
    const waktuMulaiInMillis = new Date(jadwalDokterISO).getTime() + (parseInt(jumlahAntrian) * 15 * 60 * 1000); // 15 menit per antrian

    return waktuMulaiInMillis;
}

class Controller {

    static async token(req, res) {
        try {
            // console.log(req.headers)
            const username = req.headers['x-username']
            const password = req.headers['x-password']

            const staticCredential = {
                username: 'bpjs',
                password: 'bpjswsrsss', 

                agent: req.header('user-agent'), // User Agent we get from headers
                referrer: req.header('referrer'), //  Likewise for referrer
                ip: req.header('x-forwarded-for') || req.connection.remoteAddress,
            }

            if (staticCredential.username !== username || staticCredential.password !== password) {
                res.status(403).json(buildResponse({ code: 403, message: 'Username/Kata sandi tidak sesuai.' }, {token : ''}))
                // process.exit()
                return;
            }

            const token = jwt.generateToken({
                service: 'antrean_rs_wsrs',
                ...staticCredential
            });

            res.status(200).json(buildResponse(200, {token : token}))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, {token : ''}))
        }
    }

    static async ambil_antrean(req, res) {
        try {
            // get request body
            const { nomorkartu, nik, nohp, kodepoli, norm, tanggalperiksa, kodedokter, jampraktek, jeniskunjungan, nomorreferensi } = req.body;

            const pasiens = await sq.query(`select * from pasien where no_rm = '${norm}' and nik = '${nik}'`, s);
            if  (!pasiens || pasiens.length == 0) {
                res.status(201).json(buildResponse({ code: 201, message: 'Pasien tidak ditemukan' }, null))
                return;
            }
            
            const pasien = pasiens[0];
            // cari jadwal & cek kuota
            let jampraktekArray = jampraktek.split('-')
            const queryJadwal = await sq.query(`
                select jd.id as jadwal_dokter_id, to_char(jd.tgl_jadwal, 'YYYY-MM-DD') as tgl_jadwal_date, *
                    from jadwal_dokter jd 
                    join ms_dokter md on md.id = jd.ms_dokter_id 
                    join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
                    
                where true 
                    and md.kode_bpjs = '${kodedokter}'
                    and date(jd.tgl_jadwal) = '${tanggalperiksa}'
                    and jd.waktu_mulai = '${jampraktekArray[0]}'
                    and jd.waktu_selesai = '${jampraktekArray[1]}'
                    and mp.kode_poli_bpjs = '${kodepoli}'
            `, s);
            if(queryJadwal.length == 0) {
                res.status(201).json(buildResponse({ code: 201, message: 'Jadwal tidak ditemukan' }, null))
                return;
            }
            const jadwal = queryJadwal[0]

            console.log(queryJadwal, jadwal);
        
            let cekJumlah = await sq.query(`select count(*) as "jumlah_booking" from booking b where b."deletedAt" isnull and b.jadwal_dokter_id = '${jadwal.jadwal_dokter_id}' and date(b.tgl_booking) = '${tanggalperiksa}' and b.status_booking > 0 `, s)
            let jumlah_booking = parseInt(cekJumlah[0].jumlah_booking)
            let sisaQuota = jadwal.quota_jkn - jumlah_booking
            if (sisaQuota < 1) res.status(201).json(buildResponse({ code: 201, message: 'Kuota mobile jkn telah habis.' }, null))
            console.log('quota', jadwal.quota_jkn, 'jumlah_booking', jumlah_booking)

            // Proses buat booking
            let k = sha1(uuid_v4());
            let kode_booking = k.substring(k.length - 6).toUpperCase();
            let data_booking = await bookingModel.create({ 
                id: uuid_v4(), 
                tgl_booking: tanggalperiksa, 
                jenis_booking: 'mobile', 
                nik_booking: nik, 
                no_rm: pasien.no_rm, 
                nama_booking: pasien.nama_lengkap, 
                no_hp_booking: nohp, 
                no_rujukan: nomorreferensi, 
                no_kontrol: nomorreferensi, 
                status_booking: 1, 
                kode_booking: kode_booking, 
                flag_layanan: 1, 
                jadwal_dokter_id: jadwal.jadwal_dokter_id, 
                flag_kedatangan: 0,
                // user_id, 
                tujuan_booking: jeniskunjungan == 3 ? 3 : 2, // 1: mandiri || 2:rujukan || 3:kontrol 
                pasien_id : pasien.id
            })

            let antrian_no = jumlah_booking + 1
            let antrian = await antrian_listModel.create({
                id: uuid_v4(), 
                tgl_antrian: tanggalperiksa,
                is_master: 1,
                poli_layanan: 2,
                initial: 'JKN',
                antrian_no: antrian_no,
                sequence: antrian_no,
                status_antrian: 0, // Status batal dulu, nunggu orang nya checkin baru dirubah ke 1
                kode_booking_bpjs: kode_booking,
                booking_id: data_booking.id,
                jadwal_dokter_id: jadwal.jadwal_dokter_id,
            })
            const estimasi = calculateEstimasiDilayani(jadwal, jumlah_booking)
            
            res.status(200).json(buildResponse(200, {
                "nomorantrean": `JKN-${antrian_no}`,
                "angkaantrean": antrian_no,
                "kodebooking": kode_booking,
                "norm": pasien.no_rm,
                "namapoli": jadwal.nama_poliklinik,
                "namadokter": jadwal.nama_dokter,
                "estimasidilayani": estimasi,
                "sisakuotajkn": (sisaQuota-1),
                "kuotajkn": jadwal.quota_jkn,
                "sisakuotanonjkn": jadwal.quota_booking,
                "kuotanonjkn": jadwal.quota_booking,
                "keterangan": "Peserta harap 60 menit lebih awal guna pencatatan administrasi."
            }))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, null))
        }

    }

    static async status_antrean(req, res) {
        try {
            // get request body
            const { kodepoli, tanggalperiksa, kodedokter, jampraktek } = req.body

            // cari jadwal & cek kuota
            let jampraktekArray = jampraktek.split('-')
            console.log(jampraktekArray)
            const queryJadwal = await sq.query(`
                with statistik_antrian as (
                    select 
                        to_char(al.tgl_antrian, 'YYYY-MM-DD') as tgl_antrian,
                        al.jadwal_dokter_id,
                        sum(case when al.status_antrian in (1,2) then 1 else 0 end) as sisa_antrian,
                        sum(case when al.status_antrian in (9) then 1 else 0 end) as antrian_selesai,
                        sum(case when b.flag_layanan = 1 then 1 else 0 end) as total_antrian_jkn,
                        sum(case when b.flag_layanan = 0 then 1 else 0 end) as total_antrian_non_jkn,
                        count(al.id) as total_antrian
                    from antrian_list al 
                    left join booking b on b.id = al.booking_id
                    group by al.tgl_antrian, al.jadwal_dokter_id
                )
                
                select 
                    mp.nama_poliklinik as namapoli,
                    md.nama_dokter as namadokter,
                    coalesce(da.total_antrian, 0) as totalantrean,
                    coalesce(da.sisa_antrian, 0) as sisaantrean,
                    '' as antreanpanggil,
                    coalesce(jd.quota_jkn - da.total_antrian_jkn, 0) as sisakuotajkn,
                    jd.quota_jkn as kuotajkn,
                    coalesce(jd.quota_booking - da.total_antrian_non_jkn, 0) as sisakuotanonjkn,
                    jd.quota_booking as kuotanonjkn
                from jadwal_dokter jd 
                join ms_dokter md on md.id = jd.ms_dokter_id 
                join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
                left join statistik_antrian da on 
                                    da.tgl_antrian = '${tanggalperiksa}'
                                    and da.jadwal_dokter_id = jd.id
                    
                where true 
                    and md.kode_bpjs = '${kodedokter}'
                    and date(jd.tgl_jadwal) = '${tanggalperiksa}'
                    and jd.waktu_mulai = '${jampraktekArray[0]}'
                    and jd.waktu_selesai = '${jampraktekArray[1]}'
                    and mp.kode_poli_bpjs = '${kodepoli}'
            `, s);
        
            res.status(200).json(buildResponse(200, queryJadwal[0]))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, null))
        }
    }

    static async sisa_antrean(req, res) {
        try {
            // get request body
            const { kodebooking } = req.body

            const queryJadwal = await sq.query(`
                with statistik_antrian as (
                    select 
                        to_char(al.tgl_antrian, 'YYYY-MM-DD') as tgl_antrian,
                        al.jadwal_dokter_id,
                        sum(case when al.status_antrian in (1,2) then 1 else 0 end) as sisa_antrian,
                        sum(case when al.status_antrian in (9) then 1 else 0 end) as antrian_selesai,
                        sum(case when b.flag_layanan = 1 then 1 else 0 end) as total_antrian_jkn,
                        sum(case when b.flag_layanan = 0 then 1 else 0 end) as total_antrian_non_jkn,
                        count(al.id) as total_antrian
                    from antrian_list al 
                    left join booking b on b.id = al.booking_id
                    group by al.tgl_antrian, al.jadwal_dokter_id
                )
                
                select 
                    al.status_antrian,
                    concat(al.initial, al.antrian_no) as nomorantrean,
                    mp.nama_poliklinik as namapoli,
                    md.nama_dokter as namadokter,
                    da.sisa_antrian as sisaantrean,
                    (60 * (da.sisa_antrian - 1)) as waktutunggu,
                    '' as antreanpanggil,
                    '' as keterangan
                from booking b 
                join antrian_list al on al.booking_id = b.id
                join jadwal_dokter jd on jd.id = al.jadwal_dokter_id 
                join ms_dokter md on md.id = jd.ms_dokter_id 
                join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id 
                left join statistik_antrian da on 
                    da.tgl_antrian = b.tgl_booking
                    and da.jadwal_dokter_id = jd.id

                where true
                    and b.status_booking > 0
                    and b."deletedAt" isnull
                    and b.kode_booking = '${kodebooking}'
            `, s);
        
            if (queryJadwal[0].status_antrian == 9) res.status(201).json(buildResponse({ code: 201, message: "Antrean telah selesai" }, null))
            else if (queryJadwal[0].status_antrian == 0) res.status(201).json(buildResponse({ code: 201, message: "Antrean dibatalkan" }, null))
            res.status(200).json(buildResponse(200, queryJadwal[0]))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, null))
        }
    }

    static async check_in(req, res) {
        try {
            // get request body
            const { kodebooking, waktu } = req.body

            // Proses validasi
            let booking = await bookingModel.findOne({
                where: {
                    kode_booking: kodebooking
                }
            })

            if (!booking) res.status(201).json(buildResponse({ code: 201, message: 'Booking tidak ditemukan.' }, null))
            if (booking.status_booking == 0) res.status(201).json(buildResponse({ code: 201, message: 'Booking telah dibatalkan.' }, null))
            if (booking.status_booking == 9) res.status(201).json(buildResponse({ code: 201, message: 'Booking telah selesai.' }, null))
            if (booking.flag_kedatangan == 1) res.status(201).json(buildResponse({ code: 201, message: 'Anda telah check in.' }, null))

            // Proses checkin
            const waktu_kedatangan = moment(waktu)

            await bookingModel.update({
                flag_kedatangan: 1,
                waktu_kedatangan: waktu_kedatangan,
            }, { where: { kode_booking: kodebooking } })

            // Pada saat ambil antrean, statusnya batal karena belum check in. sekarang dirubah waktu checkin
            await antrian_listModel.update({
                status_antrian: 1, // Status batal dulu, nunggu orang nya checkin baru dirubah ke 1
            }, { where: { kode_booking_bpjs: kodebooking } })
            
            res.status(200).json(buildResponse(200, null))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, null))
        }
    }

    static async batal_antrean(req, res) {
        try {
            // get request body
            const { kodebooking, keterangan } = req.body

            // Proses validasi
            let booking = await bookingModel.findOne({
                where: {
                    kode_booking: kodebooking
                }
            })
            if (!booking) res.status(201).json(buildResponse({ code: 201, message: 'Booking tidak ditemukan.' }, null))
            if (booking.status_booking == 0) res.status(201).json(buildResponse({ code: 201, message: 'Booking telah dibatalkan.' }, null))
            if (booking.status_booking == 9) res.status(201).json(buildResponse({ code: 201, message: 'Booking telah selesai.' }, null))

            let antrian = await antrian_listModel.findOne({
                where: {
                    kode_booking_bpjs: kodebooking
                }
            })
            if (!antrian) res.status(201).json(buildResponse({ code: 201, message: 'Antrian tidak ditemukan.' }, null))
            if (antrian.status_antrian == 0) res.status(201).json(buildResponse({ code: 201, message: 'Antrian telah dibatalkan.' }, null))
            if (antrian.status_antrian == 2) res.status(201).json(buildResponse({ code: 201, message: 'Antrian telah diproses.' }, null))
            if (antrian.status_antrian == 9) res.status(201).json(buildResponse({ code: 201, message: 'Antrian telah selesai.' }, null))

            // Proses pembatalan
            await bookingModel.update({
                status_booking: 0,
                remark: keterangan,
            }, { where: { kode_booking: kodebooking } })

            await antrian_listModel.update({
                status_antrian: 0,
            }, { where: { kode_booking_bpjs: kodebooking } })
            
            res.status(200).json(buildResponse(200, null))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, null))
        }
    }

    static async info_pasien_baru(req, res) {
        try {
            // get request body
            const {
                nomorkartu, nik, nama, jeniskelamin, tanggallahir, nohp, alamat, kodeprop, namaprop, kodedati2, namadati2, kodekec, namakec, kodekel, namakel, rw, rt
            } = req.body;

            // cek nik
            let pasien = await pasienModel.findOne({
                where: {
                    nik: nik
                }
            })
            if (pasien) {
                res.status(201).json(buildResponse({ code: 201, message: 'Pasien sudah tersedia.' }, { norm: pasien.no_rm }))
                return;
            }

            // cari nomor rm
            let data = await sq.query(`select * from pasien p order by p."createdAt" desc limit 1`, s)
            let rm_terakhir = data && data.length ? data[0].no_rm : 0;
            if (rm_terakhir.length !== 8) rm_terakhir = '00-00-00'

            const [leftDigits, middleDigits, rightDigits] = rm_terakhir.split('-').map(Number);

            let newLeftDigits = leftDigits;
            let newMiddleDigits = middleDigits;
            let newRightDigits = rightDigits + 1;

            if (newRightDigits > 99) {
                newRightDigits = 0;
                newMiddleDigits++;

                if (newMiddleDigits > 99) {
                newMiddleDigits = 0;
                newLeftDigits++;

                if (newLeftDigits > 99) {
                    // Jika angka pada digit kiri melebihi 99, Anda dapat menangani kondisi ini sesuai kebutuhan.
                    console.log('Angka pada digit kiri melebihi 99.');
                    return;
                }
                }
            }

            const new_no_rm = `${newLeftDigits.toString().padStart(2, '0')}-${newMiddleDigits.toString().padStart(2, '0')}-${newRightDigits.toString().padStart(2, '0')}`;
            
            // Cari kelurahan
            const queryKelurahan = await sq.query(`
                select 
                    k.id as kelurahan_id,
                    k2.id as kecamatan_id,
                    k3.id as kota_id,
                    p.id as provinsi_id
                from kelurahan k 
                left join kecamatan k2 on k2.id = k.kecamatan_id 
                left join kota k3 on k3.id = k2.kota_id 
                left join provinsi p on p.id = k3.provinsi_id 
                
                where k.nama_kelurahan ilike '%${namakel}%'
            `, s);
            const kelurahan = queryKelurahan.length ? queryKelurahan[0] : { kelurahan_id: null }

            // Masukan no rm
            await pasienModel.create({
                id: uuid_v4(),
                no_asuransi_pasien: nomorkartu, 
                no_rm: new_no_rm,
                nik: nik, 
                nama_lengkap: nama, 
                jenis_kelamin: jeniskelamin, 
                tgl_lahir: tanggallahir, 
                no_telepon: nohp, 
                sc_whatsapp: nohp, 
                sc_whatsapp: nohp, 
                alamat_ktp: alamat,
                alamat_sekarang: alamat,
                kelurahan_id: kelurahan.kelurahan_id
            })
            
            res.status(200).json(buildResponse(200, { norm: new_no_rm }))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, null))
        }
    }

    static async jadwal_operasi_rs(req, res) {
        try {
            const filter = buildFilter([
                { as: 'jo', field: 'tanggal_operasi', type: 'date >=', value: req.body.tanggalawal },
                { as: 'jo', field: 'tanggal_operasi', type: 'date <=', value: req.body.tanggalakhir },
            ]);

            const query = `
                select
                    jo.kode_booking as kodebooking,
                    to_char(jo.tanggal_operasi, 'yyyy-mm-dd') as tanggaloperasi,
                    mj.nama_jasa as jenistindakan,
                    mp.kode_poliklinik as kodepoli,
                    mp.nama_poliklinik  as namapoli,
                    case when jo.status >= 2 then 1 else 0 end as terlaksana
                from jadwal_operasi jo
                    join ms_poliklinik mp on mp.id = jo.ms_poliklinik_id 
                    join ms_jasa mj on mj.id = jo.ms_jasa_id
                where
                    true
                    and jo."deletedAt" isnull
                    ${filter}
                order by
                jo.tanggal_operasi desc
            `

            let data = await sq.query(query, s);

            res.status(200).json(buildResponse(200, { list: data }))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, {}))
        }
    }

    static async jadwal_operasi_pasien(req, res) {
        try {

            if (!req.body.nopeserta) {
                res.status(201).json(buildResponse({ code: 201, message: 'No peserta tidak ditemukan.' }, null))
            }

            const filter = buildFilter([
                { as: 'p', field: 'no_asuransi_pasien', type: '=', value: req.body.nopeserta },
            ]);

            const query = `
                select
                    jo.kode_booking as kodebooking,
                    to_char(jo.tanggal_operasi, 'yyyy-mm-dd') as tanggaloperasi,
                    mj.nama_jasa as jenistindakan,
                    mp.kode_poliklinik as kodepoli,
                    mp.nama_poliklinik  as namapoli,
                    case when jo.status >= 2 then 1 else 0 end as terlaksana
                from jadwal_operasi jo
                    join ms_poliklinik mp on mp.id = jo.ms_poliklinik_id 
                    join ms_jasa mj on mj.id = jo.ms_jasa_id
                    join registrasi r on r.id = jo.registrasi_id 
                    join pasien p on p.id = r.pasien_id 
                where
                    true
                    and jo."deletedAt" isnull
                    ${filter}
                order by
                jo.tanggal_operasi desc
            `

            let data = await sq.query(query, s);

            res.status(200).json(buildResponse(200, { list: data }))
        } catch (error) {
            console.log(error);
            res.status(500).json(buildResponse({ code: 500, message: error }, {}))
        }
    }
}

module.exports = Controller