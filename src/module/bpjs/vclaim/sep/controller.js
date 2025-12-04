const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const vclaim = require('../../../../helper/vclaim');

class Controller {
    static async getFingerPrint(req, res) {
        const { noKartu, tanggal } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`SEP/FingerPrint/Peserta/${noKartu}/TglPelayanan/${tanggal}`})

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
        const { noSep } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`SEP/${noSep}`})

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

    static async getSEPinternal(req, res) {
        const {noSep} = req.body
        try {
            
            const hasil = await vclaim.getBPJS({url_bpjs:`SEP/Internal/${noSep}`})

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

    static async getDataPersetujuanSEP(req, res) {
        const {bulan, tahun} = req.body
        // bulan => 1-12
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`Sep/persetujuanSEP/list/bulan/${bulan}/tahun/${tahun}`})

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

    static async getIntegrasiSEPInacbg(req, res) {
        const {noSep} = req.body
        // bulan => 1-12
        try {
            const hasil = await vclaim.getBPJSnonDekrip({url_bpjs:`sep/cbg/${noSep}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message.code })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: [hasil.data[0].pesertasep] })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDataUpdateTglPulangSEP(req, res) {
        const {bulan,tahun,filter} = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`Sep/updtglplg/list/bulan/${bulan}/tahun/${tahun}/${filter}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil})
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }



    static async registerSEP(req, res) {
        try {
            let x = req.body
            
            const hasil = await vclaim.postBPJS({url_bpjs:`SEP/1.1/insert`,payload:x})

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

    static async registerSEP2(req, res) {
        try {
            let x = req.body
            
            const hasil = await vclaim.postBPJS({url_bpjs:`SEP/2.0/insert`,payload:x})

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

    static async deleteSEP2(req, res) {
        const { noSep, user} = req.body

        try {
            let x = {
                request: {
                   t_sep: {
                      noSep: noSep,
                      user: user
                   }
                }
             }
            
            const hasil = await vclaim.deleteBPJS({url_bpjs:`SEP/2.0/delete`,payload:x})

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

    static async updateSEP2(req, res) {
        try {
            let x = req.body
            
            const hasil = await vclaim.putBPJS({url_bpjs:`SEP/2.0/update`,payload:x})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data, x })
            }
        } catch (error) {
            console.log(error);
            console.log(req.body);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async deletesSEPinternal(req, res) {
        try {
            const x = req.body;

            const hasil = await vclaim.deleteBPJS({url_bpjs:`SEP/Internal/delete`,payload:x})

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
}

module.exports = Controller
