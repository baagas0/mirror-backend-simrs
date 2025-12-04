const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const axios = require('axios');
const moment = require('moment');
const vclaim = require('../../helper/vclaim');
const pcare = require('../../helper/pcare');


const vclaim_url = process.env.VCLAIM_URL
const pcare_url = process.env.PCARE_URL
const antrean_url = process.env.ANTREAN_URL

class Controller {

    // SEP
   

    static async getRujukanByNoRujukan(req, res) {
        const { no_rujukan } = req.body

        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/Rujukan/${no_rujukan}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getRencanaKontrolByNoSuratKontrol(req, res) {
        const { no_surat_kontrol } = req.body

        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/RencanaKontrol/noSuratKontrol/${no_surat_kontrol}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getPesertaByNoKartu(req, res) {
        let { no_kartu, jenis } = req.body

        try {
            // jenis => nik / bpjs
            if (jenis == 'bpjs') {
                jenis = 'nokartu'
            }
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/Peserta/${jenis}/${no_kartu}/tglSEP/${moment().format('yyyy-MM-DD')}`, headers);
            const data = hasil.data;

            // let data1 = await vclaim.getBPJS({url_bpjs:`Peserta/${jenis}/${no_kartu}/tglSEP/${moment().format('YYYY-MM-DD')}`})
            // console.log(data1);

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDiagnosa(req, res) {
        let { diagnosa } = req.body

        try {
            // diangnosa => Kode atau Nama Diagnosa
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/diagnosa/${diagnosa}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.diagnosa })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getPoli(req, res) {
        let { poli } = req.body

        try {
            // poli => Kode atau Nama Poli
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/poli/${poli}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.poli })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getTindakan(req, res) {
        let { tindakan } = req.body

        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/procedure/${tindakan}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.procedure })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getKelasRawat(req, res) {
        try {
            // poli => Kode atau Nama Poli
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/kelasrawat`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getCaraKeluar(req, res) {
        try {
            // poli => Kode atau Nama Poli
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/carakeluar`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getFasKes(req, res) {
        let { kode_faskes, jenis_faskes } = req.body
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/faskes/${kode_faskes}/${jenis_faskes}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDokterDPJP(req, res) {
        let { jenis_pelayanan, tgl_pelayanan, kode_spesialis } = req.body
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/dokter/pelayanan/${jenis_pelayanan}/tglPelayanan/${tgl_pelayanan}/Spesialis/${kode_spesialis}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDokter(req, res) {
        let { nama_dokter } = req.body
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/dokter/${nama_dokter}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getPropinsi(req, res) {
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/propinsi`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getKabupaten(req, res) {
        let { kode_propinsi } = req.body
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/kabupaten/propinsi/${kode_propinsi}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getKecamatan(req, res) {
        let { kode_kabupaten } = req.body
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })
            const hasil = await axios.get(`${vclaim_url}/referensi/kecamatan/kabupaten/${kode_kabupaten}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await vclaim.decriptVclaim({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: hasil_json.list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }



    // PCARE
    static async getPesertaByJenisKartu(req, res) {
        const { jenis_kartu, no_kartu } = req.body
        try {
            const time = moment().unix();
            const headers = await pcare.headerPcare({ time: time })
            const hasil = await axios.get(`${[pcare_url]}/peserta/${jenis_kartu}/${no_kartu}`, headers);
            const data = hasil.data;

            if (!data.response) {
                res.status(201).json({ status: data.metaData.code, message: data.metaData.message })
            } else {
                const isi = data.response
                const hasil_json = await pcare.decriptPcare({ time: time, isi: isi });
                res.status(200).json({ status: 200, message: "sukses", data: [hasil_json] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    // ANTREAN
    static async createAntrean(req, res) {
        const { kode_booking, jenis_pasien, nomor_kartu, nik, no_hp, kode_poli, nama_poli, no_rm, tgl_periksa, kode_dokter, nama_dokter, jam_praktek, jenis_kunjungan, nomor_referensi, nomor_antrean, angka_antrean, estimasi_dilayani, sisa_kuota_jkn, kuota_jkn, kuota_non_jkn, sisa_kuota_non_jkn, keterangan } = req.body

        try {
            const time = moment().unix();
            const headers = await pcare.headerPcare({ time: time })

            let objCreate = { kodebooking: kode_booking, jenispasien: jenis_pasien, nomorkartu: nomor_kartu, nik: nik, nohp: no_hp, kodepoli: kode_poli, namapoli: nama_poli, pasienbaru: 0, norm: no_rm, tanggalperiksa: tgl_periksa, kodedokter: kode_dokter, namadokter: nama_dokter, jampraktek: jam_praktek, jeniskunjungan: jenis_kunjungan, nomorreferensi: nomor_referensi, nomorantrean: nomor_antrean, angkaantrean: angka_antrean, estimasidilayani: time, sisakuotajkn: sisa_kuota_jkn, kuotajkn: kuota_jkn, sisakuotanonjkn: sisa_kuota_non_jkn, kuotanonjkn: kuota_non_jkn, keterangan: keterangan }

            let data = await axios.post(`${antrean_url}/antrean/add`, objCreate, headers)

            res.status(200).json({ status: 200, message: "sukses", data: data.data })
        } catch (error) {
            // console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async poli(req, res) {
        try {
            const time = moment().unix();
            const headers = await vclaim.headerVclaim({ time: time })

            console.log(`${vclaim_url}/ref/poli`);
            let data = await axios.get(`${antrean_url}/ref/poli`, headers)

            console.log(data);
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller