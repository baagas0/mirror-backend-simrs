const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const vclaim = require('../../../../helper/vclaim');

class Controller {
    static async getDataKunjungan(req, res) {
        const { tglSEP, jenisPelayanan } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`monitoring/Kunjungan/Tanggal/${tglSEP}/JnsPelayanan/${jenisPelayanan}`})

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

    static async getDataKlaim(req, res) {
        const { tglPulang,jenisPelayanan,statusKlaim } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`monitoring/Klaim/Tanggal/${tglPulang}/JnsPelayanan/${jenisPelayanan}/Status/${statusKlaim}`})

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

    static async getDataHistoriPelayananPeserta(req, res) {
        const { noKartuPeserta,tglMulai,tglAkhir } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`monitoring/HistoriPelayanan/NoKartu/${noKartuPeserta}/tglMulai/${tglMulai}/tglAkhir/${tglAkhir}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].histori })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller
