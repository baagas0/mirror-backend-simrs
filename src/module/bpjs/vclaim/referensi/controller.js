const { QueryTypes, json } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const moment = require('moment');
const vclaim = require('../../../../helper/vclaim');

class Controller {
    static async getDiagnosa(req, res) {
        const { kode } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/diagnosa/${kode}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].diagnosa })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getPoli(req, res) {
        const { kode } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/poli/${kode}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].poli })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getFaskesKesehatan(req, res) {
        const { kode,jenisFaskes } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/faskes/${kode}/${jenisFaskes}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].faskes })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getDokterDPJP(req, res) {
        const { jenisPelayanan,tglPelayanan,kode } = req.body

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/dokter/pelayanan/${jenisPelayanan}/tglPelayanan/${tglPelayanan}/Spesialis/${kode}`})

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
    
    static async getDiagnosaProgramPRB(req, res) {

        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/diagnosaprb`})

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

    static async getObatGenerikProgramPRB(req, res) {
        const {namaObat} = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/obatprb/${namaObat}`})

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

    static async getTindakan(req, res) {
        const {kode} = req.body
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/procedure/${kode}`})

            if (hasil.status != 200) {
                res.status(201).json({ status: hasil.status, message: hasil.message })
            } else {
                res.status(200).json({ status: 200, message: "sukses", data: hasil.data[0].procedure })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
    
    static async getKelasRawat(req, res) {
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/kelasrawat`})

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

    static async getDokter(req, res) {
        const {namaDokter} = req.body;
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/dokter/${namaDokter}`})

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

    static async getPropinsi(req, res) {
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/propinsi`})

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

    static async getKabupaten(req, res) {
        const {kodePropinsi} = req.body;
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/kabupaten/propinsi/${kodePropinsi}`})

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

    static async getKecamatan(req, res) {
        const {kodeKabupaten} = req.body;
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/kecamatan/kabupaten/${kodeKabupaten}`})

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

    static async getSpesialistik(req, res) {
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/spesialistik`})

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

    static async getRuangrawat(req, res) {
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/ruangrawat`})

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
    
    static async getCarakeluar(req, res) {
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/carakeluar`})

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

    static async getPascapulang(req, res) {
        try {
            const hasil = await vclaim.getBPJS({url_bpjs:`referensi/pascapulang`})

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
}

module.exports = Controller
