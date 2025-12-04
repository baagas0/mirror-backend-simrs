const { labPengambilanSampel, labRegis, msDokter } = require('../../models');
const { v4: uuid_v4 } = require('uuid');
const { Op } = require('sequelize');

class Controller {
    static async createPengambilanSampel(req, res) {
        try {
            const {
                lab_regis_id,
                petugas_ambil_id,
                tanggal_ambil,
                volume_sampel,
                kondisi_sampel,
                lokasi_ambil,
                tipe_sampel,
                no_rak,
                suhu_penyimpanan,
                catatan_pengambilan
            } = req.body;

            // Cek apakah lab_regis ada
            const labReg = await labRegis.findByPk(lab_regis_id);
            if (!labReg) {
                // return error(res, 404, 'Pendaftaran lab tidak ditemukan');
                return res.status(404).json({ status: 404, message: 'Pendaftaran lab tidak ditemukan' });
            }

            // Cek apakah sudah ada pengambilan sampel yang aktif
            const existingPengambilan = await labPengambilanSampel.findOne({
                where: {
                    lab_regis_id,
                    status_pengambilan: [0, 1] // pending atau sedang diambil
                }
            });

            if (existingPengambilan) {
                // return error(res, 400, 'Sudah ada proses pengambilan sampel yang aktif');
                // return res.status(400).json({ status: 400, message: 'Sudah ada proses pengambilan sampel yang aktif' });
            }

            const id = uuid_v4();
            const pengambilanSampel = await labPengambilanSampel.create({
                id,
                lab_regis_id,
                petugas_ambil_id,
                tanggal_ambil,
                volume_sampel,
                kondisi_sampel,
                lokasi_ambil,
                tipe_sampel,
                no_rak,
                suhu_penyimpanan,
                catatan_pengambilan,
                status_pengambilan: 0 // pending
            });

            return res.status(200).json({ status: 200, message: "Pengambilan sampel berhasil dibuat", data: pengambilanSampel });
        } catch (err) {
            console.log('===> controller.js:58 ~ err', err);
            return res.status(500).json({ status: 500, message: "Gagal membuat pengambilan sampel", data: err.message });
        }
    }

    static async startPengambilanSampel(req, res) {
        try {
            const { id } = req.params;
            const { petugas_ambil_id } = req.body;

            const pengambilanSampel = await labPengambilanSampel.findByPk(id);
            if (!pengambilanSampel) {
                return error(res, 404, 'Pengambilan sampel tidak ditemukan');
            }

            if (pengambilanSampel.status_pengambilan !== 0) {
                return error(res, 400, 'Status pengambilan tidak valid untuk memulai');
            }

            await pengambilanSampel.update({
                status_pengambilan: 1, // sedang diambil
                waktu_mulai: new Date(),
                petugas_ambil_id
            });

            // return success(res, 200, pengambilanSampel, 'Pengambilan sampel dimulai');
            return res.status(200).json({ status: 200, message: "Pengambilan sampel dimulai", data: pengambilanSampel });
        } catch (err) {
            // return error(res, 500, err.message);
            return res.status(500).json({ status: 500, message: "Gagal memulai pengambilan sampel", data: err.message });
        }
    }

    static async finishPengambilanSampel(req, res) {
        try {
            const { id } = req.params;
            const {
                volume_sampel,
                kondisi_sampel,
                lokasi_ambil,
                tipe_sampel,
                no_rak,
                suhu_penyimpanan,
                catatan_pengambilan,
                keterangan
            } = req.body;

            const pengambilanSampel = await labPengambilanSampel.findByPk(id);
            if (!pengambilanSampel) {
                // return error(res, 404, 'Pengambilan sampel tidak ditemukan');
                return res.status(404).json({ status: 404, message: 'Pengambilan sampel tidak ditemukan' });
            }

            if (pengambilanSampel.status_pengambilan !== 1) {
                return res.status(400).json({ status: 400, message: 'Status pengambilan tidak valid untuk menyelesaikan' });
            }

            const updateData = {
                status_pengambilan: 2, // selesai
                waktu_selesai: new Date(),
                keterangan
            };

            if (volume_sampel) updateData.volume_sampel = volume_sampel;
            if (kondisi_sampel) updateData.kondisi_sampel = kondisi_sampel;
            if (lokasi_ambil) updateData.lokasi_ambil = lokasi_ambil;
            if (tipe_sampel) updateData.tipe_sampel = tipe_sampel;
            if (no_rak) updateData.no_rak = no_rak;
            if (suhu_penyimpanan) updateData.suhu_penyimpanan = suhu_penyimpanan;
            if (catatan_pengambilan) updateData.catatan_pengambilan = catatan_pengambilan;

            await pengambilanSampel.update(updateData);

            // Update status lab_regis ke 2 (sampel)
            await labRegis.update(
                {
                    status: 2,
                    tanggal_ambil_sampel: new Date()
                },
                { where: { id: pengambilanSampel.lab_regis_id } }
            );

            return res.status(200).json({ status: 200, message: "Pengambilan sampel selesai", data: pengambilanSampel });
        } catch (err) {
            return res.status(500).json({ status: 500, message: "Gagal menyelesaikan pengambilan sampel", data: err.message });
        }
    }

    static async cancelPengambilanSampel(req, res) {
        try {
            const { id } = req.params;
            const { keterangan } = req.body;

            const pengambilanSampel = await labPengambilanSampel.findByPk(id);
            if (!pengambilanSampel) {
                // return error(res, 404, 'Pengambilan sampel tidak ditemukan');
                return res.status(404).json({ status: 404, message: 'Pengambilan sampel tidak ditemukan' });
            }

            if (pengambilanSampel.status_pengambilan === 2) {
                return res.status(400).json({ status: 400, message: 'Tidak dapat membatalkan pengambilan sampel yang sudah selesai' });
            }

            await pengambilanSampel.update({
                status_pengambilan: 3, // gagal
                keterangan
            });

            return res.status(200).json({ status: 200, message: "Pengambilan sampel dibatalkan", data: pengambilanSampel });
        } catch (err) {
            return res.status(500).json({ status: 500, message: "Gagal membatalkan pengambilan sampel", data: err.message });
        }
    }

    static async getPengambilanSampelById(req, res) {
        try {
            const { id } = req.body;

            const pengambilanSampel = await labPengambilanSampel.findByPk(id, {
                include: [
                    {
                        model: labRegis,
                        as: 'labRegis',
                        include: ['ms_dokter', 'registrasi']
                    },
                    // 'petugasAmbil'
                    {
                        model: msDokter,
                        as: 'petugasAmbil',
                        foreignKey: 'petugas_ambil_id',
                        targetKey: 'id'
                    }
                ]
            });

            if (!pengambilanSampel) {
                // return error(res, 404, 'Pengambilan sampel tidak ditemukan');
                return res.status(404).json({ status: 404, message: 'Pengambilan sampel tidak ditemukan' });
            }

            return res.status(200).json({ status: 200, message: "Data pengambilan sampel berhasil diambil", data: [pengambilanSampel] });
        } catch (err) {
            console.log('===> controller.js:194 ~ err', err);
            return res.status(500).json({ status: 500, message: "Gagal mengambil data pengambilan sampel", data: err.message });
        }
    }

    static async getPengambilanSampelByLabRegisId(req, res) {
        try {
            const { lab_regis_id } = req.body;

            const pengambilanSampels = await labPengambilanSampel.findAll({
                where: { lab_regis_id },
                include: ['petugasAmbil'],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ status: 200, message: "Data pengambilan sampel berhasil diambil", data: pengambilanSampels });
        } catch (err) {
            return res.status(500).json({ status: 500, message: "Gagal mengambil data pengambilan sampel", data: err.message });
        }
    }

    static async getAllPengambilanSampel(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                tanggal_mulai,
                tanggal_selesai,
                petugas_ambil_id,
                lab_regis_id
            } = req.body;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const whereClause = {};

            if (status) whereClause.status_pengambilan = status;
            if (petugas_ambil_id) whereClause.petugas_ambil_id = petugas_ambil_id;

            if (tanggal_mulai && tanggal_selesai) {
                whereClause.tanggal_ambil = {
                    [Op.between]: [tanggal_mulai, tanggal_selesai]
                };
            }

            if (lab_regis_id) whereClause.lab_regis_id = lab_regis_id;

            const { count, rows } = await labPengambilanSampel.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: labRegis,
                        as: 'labRegis',
                        include: ['ms_dokter', 'registrasi']
                    },
                    'petugasAmbil'
                ],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            // return success(res, 200, {
            //     data: rows,
            //     total: count,
            //     page: parseInt(page),
            //     totalPages,
            //     limit: parseInt(limit)
            // }, 'Data pengambilan sampel berhasil diambil');
            return res.status(200).json({ 
                status: 200, 
                message: "Data pengambilan sampel berhasil diambil", 
                data: rows,
                total: count,
                page: parseInt(page),
                totalPages,
                limit: parseInt(limit)
                // data: {
                //     data: rows,
                //     total: count,
                //     page: parseInt(page),
                //     totalPages,
                //     limit: parseInt(limit)
                // },
            });
        } catch (err) {
            return res.status(500).json({ status: 500, message: "Gagal mengambil data pengambilan sampel", data: err.message });
        }
    }

    static async syncToSatuSehat(req, res) {
        try {
            const { id } = req.body;

            const pengambilanSampel = await labPengambilanSampel.findByPk(id, {
                include: [
                    {
                        model: labRegis,
                        as: 'labRegis',
                        include: ['dokter', 'registrasi']
                    },
                    'petugasAmbil'
                ]
            });

            if (!pengambilanSampel) {
                return error(res, 404, 'Pengambilan sampel tidak ditemukan');
            }

            // TODO: Implementasi integrasi dengan Satu Sehat
            // Di sini akan ada kode untuk mengirim data ke Satu Sehat API
            // const responseSatuSehat = await sendToSatuSehat(pengambilanSampel);

            // Untuk sementara, kita update status sync nya
            await pengambilanSampel.update({
                is_sync_satu_sehat: true,
                sync_satu_sehat_at: new Date(),
                // satu_sehat_id: responseSatuSehat.id // akan diisi setelah integrasi
            });

            // return success(res, 200, pengambilanSampel, 'Data berhasil disinkronkan ke Satu Sehat');
            return res.status(200).json({ status: 200, message: "Data berhasil disinkronkan ke Satu Sehat", data: pengambilanSampel });
        } catch (err) {
            return res.status(500).json({ status: 500, message: "Gagal menyinkronkan data ke Satu Sehat", data: err.message });
        }
    }
};

module.exports = Controller;