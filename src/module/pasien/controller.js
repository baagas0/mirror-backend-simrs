const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const pasien = require("./model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };


class Controller {

    static register(req, res) {
        const { no_rm, satu_sehat_id, nik, nama_lengkap, kunjungan_pertama, jenis_kelamin, golongan_darah_id, agama, pendidikan_id, pekerjaan_id, perusahaan_tempat_bekerja, nip, npwp, no_telepon, bpjs_id, no_asuransi_pasien, tgl_lahir, tempat_lahir, alamat_ktp, alamat_sekarang, etnis_id, negara, kelurahan_id, nama_pasangan, nama_ayah, nama_ibu, nama_penjamin, hubungan_penjamin, sc_whatsapp, sc_email, dibuat_oleh, diperbarui_oleh } = req.body

        pasien.findAll({ where: { nik } }).then(async (data) => {
            if (data.length) {
                res.status(201).json({ status: 204, message: "data sudah ada" });
            } else {
                // let total = await sq.query(`select count(*) as "jumlah" from pasien`, s)
                pasien.create({ id: uuid_v4(), no_rm, satu_sehat_id, nik, nama_lengkap, kunjungan_pertama, jenis_kelamin, golongan_darah_id, agama, pendidikan_id, pekerjaan_id, perusahaan_tempat_bekerja, nip, npwp, no_telepon, bpjs_id, no_asuransi_pasien, tgl_lahir, tempat_lahir, alamat_ktp, alamat_sekarang, etnis_id, negara, kelurahan_id, nama_pasangan, nama_ayah, nama_ibu, nama_penjamin, hubungan_penjamin, sc_whatsapp, sc_email, dibuat_oleh, diperbarui_oleh }).then(data2 => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 });
                }).catch(err1 => {
            console.log(req.body);
            console.log(err1);
            res.status(500).json({ status: 500, message: "gagal", data: err1 });
        })
            }
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static update(req, res) {
        const { id, no_rm, satu_sehat_id, nik, nama_lengkap, kunjungan_pertama, jenis_kelamin, golongan_darah_id, agama, pendidikan_id, pekerjaan_id, perusahaan_tempat_bekerja, nip, npwp, no_telepon, bpjs_id, no_asuransi_pasien, tgl_lahir, tempat_lahir, alamat_ktp, alamat_sekarang, etnis_id, negara, kelurahan_id, nama_pasangan, nama_ayah, nama_ibu, nama_penjamin, hubungan_penjamin, sc_whatsapp, sc_email, dibuat_oleh, diperbarui_oleh, status_pasien } = req.body

        pasien.update({ no_rm, satu_sehat_id, nik, nama_lengkap, kunjungan_pertama, jenis_kelamin, golongan_darah_id, agama, pendidikan_id, pekerjaan_id, perusahaan_tempat_bekerja, nip, npwp, no_telepon, bpjs_id, no_asuransi_pasien, tgl_lahir, tempat_lahir, alamat_ktp, alamat_sekarang, etnis_id, negara, kelurahan_id, nama_pasangan, nama_ayah, nama_ibu, nama_penjamin, hubungan_penjamin, sc_whatsapp, sc_email, dibuat_oleh, diperbarui_oleh, status_pasien }, { where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static delete(req, res) {
        const { id } = req.body

        pasien.destroy({ where: { id } }).then(data => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch(err => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        })
    }

    static async list(req, res) {
        const { satu_sehat_id, nama_lengkap, nik, no_rm, alamat_sekarang, alamat_ktp, no_asuransi_pasien, nama_ibu, status_pasien } = req.body
        try {
            let isi = ""
            if (nama_lengkap) {
                isi += `and p.nama_lengkap ilike '%${nama_lengkap}%' `
            }
            if (nik) {
                isi += `and p.nik ilike '%${nik}%' `
            }
            if (no_rm) {
                isi += `and p.no_rm ilike '%${no_rm}%' `
            }
            if (alamat_sekarang) {
                isi += `and p.alamat_sekarang ilike '%${alamat_sekarang}%' `
            }
            if (alamat_ktp) {
                isi += `and p.alamat_ktp ilike '%${alamat_ktp}%' `
            }
            if (no_asuransi_pasien) {
                isi += `and p.no_asuransi_pasien ilike '%${no_asuransi_pasien}%' `
            }
            if (nama_ibu) {
                isi += `and p.nama_ibu ilike '%${nama_ibu}%' `
            }
            if (satu_sehat_id) {
                isi += `and p.satu_sehat_id = '${satu_sehat_id}' `
            }
            if (!status_pasien) {
                isi += `and p.status_pasien = 1 `
            } else {
                isi += `and p.status_pasien = ${status_pasien} `
            }

            let data = await sq.query(`select p.id as "pasien_id", * from pasien p left join kelurahan k3 on k3.id = p.kelurahan_id left join kecamatan k on k.id = k3.kecamatan_id left join kota k2 on k2.id = k.kota_id left join provinsi p2 on p2.id = k2.provinsi_id left join ms_etnis me on me.id = p.etnis_id left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id left join ms_pekerjaan mp on mp.id = p.pekerjaan_id left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id where p."deletedAt" isnull ${isi} order by p."createdAt" desc`, s);

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listPerHalaman(req, res) {
        const { nama_lengkap, nik, no_rm, alamat_sekarang, alamat_ktp, no_asuransi_pasien, nama_ibu, status_pasien, halaman, jumlah, search } = req.body
        try {
            let offset = (+halaman - 1) * jumlah;
            let isi = ""

            if (nama_lengkap) {
                isi += `and p.nama_lengkap ilike '%${nama_lengkap}%' `
            }
            if (nik) {
                isi += `and p.nik ilike '%${nik}%' `
            }
            if (no_rm) {
                isi += `and p.no_rm ilike '%${no_rm}%' `
            }
            if (alamat_sekarang) {
                isi += `and p.alamat_sekarang ilike '%${alamat_sekarang}%' `
            }
            if (alamat_ktp) {
                isi += `and p.alamat_ktp ilike '%${alamat_ktp}%' `
            }
            if (no_asuransi_pasien) {
                isi += `and p.no_asuransi_pasien ilike '%${no_asuransi_pasien}%' `
            }
            if (nama_ibu) {
                isi += `and p.nama_ibu ilike '%${nama_ibu}%' `
            }
            if (!status_pasien) {
                isi += `and p.status_pasien = 1 `
            } else {
                isi += `and p.status_pasien = ${status_pasien} `
            }
            if (search) {
                isi += ` and p.nama_lengkap ilike '%${search}%' or p.nik ilike '%${nik}%' or p.no_rm ilike '%${no_rm}%' ` 
            }

            let data = await sq.query(`select p.id as "pasien_id", * from pasien p left join kelurahan k3 on k3.id = p.kelurahan_id left join kecamatan k on k.id = k3.kecamatan_id left join kota k2 on k2.id = k.kota_id left join provinsi p2 on p2.id = k2.provinsi_id left join ms_etnis me on me.id = p.etnis_id left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id left join ms_pekerjaan mp on mp.id = p.pekerjaan_id left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id where p."deletedAt" isnull ${isi} order by p."createdAt" desc limit ${jumlah} offset ${offset}`, s);
            let jml = await sq.query(`select count(*)as total from pasien p left join kelurahan k3 on k3.id = p.kelurahan_id left join kecamatan k on k.id = k3.kecamatan_id left join kota k2 on k2.id = k.kota_id left join provinsi p2 on p2.id = k2.provinsi_id left join ms_etnis me on me.id = p.etnis_id left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id left join ms_pekerjaan mp on mp.id = p.pekerjaan_id left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id where p."deletedAt" isnull ${isi}`, s);

            res.status(200).json({ status: 200, message: "sukses", data, count: jml[0].total, jumlah, halaman });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select p.id as "pasien_id", * from pasien p left join kelurahan k3 on k3.id = p.kelurahan_id left join kecamatan k on k.id = k3.kecamatan_id left join kota k2 on k2.id = k.kota_id left join provinsi p2 on p2.id = k2.provinsi_id left join ms_etnis me on me.id = p.etnis_id left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id left join ms_pekerjaan mp on mp.id = p.pekerjaan_id left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id where p."deletedAt" isnull and p.id = '${id}'`, s);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsByNIK(req, res) {
        const { NIK } = req.body
        try {
            let data = await sq.query(`select p.id as "pasien_id", * from pasien p left join kelurahan k3 on k3.id = p.kelurahan_id left join kecamatan k on k.id = k3.kecamatan_id left join kota k2 on k2.id = k.kota_id left join provinsi p2 on p2.id = k2.provinsi_id left join ms_etnis me on me.id = p.etnis_id left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id left join ms_pekerjaan mp on mp.id = p.pekerjaan_id left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id where p."deletedAt" isnull and p.nik = '${NIK}'`, s);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsByNorm(req, res) {
        const { no_rm } = req.body
        try {
            let data = await sq.query(`select p.id as "pasien_id", * from pasien p left join kelurahan k3 on k3.id = p.kelurahan_id left join kecamatan k on k.id = k3.kecamatan_id left join kota k2 on k2.id = k.kota_id left join provinsi p2 on p2.id = k2.provinsi_id left join ms_etnis me on me.id = p.etnis_id left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id left join ms_pekerjaan mp on mp.id = p.pekerjaan_id left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id where p."deletedAt" isnull and p.no_rm = '${no_rm}'`, s);
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async getRmTerakhir(req, res) {
      try {
          let data = await sq.query(`select * from pasien p order by p."createdAt" desc limit 1`, s)
          const no_rm = data && data.length ? data[0].no_rm : 0;
          res.status(200).json({ status: 200, message: "sukses", data: { no_rm: no_rm } });
      } catch (error) {
          res.status(500).json({ status: 500, message: "gagal", data: error })
      }
    }
}
module.exports = Controller;
