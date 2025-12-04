const member = require('./model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }

class Controller {
    static register(req, res) {
        const { no_rm_pasien, no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan } = req.body

        member.findAll({ where: { no_ktp } }).then(async hasilnya => {
            if (hasilnya.length) {
                res.status(201).json({ status: 204, message: "gagal, pasien tersebut sudah terdaftar" })
            } else {
                let foto_ktp = ""

                if (req.files) {
                    if (req.files.file1) {
                        foto_ktp = req.files.file1[0].filename
                    }
                }
                await member.create({ id: uuid_v4(), no_rm_pasien, no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan, user_id: req.dataUsers.id, status_persetujuan: !no_rm_pasien ? 1 : 2, foto_ktp }).then(data => {
                    res.status(200).json({ status: 200, message: "sukses", data })
                })
            }
        }).catch(error => {
            console.log(error)
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async acceptedPersetujuan(req, res) {
        const { id, no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan, status_persetujuan } = req.body
        try {
            if (status_persetujuan == 2) {
                // let kirim = await axios.post(purworejo + "/create-pasien-baru", { noKtp: no_ktp, nama: nama, noBpjs: no_bpjs, tempatLahir: tempat_lahir, tglLahir: tanggal_lahir, alamat: alamat, alamatDomisili: alamat_domisili, noHp: no_hp, jenisKelamin: jenis_kelamin, statusKawin: status_kawin, pekerjaan: pekerjaan, pendidikan: pendidikan, agama: agama, sukuBangsa: suku_bangsa, idProv: id_provinsi, idKota: id_kota, idKec: id_kecamatan, idKel: id_kelurahan, namaPenanggungjawab: nama_penanggung_jawab, hubunganDenganPasien: hubungan_dengan_pasien, alamatPenanggungjawab: alamat_penanggung_jawab, noHpPenanggungjawab: no_hp_penanggung_jawab, keterangan: keterangan }, config)

                let no_rm_pasien = kirim.data.data.noRM

                let data_member = await member.update({ status_persetujuan, no_rm_pasien }, { where: { id }, returning: true })

                res.status(200).json({ status: 200, message: "sukses", data: data_member[1][0] })
            } else {
                let data_member = await member.update({ status_persetujuan }, { where: { id }, returning: true })
                res.status(200).json({ status: 200, message: "sukses", data: data_member[1][0] })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMemberBaru(req, res) {
        try {
            let data = await sq.query(`select m.id as "member_id", * from "member" m where m."deletedAt" isnull and m.status_persetujuan = 1 order by m."createdAt" desc`, s)
            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async cekPasien(req, res) {
        const { no } = req.body
        // no_rm || nik || no_asuransi
        try {
            let data = await sq.query(`select p.id as "pasien_id", p.*,k3.nama_kelurahan,k3.kecamatan_id,k.nama_kecamatan,k.kota_id,k2.nama_kota,k2.provinsi_id,p2.nama_provinsi,
            me.nama_etnis,mgd.nama_golongan_darah,mp.nama_pekerjaan,mp2.nama_pendidikan
            from pasien p 
            left join kelurahan k3 on k3.id = p.kelurahan_id 
            left join kecamatan k on k.id = k3.kecamatan_id 
            left join kota k2 on k2.id = k.kota_id 
            left join provinsi p2 on p2.id = k2.provinsi_id 
            left join ms_etnis me on me.id = p.etnis_id 
            left join ms_golongan_darah mgd on mgd.id = p.golongan_darah_id 
            left join ms_pekerjaan mp on mp.id = p.pekerjaan_id 
            left join ms_pendidikan mp2 on mp2.id = p.pendidikan_id 
            where p."deletedAt" isnull and (p.no_rm ilike '%${no}%' or p.nik ilike '%${no}%' or p.no_asuransi_pasien ilike '%${no}%')`, s);
            
            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async update(req, res) {
        const { id, no_rm_pasien, no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan, user_id } = req.body

        const t = await sq.transaction();
        try {

            if (req.files) {
                if (req.files.file1) {
                    let foto_ktp = req.files.file1[0].filename
                    await member.update({ foto_ktp }, { where: { id }, transaction: t })
                }
            }

            await member.update({ no_rm_pasien, no_ktp, nama, no_bpjs, tempat_lahir, tanggal_lahir, alamat, alamat_domisili, no_hp, jenis_kelamin, status_kawin, pekerjaan, pendidikan, agama, suku_bangsa, id_provinsi, id_kota, id_kecamatan, id_kelurahan, nama_penanggung_jawab, hubungan_dengan_pasien, alamat_penanggung_jawab, no_hp_penanggung_jawab, keterangan, user_id }, { where: { id }, transaction: t })

            await t.commit();
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static deleteMember(req, res) {
        const { no_rm_pasien } = req.body

        member.destroy({ where: { no_rm_pasien, user_id: req.dataUsers.id } }).then(hasil => {
            res.status(200).json({ status: 200, message: "sukses" })
        }).catch(error => {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        })
    }

    static async listMemberByUserId(req, res) {
        const { user_id } = req.body

        try {
            let data = await sq.query(`select m.id as "member_id", * from member m where m.user_id = '${user_id}' and m."deletedAt" isnull and m."status_persetujuan" = 2`, s)

            res.status(200).json({ status: 200, message: "sukses", data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMemberBelumDiverifikasiByUserId(req, res) {
        const { user_id } = req.body

        try {
            let data = await sq.query(`select * from member m where m.user_id = '${user_id}' and m."deletedAt" isnull and m."status_persetujuan" = 1`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async listMemberDitolakByUserId(req, res) {
        const { user_id } = req.body

        try {
            let data = await sq.query(`select * from member m where m.user_id = '${user_id}' and m."deletedAt" isnull and m."status_persetujuan" = 0`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body
        try {
            let data = await sq.query(`select m.id as "member_id", * from "member" m where m."deletedAt" isnull and m.id = '${id}'`, s)

            res.status(200).json({ status: 200, message: "sukses", data: data })
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}

module.exports = Controller