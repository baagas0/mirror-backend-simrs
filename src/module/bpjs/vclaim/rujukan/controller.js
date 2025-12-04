const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const vclaim = require('../../../../helper/vclaim');

class Controller {
    static async getRujukanByNoRujukan(req, res) {
        const { noRujukan, tipe } = req.body
        // tipe => PCARE / RS
        try {
            let URL = ""
            if(tipe == 'RS'){
                URL = `Rujukan/RS/${noRujukan}`
            }else if(tipe == 'PCARE'){
                URL = `Rujukan/${noRujukan}`
            }

            const hasil = await vclaim.getBPJS({url_bpjs:URL})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data:hasil.data })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getRujukanBerdasarkanNomorKartuMulti(req, res) {
        const { noKartu,tipe } = req.body
          // tipe => PCARE / RS
        try {
            let URL = ''
            if(tipe=='RS'){
                URL = `Rujukan/RS/List/Peserta/${noKartu}`
            }else if(tipe == 'PCARE'){
                URL = `Rujukan/List/Peserta/${noKartu}`
            }

            const hasil = await vclaim.getBPJS({url_bpjs: URL})

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
    
    static async getRujukanKhusus(req, res) {
        const { bulan,tahun } = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs: `Rujukan/Khusus/List/Bulan/${bulan}/Tahun/${tahun}`})
            
            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].rujukan })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getSpesialistikRujukan(req, res) {
        const { kodePPK,tglrujukan } = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs: `Rujukan/ListSpesialistik/PPKRujukan/${kodePPK}/TglRujukan/${tglrujukan}`})
            
            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getSarana(req, res) {
        const { kodePPKrujuk } = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs: `Rujukan/ListSarana/PPKRujukan/${kodePPKrujuk}`})
            
            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getRujukanKeluarRS(req, res) {
        const { tglMulai, tglAkhir } = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs: `Rujukan/Keluar/List/tglMulai/${tglMulai}/tglAkhir/${tglAkhir}`})
            
            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].list })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDataRujukanKeluarRSberdasarkanNoRujukan(req, res) {
        const { noRujukan } = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs: `Rujukan/Keluar/${noRujukan}`})
            
            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].rujukan })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDataJumlahSEPrujukan(req, res) {
        const { jenisRujukan, noRujukan } = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs: `Rujukan/JumlahSEP/${jenisRujukan}/${noRujukan}`})
            
            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller
