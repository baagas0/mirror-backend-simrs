const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const vclaim = require('../../../../helper/vclaim');

class Controller {
    static async insertSPRI(req, res) {
        const { noKartu, kodeDokter, poliKontrol, tglRencanaKontrol, user } = req.body

        try {
            let x =  {
                "request":
                    {
                        "noKartu":noKartu,
                        "kodeDokter":kodeDokter,
                        "poliKontrol":poliKontrol,
                        "tglRencanaKontrol":tglRencanaKontrol,
                        "user":user
                    }
            }

            const hasil = await vclaim.postBPJS({url_bpjs:`RencanaKontrol/InsertSPRI`,payload:x})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async updateSPRI(req, res) {
        const { noSPRI, kodeDokter, poliKontrol, tglRencanaKontrol, user } = req.body

        try {
            let x =  {
                "request":
                    {
                        "noSPRI":noSPRI,
                        "kodeDokter":kodeDokter,
                        "poliKontrol":poliKontrol,
                        "tglRencanaKontrol":tglRencanaKontrol,
                        "user":user
                    }
            }

            const hasil = await vclaim.putBPJS({url_bpjs:`RencanaKontrol/UpdateSPRI`,payload:x})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getCariSep(req, res) {
        const { noSEP } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`RencanaKontrol/nosep/${noSEP}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async insertRencanaKontrol(req, res) {
        const { noSEP, kodeDokter, poliKontrol, tglRencanaKontrol, user} = req.body

        try {
            let x = {
                "request": {
                    "noSEP": noSEP,
                    "kodeDokter": kodeDokter,
                    "poliKontrol": poliKontrol,
                    "tglRencanaKontrol": tglRencanaKontrol,
                    "user": user
                }
            }
            
            const hasil = await vclaim.postBPJS({url_bpjs:`RencanaKontrol/insert`,payload:x})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    
    static async updateRencanaKontrol(req, res) {
        const { noSuratKontrol, noSEP, kodeDokter, poliKontrol, tglRencanaKontrol, user} = req.body
        //tglRencanaKontrol => tgl tidak boleh sama ketika update
        try {
            let x = {
                "request": {
                    "noSuratKontrol": noSuratKontrol,
                    "noSEP": noSEP,
                    "kodeDokter": kodeDokter,
                    "poliKontrol": poliKontrol,
                    "tglRencanaKontrol": tglRencanaKontrol,
                    "user": user
                }
            }
            
            const hasil = await vclaim.putBPJS({url_bpjs:`RencanaKontrol/Update`,payload:x})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    
    static async deleteRencanaKontrol(req, res) {
        const { noSuratKontrol, user } = req.body

        try {
            let x = {
                "request": {
                    "t_suratkontrol":{
                    "noSuratKontrol": noSuratKontrol,
                    "user": user
                    }
                }
            }
            
            const hasil = await vclaim.deleteBPJS({url_bpjs:`RencanaKontrol/Delete`,payload:x})
            
            if (hasil.message != "Sukses") {
                res.status(201).json({ status: 204, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getNomorSuratKontrol(req, res) {
        const{noSuratKontrol} = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`RencanaKontrol/noSuratKontrol/${noSuratKontrol}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getNomorSuratKontrolByNoKartu(req, res) {
        const{ bulan,tahun,noKartu,filter } = req.body

        // Bulan. Contoh: Januari => 01
        // filter => 1: tanggal entri, 2: tanggal rencana kontrol
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`RencanaKontrol/ListRencanaKontrol/Bulan/${bulan}/Tahun/${tahun}/Nokartu/${noKartu}/filter/${filter}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDataNomorSuratKontrol(req, res) {
        const{ tglAwal,tglAkhir,filter } = req.body

        // filter => 1: tanggal entri, 2: tanggal rencana kontrol
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`RencanaKontrol/ListRencanaKontrol/tglAwal/${tglAwal}/tglAkhir/${tglAkhir}/filter/${filter}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDataPoli(req, res) {
        const{ jenisKontrol,nomor,tglRencanaKontrol } = req.body

        // jenisKontrol --> 1: SPRI, 2: Rencana Kontrol
        // nomor --> jika jenis kontrol = 1, maka diisi nomor kartu; jika jenis kontrol = 2, maka diisi nomor SEP
        // tglRencanaKontrol --> format yyyy-MM-dd

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`RencanaKontrol/ListSpesialistik/JnsKontrol/${jenisKontrol}/nomor/${nomor}/TglRencanaKontrol/${tglRencanaKontrol}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDataDokter(req, res) {
        const{ jenisKontrol,kodePoli,tglRencanaKontrol } = req.body

        // jenisKontrol --> 1: SPRI, 2: Rencana Kontrol
        // tglRencanaKontrol --> format yyyy-MM-dd

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`RencanaKontrol/JadwalPraktekDokter/JnsKontrol/${jenisKontrol}/KdPoli/${kodePoli}/TglRencanaKontrol/${tglRencanaKontrol}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller
