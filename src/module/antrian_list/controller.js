const antrian_list = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');

class Controller {

    static async registerLoket(req, res) {
        const { tgl_antrian, poli_layanan, initial, status_antrian, ms_loket_id, jenis_antrian_id, booking_id, layanan_ruang_id } = req.body

        try {
            let cekBooking = []
            let tgl = moment(tgl_antrian).format('YYYY-MM-DD')
            let sequence = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.poli_layanan =2`, s);
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.poli_layanan = 2 and al.status_antrian in (0,1)`, s);

            if (booking_id) {
                cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tgl_antrian) = '${tgl}'`, s)
            }

            if (cekBooking.length > 0) {
                cekBooking[0].sisa_antrian = sisa[0].total - 1
                res.status(201).json({ status: 204, message: "sukses", data: cekBooking })
            } else {
                let antrian_no = await sq.query(`select al.antrian_no from antrian_list al where date(al.tgl_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                let no = antrian_no.length == 0 ? 1 : +antrian_no[0].antrian_no + 1
                let hasil = await antrian_list.create({ id: uuid_v4(), tgl_antrian, is_master: 1, poli_layanan, initial, antrian_no: no, sequence: sequence[0].nomor, status_antrian, ms_loket_id, jenis_antrian_id, booking_id, layanan_ruang_id })
                hasil.dataValues.sisa_antrian = +sisa[0].total

                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async registerAntrian(req, res) {
        const { id_antrian_list, tgl_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, ms_loket_id, jenis_antrian_id, booking_id, layanan_ruang_id } = req.body

        const t = await sq.transaction();

        try {
            let nomer_antrian = antrian_no
            let tgl = moment(tgl_antrian).format('YYYY-MM-DD')

            if (!antrian_no) {
                let nomernya = await sq.query(`select al.antrian_no from antrian_list al where date(al.tgl_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1`, s)
                nomer_antrian = nomernya.length == 0 ? 1 : +nomernya[0].antrian_no + 1
            }

            let sequence = await sq.query(`select count(*)+1 as total from antrian_list al where date(tgl_antrian) = '${tgl}' and ms_poliklinik_id =${ms_poliklinik_id}`, s);
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.ms_poliklinik_id = '${ms_poliklinik_id}' and status_antrian in (0,1)`, s)

            if (id_antrian_list) {
                await antrian_list.update({ status_antrian: 2 }, { where: { id: id_antrian_list }, transaction: t })
            }

            let hasil = await antrian_list.create({ id: uuid_v4(), tgl_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].total, is_cancel, is_process, status_antrian, jadwal_dokter_id, ms_loket_id, jenis_antrian_id, booking_id, layanan_ruang_id }, { transaction: t })
            hasil.dataValues.sisa_antrian = +sisa[0].total
            await t.commit();

            res.status(200).json({ status: 200, message: "sukses", data: hasil })
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { id, tgl_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, ms_loket_id, jenis_antrian_id, booking_id, layanan_ruang_id } = req.body

        try {
            let hasil = await antrian_list.update({ tgl_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, jadwal_dokter_id, ms_loket_id, jenis_antrian_id, booking_id, layanan_ruang_id }, { where: { id }, returning: true })

            res.status(200).json({ status: 200, message: "sukses", data: hasil[1] })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static delete(req, res) {
        const { id } = req.body

        antrian_list.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async list(req, res) {
        const { halaman, jumlah, antrian_list_id, tgl_antrian, poli_layanan, initial, is_cancel, is_process, status_antrian, jadwal_dokter_id, booking_id, ms_loket_id, jenis_antrian_id, ms_poliklinik_id, ms_dokter_id, ms_jenis_layanan_id } = req.body;

        try {
            let isi = ''
            let offset=''
            let pagination=''

            if(halaman && jumlah){
                offset = (+halaman -1) * jumlah;
                pagination=`limit ${jumlah} offset ${offset}`
            }

            if (antrian_list_id) {
                isi += ` and al.id ='${antrian_list_id}' `
            }
            if (tgl_antrian) {
                isi += ` and date(al.tgl_antrian)='${tgl_antrian}' `
            }
            if (poli_layanan) {
                isi += ` and al.poli_layanan = '${poli_layanan}' `
            }
            if (initial) {
                isi += ` and al.initial = '${initial}' `
            }
            if (is_cancel) {
                isi += ` and al.is_cancel = ${is_cancel} `
            }
            if (is_process) {
                isi += ` and al.is_process = '${is_process}' `
            }
            if (status_antrian) {
                isi += ` and al.status_antrian = ${status_antrian} `
            }
            if (jadwal_dokter_id) {
                isi += ` and al.jadwal_dokter_id = '${jadwal_dokter_id}' `
            }
            if (booking_id) {
                isi += ` and al.booking_id = '${booking_id}' `
            }
            if (ms_loket_id) {
                isi += ` and al.ms_loket_id = '${ms_loket_id}' `
            }
            if (jenis_antrian_id) {
                isi += ` and al.jenis_antrian_id = '${jenis_antrian_id}' `
            }
            if (ms_poliklinik_id) {
                isi += ` and jd.ms_poliklinik_id = '${ms_poliklinik_id}'`
            }
            if (ms_dokter_id) {
                isi += ` and jd.ms_dokter_id = '${ms_dokter_id}'`
            }
            if (ms_jenis_layanan_id) {
                isi += ` and jd.ms_jenis_layanan_id = '${ms_jenis_layanan_id}'`
            }

            let data = await sq.query(`select al.id as "antrian_list_id", concat(al.initial, '-', al.antrian_no) as concat_antrian_no, al.*,jd.*,ml.nama_loket,ml.status_loket,b.*,ja.nama_jenis_antrian,ja.kode_jenis_antrian,
			ja.status_jenis_antrian,p.nama_lengkap,p.jenis_kelamin,p.tempat_lahir,p.tgl_lahir,md.nama_dokter,md.jk_dokter,mp.nama_poliklinik,mp.kode_poliklinik, p.nama_lengkap as nama_pasien
            from antrian_list al 
            left join registrasi r on r.id = al.registrasi_id
            left join pasien p on p.id = r.pasien_id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id 
            left join ms_dokter md on md.id = jd.ms_dokter_id 
            left join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id
            left join ms_loket ml on ml.id = al.ms_loket_id 
            left join booking b on b.id = al.booking_id 
            left join jenis_antrian ja on ja.id = al.jenis_antrian_id 
            where al."deletedAt" isnull${isi} order by al."sequence" ${pagination}`, s)

            let jml = await sq.query(`select count(*) 
            from antrian_list al 
            left join registrasi r on r.id = al.registrasi_id
            left join pasien p on p.id = r.pasien_id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id 
            left join ms_dokter md on md.id = jd.ms_dokter_id 
            left join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id
            left join ms_loket ml on ml.id = al.ms_loket_id 
            left join booking b on b.id = al.booking_id 
            left join jenis_antrian ja on ja.id = al.jenis_antrian_id 
            where al."deletedAt" isnull${isi}`,s)

            res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listHalaman(req, res) {
        const { halaman, jumlah, tgl_antrian, poli_layanan, initial, is_cancel, is_process, status_antrian, jadwal_dokter_id, booking_id, ms_loket_id, jenis_antrian_id } = req.body;

        try {
            let isi = ''
            let offset = (+halaman - 1) * jumlah;

            if (tgl_antrian) {
                isi += `and date(al.tgl_antrian)='${tgl_antrian}' `
            }
            if (poli_layanan) {
                isi += `and al.poli_layanan = '${poli_layanan}' `
            }
            if (initial) {
                isi += `and al.initial = '${initial}' `
            }
            if (is_cancel) {
                isi += `and al.is_cancel = ${is_cancel} `
            }
            if (is_process) {
                isi += `and al.is_process = '${is_process}' `
            }
            if (status_antrian) {
                isi += `and al.status_antrian = ${status_antrian} `
            }
            if (jadwal_dokter_id) {
                isi += `and al.jadwal_dokter_id = '${jadwal_dokter_id}' `
            }
            if (booking_id) {
                isi += `and al.booking_id = '${booking_id}' `
            }
            if (ms_loket_id) {
                isi += `and al.ms_loket_id = '${ms_loket_id}' `
            }
            if (jenis_antrian_id) {
                isi += `and al.jenis_antrian_id = '${jenis_antrian_id}' `
            }

            let data = await sq.query(`select al.id as "antrian_list_id", * from antrian_list al 
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id 
            left join ms_loket ml on ml.id = al.ms_loket_id 
            left join booking b on b.id = al.booking_id 
            left join jenis_antrian ja on ja.id = al.jenis_antrian_id 
            where al."deletedAt" isnull ${isi} order by al."sequence" limit ${jumlah} offset ${offset}`, s)
            let jml = await sq.query(`select count(*) as total 
            from antrian_list al 
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id 
            left join ms_loket ml on ml.id = al.ms_loket_id 
            left join booking b on b.id = al.booking_id 
            left join jenis_antrian ja on ja.id = al.jenis_antrian_id 
            where al."deletedAt" isnull ${isi}`, s)

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }


    static async listAntrianAktif(req, res) {
        try {
            let data = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.ms_loket_id notnull and al.status_antrian = 1 and date(al.tgl_antrian) = date(now())`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listAntrianAktifPoli(req, res) {
        let { ms_poliklinik_id, poli_layanan } = req.body
        try {
            let tgl = moment().format('YYYY-MM-DD')
            let isi = ''
            
            let data = await sq.query(`select al.id as "antrian_list_id", * 
            from antrian_list al 
            join jadwal_dokter jd on jd.id = al.jadwal_dokter_id 
            join ms_dokter md on md.id = jd.ms_dokter_id 
            where al."deletedAt" isnull and al.ms_loket_id notnull and al.status_antrian = 1 
            and date(al.tgl_antrian) = date(now()) and al.ms_poliklinik_id = '${ms_poliklinik_id}'`, s)
            let sisa = await sq.query(`select count(*)as total from antrian_list al where date(tgl_antrian) = '${tgl}' and poli_layanan = ${poli_layanan} and status_antrian in (0,1)`, s);

            res.status(200).json({ status: 200, message: "sukses", data, sisa: sisa[0].total })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async cekNomorAntrian(req, res) {
        const { tgl_antrian, initial, antrian_no, poli_layanan } = req.body

        try {
            let data = await sq.query(`select al.id as "antrian_list_id", * from antrian_list al where al."deletedAt" isnull and al.poli_layanan = ${poli_layanan} and date(al.tgl_antrian) = '${tgl_antrian}' and al.initial = '${initial}' and al.antrian_no = '${antrian_no}' and al.status_antrian <> 9`, s);

            if (data.length == 0) {
                res.status(201).json({ status: 204, message: "data tidak ada" })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listAntrianByRegistrasiId(req, res) {
        const { tgl_antrian, registrasi_id, poli_layanan } = req.body

        try {
            let data = await sq.query(`select al.id as "antrian_list_id", al.*, r.no_identitas_registrasi, r.pasien_id, 
            p.nama_lengkap ,p.jenis_kelamin, r.no_rujukan, r.no_kontrol, r.dibuat_oleh,jd.*,
            ja.nama_jenis_antrian, ja.kode_jenis_antrian, lr.*
            from antrian_list al 
            left join registrasi r on r.id = al.registrasi_id
            left join jadwal_dokter jd on jd.id = al.jadwal_dokter_id
            left join jenis_antrian ja on ja.id = al.jenis_antrian_id
            left join layanan_ruang lr on lr.id = al.layanan_ruang_id
            left join pasien p on p.id = r.pasien_id
            where al."deletedAt" isnull and al.poli_layanan = ${poli_layanan}
            and date(al.tgl_antrian) = '${tgl_antrian}' 
            and al.registrasi_id = '${registrasi_id}'`, s);

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async TambahAntrianLoket(req, res) {
        const { tgl, jumlah,initial,jenis_antrian_id } = req.body

        try {
            let data = await sq.query(`select * from antrian_list al where al.poli_layanan = 1 and date(al.tgl_antrian) = '${tgl}' order by al.sequence desc`, s);
            let hasil = []
            if(data.length==0){
                for (let i = 0; i < jumlah; i++) {
                    let kode_booking_bpjs = moment().format("YYYYMMDDHHmmss") + `${initial}${i+1}`
                    hasil.push({id:uuid_v4(),tgl_antrian:tgl,is_master:1,poli_layanan:1,initial,antrian_no:i+1,sequence:i+1,kode_booking_bpjs,jenis_antrian_id})
                }
            }else{
                for (let i = 0; i < jumlah; i++) {
                    let kode_booking_bpjs = moment().format("YYYYMMDDHHmmss") + `${initial}${(data[0].antrian_no+i+1)}`
                    hasil.push({id:uuid_v4(),tgl_antrian:tgl,is_master:1,poli_layanan:1,initial,antrian_no:(data[0].antrian_no+i+1),sequence:(data[0].sequence+i+1),kode_booking_bpjs,jenis_antrian_id})
                }
            }

            antrian_list.bulkCreate(hasil)
            res.status(200).json({ status: 200, message: "sukses", data:hasil });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller