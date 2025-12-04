const { sq } = require("../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const { Server } = require("socket.io")
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const axios = require('axios')
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const booking = require('../module/booking/model');
const sep = require('../module/sep/model');
const antrian_list = require('../module/antrian_list/model')
const antrian_loket = require('../module/antrian_list/model')
const registrasi = require('../module/registrasi/model')
const antreanApi = require("./antrean_api");
const msAsuransi = require("../module/ms_asuransi/model");
const pasien = require("../module/pasien/model");
const jadwalDokter = require("../module/jadwal_dokter/model");
const msPoliklinik = require("../module/ms_poliklinik/model");
const msDokter = require("../module/ms_dokter/model");

const koneksi_socket = koneksi_socket => {
    const io = new Server(koneksi_socket, { cors: "*" })
    const pubClient = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}` });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
    });

    io.on('connection', function (socket) {
        console.log('koneksi socket berhasil ...');

        // LOKET
        // socket.on('panggilLoket', async (data, room_id) => {
        //     const { id, status_antrian_loket, ms_loket_id } = data

        //     try {
        //         await antrian_loket.update({ status_antrian_loket,ms_loket_id}, { where: { id }})

        //         if (status_antrian == 1) {
        //             io.to(room_id).emit("refresh_layar_loket", {status: 200, message: 'sukses', data});
        //         }

        //         socket.emit("refresh_admin_loket", {status: 200, message: 'sukses', data});
        //     } catch (error) {
        //         await t.rollback();
        //         console.log(error);
        //         socket.emit("error", { status: 500, message: "gagal" });
        //     }
        // })

        // socket.on('registerApmLoket', async (data,room_id) => {
        //     const { tgl_antrian_loket, initial_loket } = data
        //     //poli_layanan loket => 1
        //     try {
        //         let tgl = moment(tgl_antrian_loket).format('YYYY-MM-DD')
        //         let urutan = await sq.query(`select al.antrian_no_loket from antrian_loket al where al."deletedAt" isnull and date(al.tgl_antrian_loket)= '${tgl}' and al.initial_loket = '${initial_loket}' order by al."createdAt" desc limit 1`,s);
        //         let sisa = await sq.query(`select count(*)as total from antrian_loket al where al."deletedAt" isnull and date(al.tgl_antrian_loket)= '${tgl}' and al.initial_loket = '${initial_loket}' and al.status_antrian_loket = 1`, s);
                
        //         let antrian_no_loket = urutan.length == 0 ? 1 : +urutan[0].antrian_no_loket + 1
        //         let hasil = await antrian_loket.create({ id: uuid_v4(), tgl_antrian_loket, initial_loket, antrian_no_loket })
        //         hasil.dataValues.sisa_antrian = +sisa[0].total

        //         io.to(room_id).emit("refresh_admin_loket", {status: 200, message: 'sukses', data:hasil});
        //         io.to(room_id).emit("refresh_apm_loket", {status:200,message:"sukses",data:hasil});
        //     } catch (error) {
        //         console.log(error);
        //         io.to(room_id).emit("error", { status: 500, message: "gagal" });
        //     }
        // })

        socket.on('registerApmLoket', async (data,room_id) => {
            const { tgl_antrian, poli_layanan, initial, status_antrian, jenis_antrian_id, booking_id } = data
            //poli_layanan loket => 1
            try {
                let cekBooking = []
                let tgl = moment(tgl_antrian).format('YYYY-MM-DD')
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.poli_layanan = '${poli_layanan}' and al.status_antrian in (1,2)`, s);
                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tgl_antrian) = '${tgl}'`, s)
                }
                
                if (cekBooking.length > 0) {
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    io.to(room_id).emit("refresh_apm_loket",{status:200,message:"sukses",data:cekBooking[0]});
                } else {
                    let urutan = await sq.query(`select count(*)+1 as total,(select al.antrian_no from antrian_list al where date(al.tgl_antrian) = '${tgl}'and al.initial = '${initial}' order by al.antrian_no desc limit 1) from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.poli_layanan = ${poli_layanan}`, s);
                    let nomor = !urutan[0].antrian_no? 1 : +urutan[0].antrian_no + 1
                    let kode_booking_bpjs = moment().format("YYYYMMDDHHmmss") + `${initial}${nomor}`

                    const time = moment().valueOf();
                
                    // let objCreate = {
                    //     kodebooking: kode_booking,
                    //     jenispasien: jenis_pasien,
                    //     nomorkartu: nomor_kartu,
                    //     nik: nik,
                    //     nohp: no_hp,
                    //     kodepoli: 'UMU',
                    //     namapoli: 'UMUM',
                    //     pasienbaru: 1,
                    //     norm: '',
                    //     tanggalperiksa: tgl,
                    //     // kodedokter: kode_dokter,
                    //     // namadokter: nama_dokter,
                    //     // jampraktek: jam_praktek,
                    //     jeniskunjungan: 1,
                    //     nomorreferensi: kode_booking_bpjs,
                    //     nomorantrean: `${initial}-${nomor}`,
                    //     angkaantrean: nomor,
                    //     estimasidilayani: time,
                    //     sisakuotajkn: sisa_kuota_jkn,
                    //     kuotajkn: kuota_jkn,
                    //     sisakuotanonjkn: sisa_kuota_non_jkn,
                    //     kuotanonjkn: kuota_non_jkn,
                    //     keterangan: keterangan,
                    // };
                
                    // await antreanApi.post("/antrean/add", objCreate);

                    let hasil = await antrian_list.create({ id: uuid_v4(), tgl_antrian, is_master: 0, poli_layanan, initial, antrian_no: nomor, sequence: urutan[0].total, status_antrian, jenis_antrian_id, booking_id, kode_booking_bpjs })
                    hasil.dataValues.sisa_antrian = sisa[0].total

                    io.to(room_id).emit("refresh_admin_loket", {status: 200, message: 'sukses', data:hasil});
                    io.to(room_id).emit("refresh_apm_loket", {status:200,message:"sukses",data:hasil});
                }
            } catch (error) {
                console.log(error);
                io.to(room_id).emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('panggilLoket', async (data, room_id) => {
            const { id, status_antrian, ms_loket_id, taskid } = data
            
            const t = await sq.transaction();
            try {
                await antrian_list.update({ status_antrian,ms_loket_id}, { where: { id }, transaction: t });

                const antrian = await antrian_list.findOne({ where: { id } });
                let objUpdate = {
                    kodebooking: antrian.kode_booking_bpjs,
                    taskid: null,
                    waktu: moment().valueOf(),
                };
                if (status_antrian == 0) objUpdate.taskid = 99; // batal
                else if (status_antrian == 2) objUpdate.taskid = 1; // diproses loket
                else if (status_antrian == 9) objUpdate.taskid = 2; // selesai
                if (objUpdate.taskid) {
                    await antreanApi.post("/antrean/updatewaktu", objUpdate);
                }
            
                if (status_antrian == 1) {
                    io.to(room_id).emit("refresh_layar_loket", {status: 200, message: 'sukses', data});
                }
                await t.commit();
                socket.emit("refresh_admin_loket", {status: 200, message: 'sukses', data});
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })
        

        // POLI
        socket.on('registerApmUmum', async (data, room_id) => {
            const { tgl_antrian, poli_layanan, initial, booking_id, jadwal_dokter_id, jenis_antrian_id, no_identitas_registrasi, no_hp_registrasi, no_asuransi_registrasi, no_kontrol, keterangan_registrasi, ms_jenis_layanan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id} = data

            const t = await sq.transaction();

            try {
                let cekBooking = []
                let tgl = moment(tgl_antrian).format('YYYY-MM-DD')
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.status_antrian in (1,2) and al.jadwal_dokter_id = '${jadwal_dokter_id}'`, s);
                let poli = await sq.query(`select mp.nama_poliklinik,mp.kode_poliklinik from jadwal_dokter jd join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`,s);

                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tgl_antrian) = '${tgl}'`, s)
                }

                if (cekBooking.length > 0) {
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    io.to(room_id).emit("refresh_register_apm", {status:200, message:"sukses", data:cekBooking[0], sep: { status: 500 } });
                } else {
                    let cekRegis = await sq.query(`select * from registrasi r where r."deletedAt" isnull and r.status_registrasi in (1,2) and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}' and r.ms_dokter_id = '${ms_dokter_id}'`, s);

                    if(cekRegis.length>0){
                        io.to(room_id).emit("refresh_register_apm", {status:204, message:"sudah melakukan registrasi", sep: { status: 500 } });
                    }else{
                        let urutan = await sq.query(`select count(*)+1 as total,(select al2.antrian_no from antrian_list al2 where date(al2.tgl_antrian) = '${tgl}' and al2.jadwal_dokter_id = '${jadwal_dokter_id}' and al2.is_master = 1 order by al2.antrian_no desc limit 1) from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.jadwal_dokter_id = '${jadwal_dokter_id}'`, s);
                        let nomor = !urutan[0].antrian_no?1: +urutan[0].antrian_no+ 1
                        let kode_booking_bpjs = moment().format("YYYYMMDDHHmmss") + `${initial}${nomor}`
                        let registrasi_id = uuid_v4();
                        let regUmum = await registrasi.create({id: registrasi_id, tgl_registrasi:tgl_antrian, no_identitas_registrasi, no_hp_registrasi, no_kontrol, no_antrian:nomor, keterangan_registrasi, booking_id, ms_jenis_layanan_id, pasien_id, ms_dokter_id, ms_spesialis_id, no_asuransi_registrasi, ms_asuransi_id, initial_registrasi:initial, dibuat_oleh: "mandiri" }, { transaction: t})

                        // start bridging antrol
                        let p = await pasien.findOne({ where: { id: pasien_id } });
                        let ms_asuransi = await msAsuransi.findOne({ where: { nama_asuransi: 'UMUM' } });
                        let jadwal = await jadwalDokter.findOne({
                            where: { id: jadwal_dokter_id },
                            include: [{ model: msPoliklinik, as: "ms_poliklinik" }, { model: msDokter, as: "ms_dokter" }]
                        });

                        const { kode_poliklinik, nama_poliklinik } = jadwal.ms_poliklinik || {};
                        const { kode_bpjs, nama_dokter } = jadwal.ms_dokter || {};
                        const time = moment().valueOf();
                        const sisa = await sq.query(`SELECT jd.quota - COUNT(al.id) AS sisakuotanonjkn, jd.quota as kuotanonjkn, jd.quota_jkn as kuotajkn
                            FROM jadwal_dokter jd
                            LEFT JOIN antrian_list al
                                ON jd.id = al.jadwal_dokter_id
                            WHERE jd.id = '${jadwal_dokter_id}'
                            GROUP BY jd.quota, jd.quota_jkn;
                        `, s);
                        const { sisakuotanonjkn, kuotanonjkn, kuotajkn } = sisa[0];

                        let objCreate = {
                            kodebooking: kode_booking_bpjs,
                            jenispasien: ms_asuransi.nama_asuransi.toLowerCase().includes('bpjs') ? 'JKN' : 'NON_JKN',
                            nomorkartu: p.no_asuransi_pasien || '',
                            nik: p.nik || '',
                            nohp: p.no_telepon || p.sc_whatsapp || '',
                            kodepoli: kode_poliklinik || 'UMU',
                            namapoli: nama_poliklinik || 'UMUM',
                            pasienbaru: p.no_rm ? 0 : 1,
                            norm: p.no_rm,
                            tanggalperiksa: tgl,
                            kodedokter: kode_bpjs || '',
                            namadokter: nama_dokter,
                            jampraktek: `${jadwal.waktu_mulai.slice(0, 5)}-${jadwal.waktu_selesai.slice(0, 5)}`,
                            jeniskunjungan: 3,
                            nomorreferensi: regUmum.id,
                            nomorantrean: `${initial}-${nomor}`,
                            angkaantrean: nomor,
                            estimasidilayani: time,
                            sisakuotajkn: kuotajkn,
                            kuotajkn: kuotajkn,
                            sisakuotanonjkn: sisakuotanonjkn,
                            kuotanonjkn: kuotanonjkn,
                            keterangan: 'Peserta harap 30 menit lebih awal guna pencatatan administrasi',
                        };
                        console.log(objCreate);
                        await antreanApi.post("/antrean/add", objCreate);
                        // end bridging antrol

                        let hasil = await antrian_list.create({ id: uuid_v4(), tgl_antrian, poli_layanan, initial, antrian_no: nomor, sequence: urutan[0].total, booking_id, jadwal_dokter_id, jenis_antrian_id, kode_booking_bpjs, registrasi_id }, { transaction: t })
                        hasil.dataValues.sisa_antrian = sisa[0].total
                        hasil.dataValues.nama_poliklinik = poli.length>0?poli[0].nama_poliklinik:null

                        await t.commit();
                        io.to(room_id).emit("refresh_register_apm", {status:200, message:"sukses", data:hasil, sep : { status: 500 } });
                        io.to(room_id).emit("refresh_admin", {status:200, message:"sukses", data:hasil });
                    }
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                io.to(room_id).emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('registerApmBpjs', async (data, room_id) => {
            const {no_identitas_registrasi, no_hp_registrasi, no_asuransi_registrasi, no_rujukan, no_kontrol, keterangan_registrasi, ms_jenis_layanan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, tgl_antrian, poli_layanan, initial, booking_id, jadwal_dokter_id, jenis_antrian_id } = data

            const t = await sq.transaction();

            try {
                let cekBooking = []
                let tgl = moment(tgl_antrian).format('YYYY-MM-DD')
                let sisa = await sq.query(`select count(*)as total from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.status_antrian in (1,2) and al.jadwal_dokter_id = '${jadwal_dokter_id}'`, s);
                let poli = await sq.query(`select mp.nama_poliklinik,mp.kode_poliklinik from jadwal_dokter jd join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id where jd."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`,s);
                if (booking_id) {
                    cekBooking = await sq.query(`select * from antrian_list al where al."deletedAt" isnull and al.booking_id = '${booking_id}' and date(al.tgl_antrian) = '${tgl}'`, s);
                }
                
                if (cekBooking.length > 0) {
                    let dataSEP = await sq.query(`select * from sep s  where s."deletedAt" isnull and s.registrasi_id = '${cekBooking[0].registrasi_id}'`, s);
                    cekBooking[0].sisa_antrian = sisa[0].total - 1
                    
                    io.to(room_id).emit("refresh_register_apm", {status:200, message:"sukses", data:cekBooking[0], sep:{status:200,data:dataSEP[0]}});
                } else {
                    let cekRegis = await sq.query(`select * from registrasi r where r."deletedAt" isnull and r.status_registrasi in (1,2) and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}'`, s);

                    if(cekRegis.length>0){
                        io.to(room_id).emit("refresh_register_apm", {status:204, message:"sudah melakukan registrasi", sep: { status: 500 } });
                    }else{
                        let urutan = await sq.query(`select count(*)+1 as total,(select al2.antrian_no from antrian_list al2 where date(al2.tgl_antrian) = '${tgl}' and al2.jadwal_dokter_id = '${jadwal_dokter_id}' and al2.is_master = 1 order by al2.antrian_no desc limit 1) from antrian_list al where date(al.tgl_antrian) = '${tgl}' and al.jadwal_dokter_id = '${jadwal_dokter_id}'`, s);
                        let nomor = !urutan[0].antrian_no?1 : +urutan[0].antrian_no + 1
                        let kode_booking_bpjs = moment().format("YYYYMMDDHHmmss") + `${initial}${nomor}`
                        let registrasi_id = uuid_v4()
    
                        let regBPJS = await registrasi.create({id: registrasi_id, tgl_registrasi:tgl_antrian, no_identitas_registrasi, no_hp_registrasi, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian:nomor, keterangan_registrasi, booking_id, ms_jenis_layanan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, initial_registrasi:initial, dibuat_oleh: "mandiri" }, { transaction: t})
    
                        let hasil = await antrian_list.create({ id: uuid_v4(), tgl_antrian, poli_layanan, initial, antrian_no: nomor, sequence: urutan[0].total, booking_id, jadwal_dokter_id, registrasi_id, kode_booking_bpjs, jenis_antrian_id }, { transaction: t })
                        hasil.dataValues.sisa_antrian = +sisa[0].total
                        hasil.dataValues.nama_poliklinik = poli[0].nama_poliklinik
                        
                        await t.commit();
                        io.to(room_id).emit("refresh_register_apm", {status:200, message:"sukses", data:hasil, sep: {status:200,data:{}}});
                        io.to(room_id).emit("refresh_admin", {status:200, message:"sukses", data:hasil, sep: {status:200,data:{}}});
                    }
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                io.to(room_id).emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('pindahAntrian', async (data) => {
            const { antrian_id, tgl_antrian, is_master, poli_layanan, initial, antrian_no, status_antrian, jadwal_dokter_id, ms_loket_id, jenis_antrian_id, booking_id, kode_booking_bpjs, registrasi_id, layanan_ruang_id } = data

            const t = await sq.transaction();

            try {
                let isi = `and al.jadwal_dokter_id  = '${jadwal_dokter_id}'`
                if(layanan_ruang_id){
                    isi = `and al.layanan_ruang_id  = '${layanan_ruang_id}'`
                }
                let tgl = moment(tgl_antrian).format('YYYY-MM-DD');
                let urutan = await sq.query(`select count(*)+1 as total,count(*) filter (where al.status_antrian in (1,2))as sisa,(select al.antrian_no from antrian_list al where date(al.tgl_antrian) = '${tgl}' ${isi} order by al.antrian_no desc limit 1) from antrian_list al where date(al.tgl_antrian) = '${tgl}' ${isi}`, s);
                let nomor = antrian_no?antrian_no: !urutan[0].antrian_no?1: +urutan[0].antrian_no+1

                let hasil = await antrian_list.create({ id: uuid_v4(), tgl_antrian, is_master, poli_layanan, initial, antrian_no: nomor, sequence: urutan[0].total, status_antrian, jadwal_dokter_id, ms_loket_id, jenis_antrian_id, booking_id, kode_booking_bpjs, registrasi_id, layanan_ruang_id }, { transaction: t })
                await antrian_list.update({ status_antrian: 9 }, { where: { id: antrian_id }, transaction: t })
                hasil.dataValues.sisa_antrian = urutan[0].sisa

                await t.commit();
                io.emit("refresh_pindah_antrian", {status:200,message:"sukses",data:hasil});
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('registrasiAdminRajal', async (data,room_id) => {
            const { antrian_id, tgl_antrian, is_master, poli_layanan, initial, antrian_no, jadwal_dokter_id, jenis_antrian_id, booking_id, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, keterangan_registrasi, id_faskes_perujuk, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, username } = data

            try {
                let tgl = moment(tgl_antrian).format('YYYY-MM-DD');
                let cekBPJS = await sq.query(`select * from registrasi r join ms_asuransi ma on ma.id = r.ms_asuransi_id where r."deletedAt" isnull and date(r.tgl_registrasi) = '${tgl}' and r.pasien_id = '${pasien_id}' and ma.nama_asuransi ilike 'bpjs'`, s);
                let nama_poli = await sq.query(`select mp.nama_poliklinik from jadwal_dokter jd join ms_poliklinik mp on mp.id = jd.ms_poliklinik_id where jd."deletedAt" isnull and jd.id='${jadwal_dokter_id}'`,s);
                let urutan = await sq.query(`select count(*)+1 as total,count(*) filter (where al.status_antrian in (1,2))as sisa from antrian_list al where al.poli_layanan = 2 and date(al.tgl_antrian) = '${tgl}' and al.jadwal_dokter_id = '${jadwal_dokter_id}'`, s);
                let nomor_urut = await sq.query(`select al.antrian_no from antrian_list al where al.poli_layanan = 2 and date(al.tgl_antrian) = '${tgl}' and al.jadwal_dokter_id  = '${jadwal_dokter_id}' and al.initial = '${initial}' order by al.antrian_no desc limit 1`,s);
                let nomor = antrian_no?antrian_no:nomor_urut.length==0?1:+nomor_urut[0].antrian_no+1
                let kode_booking_bpjs = moment().format("YYYYMMDDHHmmss") + `${initial}${nomor}`

                // if(cekBPJS.length>0){
                //     socket.emit('refresh_admin_pendaftaran',{status:204,message:"pasien BPJS sudah mendaftar hari ini"})
                // }else{
                    let hasil = await sq.transaction(async t =>{
                        let registrasi_id = uuid_v4();
                        let regis = await registrasi.create({ id: registrasi_id, tgl_registrasi:tgl_antrian, no_identitas_registrasi, no_hp_registrasi, no_sep, no_asuransi_registrasi, no_rujukan, no_kontrol, no_antrian:nomor, keterangan_registrasi, id_faskes_perujuk, booking_id, ms_jenis_layanan_id, kelas_kunjungan_id, pasien_id, ms_dokter_id, ms_spesialis_id, ms_asuransi_id, dibuat_oleh: username, antrian_loket_id:antrian_id });
                        let data = await antrian_list.create({ id: uuid_v4(), tgl_antrian, is_master, poli_layanan, initial, antrian_no: nomor, sequence: urutan[0].total, status_antrian:1, jadwal_dokter_id, jenis_antrian_id, booking_id, kode_booking_bpjs, registrasi_id }, { transaction: t })
                        if(antrian_id){
                            await antrian_list.update({ status_antrian: 9 }, { where: { id: antrian_id }, transaction: t})
                            // start bridging antrol
                            try {
                                let p = await pasien.findOne({ where: { id: pasien_id } });
                                let ms_asuransi = await msAsuransi.findOne({ where: { id: ms_asuransi_id } });
                                let jadwal = await jadwalDokter.findOne({
                                    where: { id: jadwal_dokter_id },
                                    include: [{ model: msPoliklinik, as: "ms_poliklinik" }, { model: msDokter, as: "ms_dokter" }]
                                });
        
                                const { kode_poliklinik, nama_poliklinik } = jadwal.ms_poliklinik || {};
                                const { kode_bpjs, nama_dokter } = jadwal.ms_dokter || {};
                                const time = moment().valueOf();
                                const sisa = await sq.query(`SELECT jd.quota - COUNT(al.id) AS sisakuotanonjkn, jd.quota as kuotanonjkn, jd.quota_jkn as kuotajkn
                                    FROM jadwal_dokter jd
                                    LEFT JOIN antrian_list al
                                        ON jd.id = al.jadwal_dokter_id
                                    WHERE jd.id = '${jadwal_dokter_id}'
                                    GROUP BY jd.quota, jd.quota_jkn;
                                `, s);
                                const { sisakuotanonjkn, kuotanonjkn, kuotajkn } = sisa[0];
        
                                const jenis_pasien = ms_asuransi.nama_asuransi.toLowerCase().includes('bpjs') ? 'JKN' : 'NON_JKN';
                                let objCreate = {
                                    kodebooking: kode_booking_bpjs,
                                    jenispasien: jenis_pasien,
                                    nomorkartu: p.no_asuransi_pasien || '',
                                    nik: p.nik || '',
                                    nohp: p.no_telepon || p.sc_whatsapp || '',
                                    kodepoli: kode_poliklinik || 'UMU',
                                    namapoli: nama_poliklinik || 'UMUM',
                                    pasienbaru: p.no_rm ? 0 : 1,
                                    norm: p.no_rm,
                                    tanggalperiksa: tgl,
                                    kodedokter: kode_bpjs || '',
                                    namadokter: nama_dokter,
                                    jampraktek: `${jadwal.waktu_mulai.slice(0, 5)}-${jadwal.waktu_selesai.slice(0, 5)}`,
                                    jeniskunjungan: no_rujukan ? 1 : 3,
                                    nomorreferensi: jenis_pasien == 'JKN' ? no_kontrol || no_rujukan : regis.id,
                                    nomorantrean: `${initial}-${nomor}`,
                                    angkaantrean: nomor,
                                    estimasidilayani: time,
                                    sisakuotajkn: kuotajkn,
                                    kuotajkn: kuotajkn,
                                    sisakuotanonjkn: sisakuotanonjkn,
                                    kuotanonjkn: kuotanonjkn,
                                    keterangan: 'Peserta harap 30 menit lebih awal guna pencatatan administrasi',
                                };
                                console.log(objCreate);
                                await antreanApi.post("/antrean/add", objCreate);

                                // start admisi
                                try {
                                    const antrianLoket = await antrian_list.findOne({ where: { id: antrian_id } });
                                    let createdAtLoket = moment().subtract(5, 'minutes').valueOf();
                                    if(antrianLoket) createdAtLoket = moment(antrianLoket.createdAt).valueOf();
                                    const now = moment().valueOf();
                                    let objUpdate = {
                                        kodebooking: objCreate.kodebooking,
                                        taskid: 1,
                                        waktu: createdAtLoket,
                                    };
                                    await antreanApi.post("/antrean/updatewaktu", objUpdate);
                                    await antreanApi.post("/antrean/updatewaktu", {
                                        ...objCreate,
                                        taskid: 2,
                                        waktu: now,
                                    });
                                    await antreanApi.post("/antrean/updatewaktu", {
                                        ...objCreate,
                                        taskid: 3,
                                        waktu: moment().valueOf(),
                                    });
                                } catch (error) {
                                    console.log('error bridging admisi', error);
                                }
                            } catch (error) {
                                console.log('error bridging antrol', error);
                            }
                            // end bridging antrol
                        }
                        data.dataValues.sisa_antrian = urutan[0].sisa
                        data.dataValues.nama_poliklinik = nama_poli[0].nama_poliklinik

                        
                        socket.emit('refresh_admin_pendaftaran',{status:200,message:"sukses",data:data, registrasi: regis})
                        io.emit("refresh_layar", {status:200,message:"sukses", data:data, registrasi: regis});
                    })
                // }
            } catch (error) {
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('panggilFarmasi', async (data, room_id) => {
            const { id, status_antrian, ms_loket_id, taskid } = data

            const t = await sq.transaction();
            try {
                await antrian_list.update({ status_antrian,ms_loket_id}, { where: { id }, transaction: t })

                const antrian = await antrian_list.findOne({ where: { id } });
                let objUpdate = {
                    kodebooking: antrian.kode_booking_bpjs,
                    taskid: null,
                    waktu: moment().valueOf(),
                };
                if (status_antrian == 0) objUpdate.taskid = 99; // batal
                else if (status_antrian == 2) objUpdate.taskid = 6; // diproses loket
                else if (status_antrian == 9) objUpdate.taskid = 7; // selesai
                if (objUpdate.taskid) {
                    await antreanApi.post("/antrean/updatewaktu", objUpdate);
                }

                if (status_antrian == 1) {
                    io.to(room_id).emit("refresh_layar_farmasi", {status: 200, message: 'sukses', data});
                }
                await t.commit();
                socket.emit("refresh_admin_farmasi", {status: 200, message: 'sukses', data});
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('panggilPoliLayanan', async (data, room_id) => {
            const { id, tgl_antrian, layanan_ruang_id, status_antrian, jadwal_dokter_id, ms_loket_id, booking_id, taskid } = data

            const t = await sq.transaction();

            try {
                await antrian_list.update({ status_antrian,ms_loket_id}, { where: { id }, transaction: t })
                // Start bridging antrol
                const antrian = await antrian_list.findOne({ where: { id } });
                let objUpdate = {
                    kodebooking: antrian.kode_booking_bpjs,
                    taskid: null,
                    waktu: moment().valueOf(),
                };
                if (status_antrian == 0) objUpdate.taskid = 99; // batal
                else if (status_antrian == 2) objUpdate.taskid = 4; // diproses loket
                else if (status_antrian == 9) objUpdate.taskid = 5; // selesai
                if (objUpdate.taskid) {
                    await antreanApi.post("/antrean/updatewaktu", objUpdate);
                }
                // End bridging antrol
                if (status_antrian == 1) {
                    let tgl = moment(tgl_antrian).format('YYYY-MM-DD')
                    let isi = jadwal_dokter_id?`and al.jadwal_dokter_id = '${jadwal_dokter_id}'`: layanan_ruang_id?`and al.layanan_ruang_id = '${layanan_ruang_id}'`:""
                    let sisa = await sq.query(`select count(*)as total from antrian_list al where al.status_antrian in (1,2) and date(al.tgl_antrian) = '${tgl}' ${isi}`, s);
                    data.nama_dokter= ""
                    data.nama_layanan_ruang= ""
                    data.sisa_antrian = sisa[0].total
                    
                    if (jadwal_dokter_id) {
                        let jadwal_dokter = await sq.query(`select jd.id as "jadwal_dokter_id", * from jadwal_dokter jd join ms_dokter md on md.id = jd.ms_dokter_id where jd."deletedAt" isnull and md."deletedAt" isnull and jd.id = '${jadwal_dokter_id}'`, s)
                        data.nama_dokter = jadwal_dokter[0].nama_dokter
                    }
                    if(layanan_ruang_id){
                        let layanan_ruang = await sq.query(`select * from layanan_ruang lr where lr."deletedAt" isnull and lr.id = '${layanan_ruang_id}'`,s)
                        data.nama_layanan_ruang= layanan_ruang[0].nama_layanan_ruang
                    }
                     
                    await t.commit();
                    io.to(room_id).emit("refresh_layar", {status: 200, message: 'sukses', data});
                    socket.emit("refresh_admin", data);
                } else {
                    if (status_antrian == 9 && booking_id) {
                        await booking.update({ status_booking: 9 }, { where: { id: booking_id }, transaction: t })
                    }
                    
                    await t.commit();
                    io.emit("refresh_admin", {status: 200, message: 'sukses', data});
                }
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('selesaiFarmasi', async (data, room_id) => {
            const { id, status_antrian, ms_loket_id, taskid } = data

            const t = await sq.transaction();
            try {
                await antrian_list.update({ status_antrian,ms_loket_id}, { where: { id }, transaction: t });
                // Start bridging antrol
                const antrian = await antrian_list.findOne({ where: { id } });
                let objUpdate = {
                    kodebooking: antrian.kode_booking_bpjs,
                    taskid: null,
                    waktu: moment().valueOf(),
                };
                if (status_antrian == 0) objUpdate.taskid = 99; // batal
                else if (status_antrian == 2) objUpdate.taskid = 6; // diproses loket
                else if (status_antrian == 9) objUpdate.taskid = 7; // selesai
                if (objUpdate.taskid) {
                    await antreanApi.post("/antrean/updatewaktu", objUpdate);
                }
                // End bridging antrol

                io.to(room_id).emit("refresh_layar_farmasi", {status: 200, message: 'sukses', data});
                socket.emit("refresh_admin_farmasi", {status: 200, message: 'sukses', data});
                
                await t.commit();
            } catch (error) {
                await t.rollback();
                console.log(error);
                socket.emit("error", { status: 500, message: "gagal" });
            }
        })

        socket.on('joinRoom', (room_id) => {
            socket.join(room_id);
            console.log(`join ${room_id}`);
            socket.emit("refresh_join","oke")
        })

        socket.on('leaveRoom', (room_id) => {
            socket.leave(room_id);
            console.log(`leave ${room_id}`);
        })

        socket.on('disconnect', () => {
            console.log('koneksi socket putus ...');
        });
    });
}

module.exports = { koneksi_socket }