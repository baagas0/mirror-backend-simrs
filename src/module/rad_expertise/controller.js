const rad_expertise = require('./model');
const rad_hasil = require('../rad_hasil/model');
const ms_dokter = require('../ms_dokter/model');
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');
const RadiologyExpertisePDF = require('./pdfGenerator');

class Controller {
    // Membuat expertise baru
    static async register(req, res) {
        const {
            rad_hasil_id,
            temuan,
            kesimpulan,
            saran,
            status_expertise = 'draft',
            additional_findings,
            measurements,
            comparison_notes,
            technique,
            clinical_correlation,
            limitations,
            urgency_level = 'routine',
            report_type = 'final',
            critical_findings = false,
            technique_used,
            assigned_radiolog
        } = req.body;

        let primary_image = ""
        if (req.files) {
            if (req.files.file1) {
                primary_image = req.files.file1[0].filename
            }
        }

        const t = await sq.transaction();

        try {
            // Validasi rad_hasil exists
            const radHasilExist = await rad_hasil.findByPk(rad_hasil_id);
            if (!radHasilExist) {
                // await t.rollback();
                return res.status(404).json({ status: 404, message: "Data hasil radiologi tidak ditemukan" });
            }

            // Check apakah ada draft yang belum selesai untuk rad_hasil_id yang sama
            const existingDraft = await rad_expertise.findOne({
                where: {
                    rad_hasil_id,
                    status_expertise: 'draft',
                    radiolog_id: assigned_radiolog
                }
            });

            if (existingDraft) {
                console.log('===> controller.js:53 ~ existingDraft ', existingDraft);
                // await t.rollback();
                return res.status(400).json({
                    status: 400,
                    message: "Anda masih memiliki draft expertise yang belum selesai untuk pemeriksaan ini"
                });
            }

            // Buat expertise baru
            const newExpertise = await rad_expertise.create({
                id: uuid_v4(),
                primary_image,
                rad_hasil_id,
                radiolog_id: assigned_radiolog,
                temuan,
                kesimpulan,
                saran,
                status_expertise,
                additional_findings,
                measurements,
                comparison_notes,
                technique: technique || technique_used,
                clinical_correlation,
                limitations,
                urgency_level,
                report_type,
                critical_findings,
                created_by: req.dataUsers?.id,
                updated_by: req.dataUsers?.id
            }, { transaction: t });

            await t.commit();

            // Get full data with associations
            const expertiseData = await Controller.getExpertiseById(newExpertise.id);

            res.status(200).json({
                status: 200,
                message: "Expertise berhasil dibuat",
                data: expertiseData
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal membuat expertise", data: error.message });
        }
    }

    // Update expertise
    static async update(req, res) {
        const {
            id,
            temuan,
            kesimpulan,
            saran,
            status_expertise,
            additional_findings,
            measurements,
            comparison_notes,
            technique,
            clinical_correlation,
            limitations,
            urgency_level,
            report_type,
            critical_findings,
            critical_findings_notified
        } = req.body;

        let primary_image = ""
        if (req.files) {
            if (req.files.file1) {
                primary_image = req.files.file1[0].filename
            }
        }

        try {
            // Cek expertise exists
            const expertiseExist = await rad_expertise.findByPk(id);
            if (!expertiseExist) {
                return res.status(404).json({ status: 404, message: "Expertise tidak ditemukan" });
            }

            // Validasi: hanya radiolog yang sama atau admin yang bisa update
            if (expertiseExist.radiolog_id !== req.dataUsers?.id && req.dataUsers?.role !== 'admin') {
                // return res.status(403).json({ status: 403, message: "Anda tidak berhak mengupdate expertise ini" });
            }

            // Update data
            const updateData = {
                temuan,
                kesimpulan,
                saran,
                additional_findings,
                measurements,
                comparison_notes,
                technique,
                clinical_correlation,
                limitations,
                urgency_level,
                report_type,
                critical_findings,
                critical_findings_notified,
                updated_by: req.dataUsers?.id
            };

            if (primary_image) {
                updateData.primary_image = primary_image;
            }

            // Update status jika ada perubahan
            if (status_expertise && status_expertise !== expertiseExist.status_expertise) {
                updateData.status_expertise = status_expertise;

                // Hitung waktu completion jika status berubah ke final
                if (status_expertise === 'final' && !expertiseExist.report_completion_time) {
                    const createdAt = moment(expertiseExist.createdAt);
                    const now = moment();
                    const durationMinutes = now.diff(createdAt, 'minutes');
                    updateData.report_completion_time = durationMinutes;
                }
            }

            await rad_expertise.update(updateData, { where: { id } });

            // Get updated data
            const updatedData = await Controller.getExpertiseById(id);

            res.status(200).json({
                status: 200,
                message: "Expertise berhasil diupdate",
                data: updatedData
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal mengupdate expertise", data: error.message });
        }
    }

    // Submit expertise (draft to final)
    static async submit(req, res) {
        const { id } = req.body;

        const t = await sq.transaction();

        try {
            const expertise = await rad_expertise.findByPk(id, { transaction: t });
            if (!expertise) {
                await t.rollback();
                return res.status(404).json({ status: 404, message: "Expertise tidak ditemukan" });
            }

            // Validasi: hanya radiolog yang sama
            if (expertise.radiolog_id !== req.dataUsers?.id) {
                await t.rollback();
                return res.status(403).json({ status: 403, message: "Anda tidak berhak mensubmit expertise ini" });
            }

            // Validasi data sebelum submit
            if (!expertise.kesimpulan || !expertise.temuan) {
                await t.rollback();
                return res.status(400).json({
                    status: 400,
                    message: "Temuan dan kesimpulan harus diisi sebelum submit"
                });
            }

            // Calculate completion time
            const createdAt = moment(expertise.createdAt);
            const now = moment();
            const durationMinutes = now.diff(createdAt, 'minutes');

            await rad_expertise.update({
                status_expertise: 'final',
                report_completion_time: durationMinutes,
                updated_by: req.dataUsers?.id
            }, {
                where: { id },
                transaction: t
            });

            await t.commit();

            // Get updated data
            const updatedData = await Controller.getExpertiseById(id);

            res.status(200).json({
                status: 200,
                message: "Expertise berhasil disubmit",
                data: updatedData
            });

        } catch (error) {
            await t.rollback();
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal mensubmit expertise", data: error.message });
        }
    }

    // Request second opinion
    static async requestSecondOpinion(req, res) {
        const { id, peer_reviewer_id, reason } = req.body;

        try {
            const expertise = await rad_expertise.findByPk(id);
            if (!expertise) {
                return res.status(404).json({ status: 404, message: "Expertise tidak ditemukan" });
            }

            // Cek peer reviewer exists dan adalah dokter
            const reviewer = await ms_dokter.findByPk(peer_reviewer_id);
            if (!reviewer) {
                return res.status(404).json({ status: 404, message: "Peer reviewer tidak ditemukan" });
            }

            await rad_expertise.update({
                status_expertise: 'second_opinion',
                peer_reviewer_id,
                peer_review_status: 'pending',
                updated_by: req.dataUsers?.id
            }, { where: { id } });

            // Get updated data
            const updatedData = await Controller.getExpertiseById(id);

            res.status(200).json({
                status: 200,
                message: "Second opinion berhasil direquest",
                data: updatedData
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal request second opinion", data: error.message });
        }
    }

    // Peer review
    static async peerReview(req, res) {
        const { id, status, notes } = req.body;

        try {
            const expertise = await rad_expertise.findByPk(id);
            if (!expertise) {
                return res.status(404).json({ status: 404, message: "Expertise tidak ditemukan" });
            }

            // Validasi: hanya peer reviewer yang bisa review
            if (expertise.peer_reviewer_id !== req.dataUsers?.id) {
                return res.status(403).json({ status: 403, message: "Anda tidak berhak melakukan peer review" });
            }

            await rad_expertise.update({
                peer_review_status: status,
                peer_review_notes: notes,
                updated_by: req.dataUsers?.id
            }, { where: { id } });

            // Get updated data
            const updatedData = await Controller.getExpertiseById(id);

            res.status(200).json({
                status: 200,
                message: "Peer review berhasil disimpan",
                data: updatedData
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal melakukan peer review", data: error.message });
        }
    }

    // Get expertise by ID with full associations
    static async getExpertiseById(id) {
        try {
            console.log('===> controller.js:316 ~ id', id);
            const data = await sq.query(`
                SELECT
                    re.*,
                    rh.tanggal_pemeriksaan,
                    rh.hasil as hasil_rad,
                    rh.kesan as kesan_rad,
                    rh.saran as saran_rad,
                    rad.nama_dokter as nama_radiolog,
                    rad.ms_specialist_id,
                    peer.nama_dokter as nama_peer_reviewer,
                    peer.ms_specialist_id as spesialisasi_peer_reviewer,
                    rr.registrasi_id,
                    p.no_rm,
                    p.nama_lengkap as nama_pasien,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    d.nama_dokter as nama_dokter_pengirim,
                    rt.nama_rad_test,
                    pp.nama_penunjang
                FROM rad_expertise re
                LEFT JOIN rad_hasil rh ON rh.id = re.rad_hasil_id
                LEFT JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                LEFT JOIN ms_dokter peer ON peer.id = re.peer_reviewer_id
                WHERE re.id = $1 AND re."deletedAt" IS NULL
            `, { ...s, bind: [id] });

            return data[0] || null;
        } catch (error) {
            console.error('Error in getExpertiseById:', error);
            return null;
        }
    }

    // Get detail by ID
    static async detailsById(req, res) {
        const { id } = req.body;

        try {
            const data = await Controller.getExpertiseById(id);
            if (!data) {
                return res.status(404).json({ status: 404, message: "Data tidak ditemukan" });
            }

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error.message });
        }
    }

    // Helper method untuk create - rename agar konsisten dengan naming
    static async create(req, res) {
        return await Controller.register(req, res);
    }

    // List expertise with filtering and pagination
    static async list(req, res) {
        const {
            page = 1,
            perPage = 10,
            search,
            startDate,
            endDate,
            status_expertise,
            radiolog_id,
            urgency_level,
            critical_findings,
            report_type,
            rad_hasil_id,
            rad_regis_id
        } = req.body;

        let param = '';
        let paramCount = '';
        let offset = (page - 1) * perPage;

        // Filter berdasarkan rentang tanggal
        if (startDate && endDate) {
            param += ` AND DATE(re."createdAt") BETWEEN '${startDate}' AND '${endDate}'`;
            paramCount += ` AND DATE(re."createdAt") BETWEEN '${startDate}' AND '${endDate}'`;
        }

        // Filter berdasarkan status expertise
        if (status_expertise) {
            param += ` AND re.status_expertise = '${status_expertise}'`;
            paramCount += ` AND re.status_expertise = '${status_expertise}'`;
        }

        // Filter berdasarkan radiolog
        if (radiolog_id) {
            param += ` AND re.radiolog_id = '${radiolog_id}'`;
            paramCount += ` AND re.radiolog_id = '${radiolog_id}'`;
        }

        // Filter berdasarkan urgency level
        if (urgency_level) {
            param += ` AND re.urgency_level = '${urgency_level}'`;
            paramCount += ` AND re.urgency_level = '${urgency_level}'`;
        }

        // Filter critical findings
        if (critical_findings !== undefined) {
            param += ` AND re.critical_findings = ${critical_findings}`;
            paramCount += ` AND re.critical_findings = ${critical_findings}`;
        }

        // Filter report type
        if (report_type) {
            param += ` AND re.report_type = '${report_type}'`;
            paramCount += ` AND re.report_type = '${report_type}'`;
        }

        // Search berdasarkan nama pasien, RM, atau radiolog
        if (search) {
            param += ` AND (r.nama_lengkap ILIKE '%${search}%' OR r.no_rm ILIKE '%${search}%' OR rad.nama_dokter ILIKE '%${search}%')`;
            paramCount += ` AND (r.nama_lengkap ILIKE '%${search}%' OR r.no_rm ILIKE '%${search}%' OR rad.nama_dokter ILIKE '%${search}%')`;
        }

        // Filter berdasarkan rad_hasil_id
        if (rad_hasil_id) {
            param += ` AND re.rad_hasil_id = '${rad_hasil_id}'`;
            paramCount += ` AND re.rad_hasil_id = '${rad_hasil_id}'`;
        }

        // Filter berdasarkan rad_regis_id
        if (rad_regis_id) {
            param += ` AND rh.rad_regis_id = '${rad_regis_id}'`;
            paramCount += ` AND rh.rad_regis_id = '${rad_regis_id}'`;
        }

        try {
            // Query utama
            let data = await sq.query(`
                SELECT
                    re.rad_hasil_id,
                    re.radiolog_id,
                    re.status_expertise,
                    re.version,
                    re.urgency_level,
                    re.report_type,
                    re.critical_findings,
                    re.critical_findings_notified,
                    re.peer_review_status,
                    re.report_completion_time,
                    re."createdAt",
                    re."updatedAt",
                    re.*,
                    rad.nama_dokter as nama_radiolog,
                    rad.ms_specialist_id,
                    p.no_rm,
                    p.nama_lengkap as nama_pasien,
                    p.jenis_kelamin,
                    d.nama_dokter as nama_dokter_pengirim,
                    rt.nama_rad_test,
                    rh.tanggal_pemeriksaan,
                    rr.registrasi_id,
                    rr.tanggal_request,
                    p.*,
                    re.id as id,
                    pp.nama_penunjang
                FROM rad_expertise re
                JOIN rad_hasil rh ON rh.id = re.rad_hasil_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                WHERE re."deletedAt" IS NULL
                    AND r."deletedAt" IS NULL
                    ${param}
                ORDER BY re."createdAt" DESC
                LIMIT ${perPage} OFFSET ${offset}
            `, s);

            // Query untuk total count
            let countData = await sq.query(`
                SELECT COUNT(*) as total
                FROM rad_expertise re
                JOIN rad_hasil rh ON rh.id = re.rad_hasil_id
                LEFT JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                WHERE re."deletedAt" IS NULL
                    AND r."deletedAt" IS NULL
                    ${paramCount}
            `, s);

            const total = countData[0]?.total || 0;

            res.status(200).json({
                status: 200,
                message: "sukses",
                data,
                pagination: {
                    page: parseInt(page),
                    perPage: parseInt(perPage),
                    total,
                    totalPages: Math.ceil(total / perPage)
                }
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error.message });
        }
    }

    // Get expertise by rad_hasil_id
    static async getByRadHasilId(req, res) {
        const { rad_hasil_id } = req.body;

        try {
            const data = await rad_expertise.findAll({
                where: { rad_hasil_id },
                include: [
                    { model: ms_dokter, as: 'radiolog', attributes: ['id', 'nama_lengkap', 'spesialisasi'] },
                    { model: ms_dokter, as: 'peer_reviewer', attributes: ['id', 'nama_lengkap', 'spesialisasi'] }
                ],
                order: [['version', 'DESC']]
            });

            res.status(200).json({ status: 200, message: "sukses", data });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error.message });
        }
    }

    // Delete expertise
    static async delete(req, res) {
        const { id } = req.body;

        try {
            const expertise = await rad_expertise.findByPk(id);
            if (!expertise) {
                return res.status(404).json({ status: 404, message: "Expertise tidak ditemukan" });
            }

            // Validasi: hanya bisa delete draft
            if (expertise.status_expertise !== 'draft') {
                return res.status(400).json({
                    status: 400,
                    message: "Hanya draft yang bisa dihapus"
                });
            }

            await rad_expertise.update({
                deleted_by: req.dataUsers?.id,
                deleted_name: req.dataUsers?.username
            }, { where: { id } });

            await rad_expertise.destroy({ where: { id } });

            res.status(200).json({ status: 200, message: "Expertise berhasil dihapus" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal menghapus expertise", data: error.message });
        }
    }

    // Get statistics
    static async getStatistics(req, res) {
        const { startDate, endDate, radiolog_id } = req.body;

        let dateFilter = '';
        if (startDate && endDate) {
            dateFilter = ` AND DATE(re."createdAt") BETWEEN '${startDate}' AND '${endDate}'`;
        }

        let radiologFilter = '';
        if (radiolog_id) {
            radiologFilter = ` AND re.radiolog_id = '${radiolog_id}'`;
        }

        try {
            const statistics = await sq.query(`
                SELECT
                    COUNT(*) as total_expertise,
                    COUNT(CASE WHEN re.status_expertise = 'final' THEN 1 END) as final_expertise,
                    COUNT(CASE WHEN re.status_expertise = 'draft' THEN 1 END) as draft_expertise,
                    COUNT(CASE WHEN re.status_expertise = 'second_opinion' THEN 1 END) as second_opinion_expertise,
                    COUNT(CASE WHEN re.critical_findings = true THEN 1 END) as critical_findings,
                    COUNT(CASE WHEN re.urgency_level = 'urgent' THEN 1 END) as urgent_cases,
                    COUNT(CASE WHEN re.urgency_level = 'critical' THEN 1 END) as critical_cases,
                    AVG(re.report_completion_time) as avg_completion_time,
                    COUNT(CASE WHEN re.peer_review_status = 'approved' THEN 1 END) as peer_review_approved,
                    COUNT(CASE WHEN re.peer_review_status = 'pending' THEN 1 END) as peer_review_pending
                FROM rad_expertise re
                WHERE re."deletedAt" IS NULL
                    ${dateFilter}
                    ${radiologFilter}
            `, s);

            res.status(200).json({
                status: 200,
                message: "sukses",
                data: statistics[0]
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal mendapatkan statistik", data: error.message });
        }
    }

    // Export expertise to PDF
    static async exportPDF(req, res) {
        const { id, includeImages = false, includeMeasurements = true, includeComparison = true } = req.body;

        try {
            // Get detailed expertise data
            const expertiseData = await sq.query(`
                SELECT
                    re.*,
                    rh.tanggal_pemeriksaan,
                    rh.hasil as hasil_rad,
                    rh.kesan as kesan_rad,
                    rh.saran as saran_rad,
                    rh.queue,
                    rh.file_tambahan,
                    rr.registrasi_id,
                    rr.diagnosa,
                    rr.tanggal_request,
                    rr.tanggal_ambil_sampel,
                    rr.list_test,
                    rr.klinis,
                    rr.is_cito,
                    rr.is_puasa,
                    rr.proyeksi,
                    rr.kv,
                    rr.mas,
                    rr.ffd,
                    rr.bsf,
                    rr.inak,
                    rr.jumlah_penyinaran,
                    rr.dosis_radiasi,
                    rr.keterangan_rad_regis,
                    rr.status as status_regis,
                    rt.nama_rad_test,
                    rt.keterangan_rad_test,
                    pp.nama_penunjang,
                    pp.keterangan_penunjang as deskripsi,
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.alamat_sekarang,
                    d.nama_dokter as nama_dokter_pengirim,
                    d.ms_specialist_id as spesialisasi_dokter,
                    rad.nama_dokter as nama_radiolog,
                    rad.ms_specialist_id,
                    peer.nama_dokter nama_peer_reviewer,
                    peer.ms_specialist_id as spesialisasi_peer_reviewer
                FROM rad_expertise re
                LEFT JOIN rad_hasil rh ON rh.id = re.rad_hasil_id
                LEFT JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                LEFT JOIN ms_dokter peer ON peer.id = re.peer_reviewer_id
                WHERE re.id = $1 AND re."deletedAt" IS NULL
            `, { ...s, bind: [id] });

            if (!expertiseData || expertiseData.length === 0) {
                return res.status(404).json({ status: 404, message: "Data expertise tidak ditemukan" });
            }

            const data = expertiseData[0];

            // Generate PDF
            const pdfGenerator = new RadiologyExpertisePDF(data, {
                includeImages,
                includeMeasurements,
                includeComparison,
                language: 'id'
            });

            const pdfBuffer = await pdfGenerator.generatePDF();

            // Set response headers
            const filename = `Expertise_Radiologi_${data.nama_pasien}_${moment().format('YYYY-MM-DD')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal membuat PDF", data: error.message });
        }
    }

    // Export multiple expertises to PDF
    static async exportMultiplePDF(req, res) {
        const { ids, includeImages = false, includeMeasurements = true, includeComparison = true } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ status: 400, message: "IDs are required and must be an array" });
        }

        try {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument();
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                const filename = `Expertise_Radiologi_Multiple_${moment().format('YYYY-MM-DD')}.pdf`;
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Length', pdfBuffer.length);
                res.send(pdfBuffer);
            });

            // Generate each expertise and add to document
            for (let i = 0; i < ids.length; i++) {
                if (i > 0) {
                    doc.addPage();
                }

                const expertiseData = await sq.query(`
                    SELECT
                        re.*,
                        rh.tanggal_pemeriksaan,
                        rt.nama_rad_test,
                        p.no_rm,
                        p.nama_lengkap,
                        p.jenis_kelamin,
                        p.tgl_lahir,
                        d.nama_dokter as nama_dokter_pengirim,
                        rad.nama_dokter as nama_radiolog
                    FROM rad_expertise re
                    LEFT JOIN rad_hasil rh ON rh.id = re.rad_hasil_id
                    LEFT JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                    WHERE re.id = $1 AND re."deletedAt" IS NULL
                `, { ...s, bind: [ids[i]] });

                if (expertiseData && expertiseData.length > 0) {
                    const data = expertiseData[0];
                    const pdfGenerator = new RadiologyExpertisePDF(data, {
                        includeImages,
                        includeMeasurements,
                        includeComparison,
                        language: 'id'
                    });

                    // Add expertise content to the main document
                    const expertiseBuffer = await pdfGenerator.generatePDF();
                    // Note: This would need more complex handling to merge PDFs
                    // For now, we'll generate individual PDFs
                }
            }

            doc.end();

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal membuat PDF multiple", data: error.message });
        }
    }

    // Generate comprehensive radiology examination report
    static async exportComprehensiveReportPDF(req, res) {
        const { rad_regis_id, includeImages = false, includeTechnicalDetails = true, includeComparison = true } = req.body;

        try {
            // Get comprehensive data for complete radiology examination report
            const reportData = await sq.query(`
                SELECT
                    -- Patient Data
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.nik,
                    p.alamat_sekarang,
                    p.no_telepon,

                    -- Registration Data
                    r.id as registrasi_id,
                    r.no_antrian,
                    r.no_sep,
                    r.no_rujukan,
                    r.sebab_sakit,
                    r.tgl_registrasi as tanggal_daftar,

                    -- Radiology Registration
                    rr.diagnosa,
                    rr.tanggal_request,
                    rr.tanggal_ambil_sampel,
                    rr.list_test,
                    rr.klinis,
                    rr.is_cito,
                    rr.is_puasa,
                    rr.proyeksi,
                    rr.kv,
                    rr.mas,
                    rr.ffd,
                    rr.bsf,
                    rr.inak,
                    rr.jumlah_penyinaran,
                    rr.dosis_radiasi,
                    rr.keterangan_rad_regis,
                    rr.status as status_regis,

                    -- Referring Doctor
                    d_pengirim.nama_dokter as nama_dokter_pengirim,
                    d_pengirim.spesialisasi as spesialisasi_pengirim,

                    -- Radiology Test Details
                    rt.nama_rad_test,
                    rt.keterangan_rad_test,

                    -- Radiology Results
                    rh.id as rad_hasil_id,
                    rh.tanggal_pemeriksaan,
                    rh.hasil,
                    rh.kesan,
                    rh.saran,
                    rh.file_tambahan,
                    rh.queue as queue_hasil,
                    rh.keterangan_rad_hasil,

                    -- Expertise Data
                    re.id as expertise_id,
                    re.temuan,
                    re.kesimpulan,
                    re.saran as saran_expertise,
                    re.additional_findings,
                    re.measurements,
                    re.comparison_notes,
                    re.technique,
                    re.clinical_correlation,
                    re.limitations,
                    re.urgency_level,
                    re.report_type,
                    re.critical_findings,
                    re.status_expertise,
                    re.version,
                    re.report_completion_time,
                    re."createdAt" as expertise_created_at,

                    -- Radiologist
                    d_rad.nama_dokter as nama_radiolog,
                    d_rad.tanda_tangan as tanda_tangan_radiolog,

                    -- Peer Reviewer (if exists)
                    d_peer.nama_dokter as nama_peer_reviewer,
                    d_peer.spesialisasi as spesialisasi_peer_reviewer,
                    re.peer_review_status,
                    re.peer_review_notes,

                    -- Support Unit
                    pp.nama_penunjang,
                    pp.keterangan_penunjang as deskripsi_penunjang,
                    pp.parameter_normal,
                    pp.satuan

                FROM rad_regis rr
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d_pengirim ON d_pengirim.id = rr.ms_dokter_id
                LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id
                LEFT JOIN ms_dokter d_rad ON d_rad.id = re.radiolog_id
                LEFT JOIN ms_dokter d_peer ON d_peer.id = re.peer_reviewer_id
                WHERE rr.id = $1 AND rr."deletedAt" IS NULL
                ORDER BY rh.tanggal_pemeriksaan DESC, re."createdAt" DESC
                LIMIT 1
            `, { ...s, bind: [rad_regis_id] });

            if (!reportData || reportData.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "Data pemeriksaan radiologi tidak ditemukan"
                });
            }

            const data = reportData[0];

            // Calculate patient age
            const calculateAge = (birthDate) => {
                const birth = moment(birthDate);
                const now = moment();
                const years = now.diff(birth, 'years');
                const months = now.diff(birth, 'months') % 12;
                const days = now.diff(birth.add(years, 'years').add(months, 'months'), 'days');

                if (years > 0) {
                    return `${years} tahun ${months > 0 ? months + ' bulan' : ''}`;
                } else if (months > 0) {
                    return `${months} bulan ${days > 0 ? days + ' hari' : ''}`;
                } else {
                    return `${days} hari`;
                }
            };

            data.umur = calculateAge(data.tgl_lahir);
            data.umur_tahun = moment().diff(moment(data.tgl_lahir), 'years');

            // Parse JSON fields if they exist
            try {
                if (data.diagnosa) data.diagnosa = JSON.parse(data.diagnosa);
                if (data.list_test) data.list_test = JSON.parse(data.list_test);
                if (data.additional_findings) data.additional_findings = JSON.parse(data.additional_findings);
                if (data.measurements) data.measurements = JSON.parse(data.measurements);
            } catch (e) {
                console.warn('Error parsing JSON fields:', e);
            }

            // Generate comprehensive PDF
            const ComprehensivePDF = require('./comprehensivePdfGenerator');
            const pdfGenerator = new ComprehensivePDF(data, {
                includeImages,
                includeTechnicalDetails,
                includeComparison,
                language: 'id'
            });

            const pdfBuffer = await pdfGenerator.generatePDF();

            // Set response headers
            const filename = `Laporan_Radiologi_Lengkap_${data.nama_pasien}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Cache-Control', 'no-cache');

            return res.send(pdfBuffer);

        } catch (error) {
            console.error('Error generating comprehensive report:', error);
            res.status(500).json({
                status: 500,
                message: "gagal membuat laporan lengkap",
                data: error.message
            });
        }
    }

    // Get comprehensive report data (without PDF generation)
    static async getComprehensiveReportData(req, res) {
        const { rad_regis_id } = req.body;

        try {
            // Get all related data for comprehensive report
            const reportData = await sq.query(`
                SELECT
                    -- Patient Data
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.nik,
                    p.alamat_sekarang,
                    p.no_telepon,

                    -- Registration Data
                    r.id as registrasi_id,
                    r.no_antrian,
                    r.no_sep,
                    r.no_rujukan,
                    r.sebab_sakit,
                    r.tgl_registrasi as tanggal_daftar,

                    -- Radiology Registration
                    rr.diagnosa,
                    rr.tanggal_request,
                    rr.tanggal_ambil_sampel,
                    rr.list_test,
                    rr.klinis,
                    rr.is_cito,
                    rr.is_puasa,
                    rr.proyeksi,
                    rr.kv,
                    rr.mas,
                    rr.ffd,
                    rr.bsf,
                    rr.inak,
                    rr.jumlah_penyinaran,
                    rr.dosis_radiasi,
                    rr.keterangan_rad_regis,
                    rr.status as status_regis,

                    -- Referring Doctor
                    d_pengirim.nama_dokter as nama_dokter_pengirim,
                    d_pengirim.spesialisasi as spesialisasi_pengirim,

                    -- Multiple Test Results (if any)
                    json_agg(
                        json_build_object(
                            'rad_hasil_id', rh.id,
                            'nama_rad_test', rt.nama_rad_test,
                            'keterangan_rad_test', rt.keterangan_rad_test,
                            'tanggal_pemeriksaan', rh.tanggal_pemeriksaan,
                            'hasil', rh.hasil,
                            'kesan', rh.kesan,
                            'saran', rh.saran,
                            'file_tambahan', rh.file_tambahan,
                            'queue', rh.queue,
                            'keterangan_rad_hasil', rh.keterangan_rad_hasil,
                            'expertise_data', (
                                SELECT json_agg(
                                    json_build_object(
                                        'expertise_id', re_exp.id,
                                        'temuan', re_exp.temuan,
                                        'kesimpulan', re_exp.kesimpulan,
                                        'saran', re_exp.saran,
                                        'additional_findings', re_exp.additional_findings,
                                        'measurements', re_exp.measurements,
                                        'comparison_notes', re_exp.comparison_notes,
                                        'technique', re_exp.technique,
                                        'clinical_correlation', re_exp.clinical_correlation,
                                        'limitations', re_exp.limitations,
                                        'urgency_level', re_exp.urgency_level,
                                        'report_type', re_exp.report_type,
                                        'critical_findings', re_exp.critical_findings,
                                        'status_expertise', re_exp.status_expertise,
                                        'version', re_exp.version,
                                        'report_completion_time', re_exp.report_completion_time,
                                        'radiolog', (
                                            SELECT json_build_object(
                                                'nama_dokter', d_rad_exp.nama_dokter,
                                                'spesialisasi', d_rad_exp.spesialisasi
                                            )
                                            FROM ms_dokter d_rad_exp
                                            WHERE d_rad_exp.id = re_exp.radiolog_id
                                        ),
                                        'peer_reviewer', (
                                            SELECT json_build_object(
                                                'nama_dokter', d_peer_exp.nama_dokter,
                                                'spesialisasi', d_peer_exp.spesialisasi
                                            )
                                            FROM ms_dokter d_peer_exp
                                            WHERE d_peer_exp.id = re_exp.peer_reviewer_id
                                        )
                                    )
                                )
                                FROM rad_expertise re_exp
                                WHERE re_exp.rad_hasil_id = rh.id AND re_exp."deletedAt" IS NULL
                            )
                        )
                    ) FILTER (WHERE rh.id IS NOT NULL) as all_test_results

                FROM rad_regis rr
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d_pengirim ON d_pengirim.id = rr.ms_dokter_id
                LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                WHERE rr.id = $1 AND rr."deletedAt" IS NULL
                GROUP BY
                    p.no_rm, p.nama_lengkap, p.jenis_kelamin, p.tgl_lahir, p.nik, p.alamat_sekarang, p.no_rm,
                    r.id, r.no_antrian, r.no_sep, r.no_rujukan, r.sebab_sakit, r.tgl_registrasi as tanggal_daftar,
                    rr.id, rr.diagnosa, rr.tanggal_request, rr.tanggal_ambil_sampel, rr.list_test, rr.klinis, rr.is_cito, rr.is_puasa,
                    rr.proyeksi, rr.kv, rr.mas, rr.ffd, rr.bsf, rr.inak, rr.jumlah_penyinaran, rr.dosis_radiasi, rr.keterangan_rad_regis, rr.status,
                    d_pengirim.nama_dokter, d_pengirim.spesialisasi
            `, { ...s, bind: [rad_regis_id] });

            if (!reportData || reportData.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "Data pemeriksaan radiologi tidak ditemukan"
                });
            }

            const data = reportData[0];

            // Calculate patient age
            const calculateAge = (birthDate) => {
                const birth = moment(birthDate);
                const now = moment();
                const years = now.diff(birth, 'years');
                const months = now.diff(birth, 'months') % 12;
                const days = now.diff(birth.add(years, 'years').add(months, 'months'), 'days');

                if (years > 0) {
                    return `${years} tahun ${months > 0 ? months + ' bulan' : ''}`;
                } else if (months > 0) {
                    return `${months} bulan ${days > 0 ? days + ' hari' : ''}`;
                } else {
                    return `${days} hari`;
                }
            };

            data.umur = calculateAge(data.tgl_lahir);
            data.umur_tahun = moment().diff(moment(data.tgl_lahir), 'years');

            // Parse JSON fields if they exist
            try {
                if (data.diagnosa) data.diagnosa = JSON.parse(data.diagnosa);
                if (data.list_test) data.list_test = JSON.parse(data.list_test);
            } catch (e) {
                console.warn('Error parsing JSON fields:', e);
            }

            res.status(200).json({
                status: 200,
                message: "Data laporan lengkap berhasil diambil",
                data: data
            });

        } catch (error) {
            console.error('Error getting comprehensive report data:', error);
            res.status(500).json({
                status: 500,
                message: "gagal mengambil data laporan lengkap",
                data: error.message
            });
        }
    }

    // Generate PDF for rad_hasil with expertise
    static async exportRadHasilWithExpertisePDF(req, res) {
        const { rad_hasil_id } = req.body;

        try {
            // Get expertise data for this rad_hasil
            const expertiseData = await sq.query(`
                SELECT
                    re.*,
                    rh.tanggal_pemeriksaan,
                    rh.hasil as hasil_rad,
                    rh.kesan as kesan_rad,
                    rh.saran as saran_rad,
                    rr.registrasi_id,
                    rr.diagnosa,
                    rr.tanggal_request,
                    rr.tanggal_ambil_sampel,
                    rr.list_test,
                    rr.klinis,
                    rr.is_cito,
                    rr.proyeksi,
                    rr.kv,
                    rr.mas,
                    rr.ffd,
                    rr.bsf,
                    rr.inak,
                    rr.jumlah_penyinaran,
                    rr.dosis_radiasi,
                    rr.keterangan_rad_regis,
                    rr.status as status_regis,
                    rt.nama_rad_test,
                    pp.nama_penunjang,
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.alamat_sekarang,
                    d.nama_dokter as nama_dokter_pengirim,
                    rad.nama_dokter as nama_radiolog,
                    rad.ms_specialist_id
                FROM rad_expertise re
                LEFT JOIN rad_hasil rh ON rh.id = re.rad_hasil_id
                LEFT JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                WHERE re.rad_hasil_id = $1
                    AND re."deletedAt" IS NULL
                    AND re.status_expertise = 'final'
                LIMIT 1
            `, { ...s, bind: [rad_hasil_id] });

            if (!expertiseData || expertiseData.length === 0) {
                return res.status(404).json({ status: 404, message: "Data expertise tidak ditemukan atau belum final" });
            }

            const data = expertiseData[0];

            // Generate PDF
            const pdfGenerator = new RadiologyExpertisePDF(data, {
                includeImages: false,
                includeMeasurements: true,
                includeComparison: true,
                language: 'id'
            });

            const pdfBuffer = await pdfGenerator.generatePDF();

            // Set response headers
            const filename = `Expertise_Radiologi_${data.nama_pasien}_${moment().format('YYYY-MM-DD')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal membuat PDF", data: error.message });
        }
    }

    // Get radiology patient recap data
    static async getPatientRecap(req, res) {
        const {
            page = 1,
            perPage = 10,
            startDate,
            endDate,
            search,
            status_regis,
            jenis_kelamin,
            umur_min,
            umur_max,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            radiolog_id,
            is_cito,
            sortBy = 'tanggal_request',
            sortOrder = 'DESC'
        } = req.body;

        let param = '';
        let paramCount = '';
        let offset = (page - 1) * perPage;

        // Filter berdasarkan rentang tanggal
        if (startDate && endDate) {
            param += ` AND DATE(rr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
            paramCount += ` AND DATE(rr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
        }

        // Filter berdasarkan status registrasi
        if (status_regis !== undefined) {
            param += ` AND rr.status = ${status_regis}`;
            paramCount += ` AND rr.status = ${status_regis}`;
        }

        // Filter berdasarkan jenis kelamin
        if (jenis_kelamin) {
            param += ` AND p.jenis_kelamin = '${jenis_kelamin}'`;
            paramCount += ` AND p.jenis_kelamin = '${jenis_kelamin}'`;
        }

        // Filter berdasarkan umur
        if (umur_min !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) >= ${umur_min}`;
            paramCount += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) >= ${umur_min}`;
        }
        if (umur_max !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) <= ${umur_max}`;
            paramCount += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) <= ${umur_max}`;
        }

        // Filter berdasarkan tipe pemeriksaan (rad_test)
        if (tipe_pemeriksaan) {
            param += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
            paramCount += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
        }

        // Filter berdasarkan dokter pengirim
        if (dokter_pengirim_id) {
            param += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
            paramCount += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
        }

        // Filter berdasarkan radiolog
        if (radiolog_id) {
            param += ` AND re.radiolog_id = '${radiolog_id}'`;
            paramCount += ` AND re.radiolog_id = '${radiolog_id}'`;
        }

        // Filter CITO
        if (is_cito !== undefined) {
            param += ` AND rr.is_cito = ${is_cito}`;
            paramCount += ` AND rr.is_cito = ${is_cito}`;
        }

        // Search berdasarkan nama pasien, no_rm, atau dokter
        if (search) {
            param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%' OR d.nama_dokter ILIKE '%${search}%')`;
            paramCount += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%' OR d.nama_dokter ILIKE '%${search}%')`;
        }

        // Validasi kolom sorting
        const validSortColumns = ['tanggal_request', 'tanggal_pemeriksaan', 'nama_pasien', 'no_rm', 'nama_rad_test', 'status_regis'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'tanggal_request';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        try {
            // Query utama untuk rekap data pasien radiologi
            let data = await sq.query(`
                SELECT DISTINCT
                    -- Patient Information
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.alamat_sekarang,
                    p.no_telepon,
                    EXTRACT(YEAR FROM AGE(p.tgl_lahir)) as umur_tahun,
                    EXTRACT(MONTH FROM AGE(p.tgl_lahir)) as umur_bulan,
                    EXTRACT(DAY FROM AGE(p.tgl_lahir)) as umur_hari,

                    -- Registration Information
                    r.id as registrasi_id,
                    r.no_antrian,
                    r.no_sep,
                    r.no_rujukan,
                    r.tgl_registrasi as tanggal_daftar,

                    -- Radiology Registration
                    rr.id as rad_regis_id,
                    rr.tanggal_request,
                    rr.tanggal_ambil_sampel,
                    rr.diagnosa,
                    rr.klinis,
                    rr.is_cito,
                    rr.is_puasa,
                    rr.proyeksi,
                    rr.kv,
                    rr.mas,
                    rr.ffd,
                    rr.bsf,
                    rr.inak,
                    rr.jumlah_penyinaran,
                    rr.dosis_radiasi,
                    rr.keterangan_rad_regis,
                    rr.status as status_regis,
                    rr."createdAt" as reg_created_at,

                    -- Referring Doctor
                    d.id as dokter_pengirim_id,
                    d.nama_dokter as nama_dokter_pengirim,

                    -- Test Information
                    rt.id as rad_test_id,
                    rt.nama_rad_test,
                    rt.keterangan_rad_test,

                    -- Results Information
                    rh.id as rad_hasil_id,
                    rh.tanggal_pemeriksaan,
                    rh.hasil,
                    rh.kesan,
                    rh.saran,
                    rh.file_tambahan,
                    rh.queue as queue_hasil,
                    rh.keterangan_rad_hasil,
                    rh."createdAt" as hasil_created_at,

                    -- Expertise Information
                    re.id as expertise_id,
                    re.temuan,
                    re.kesimpulan,
                    re.saran as saran_expertise,
                    re.status_expertise,
                    re.urgency_level,
                    re.critical_findings,
                    re.report_completion_time,
                    rad.nama_dokter as nama_radiolog,
                    re."createdAt" as expertise_created_at,

                    -- Support Unit
                    pp.nama_penunjang,
                    pp.keterangan_penunjang as deskripsi_penunjang,

                    -- Status Summary
                    CASE
                        WHEN rr.status = 0 THEN 'Baru'
                        WHEN rr.status = 1 THEN 'Proses'
                        WHEN rr.status = 2 THEN 'Sampel Diambil'
                        WHEN rr.status = 3 THEN 'Hasil Siap'
                        ELSE rr.status::text
                    END as status_regis_desc,

                    CASE
                        WHEN re.status_expertise = 'draft' THEN 'Draft'
                        WHEN re.status_expertise = 'final' THEN 'Final'
                        WHEN re.status_expertise = 'second_opinion' THEN 'Second Opinion'
                        WHEN re.status_expertise = 'revised' THEN 'Revised'
                        ELSE 'Belum Ada'
                    END as status_expertise_desc,

                    -- Age calculation
                    CASE
                        WHEN EXTRACT(YEAR FROM AGE(p.tgl_lahir)) > 0 THEN
                            EXTRACT(YEAR FROM AGE(p.tgl_lahir))::text || ' tahun'
                        WHEN EXTRACT(MONTH FROM AGE(p.tgl_lahir)) > 0 THEN
                            EXTRACT(MONTH FROM AGE(p.tgl_lahir))::text || ' bulan'
                        ELSE
                            EXTRACT(DAY FROM AGE(p.tgl_lahir))::text || ' hari'
                    END as umur_desc

                FROM rad_regis rr
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                WHERE rr."deletedAt" IS NULL
                    AND p."deletedAt" IS NULL
                    ${param}
                ORDER BY ${sortColumn} ${sortDirection}
                LIMIT ${perPage} OFFSET ${offset}
            `, s);

            // Query untuk total count
            let countData = await sq.query(`
                SELECT COUNT(DISTINCT rr.id) as total
                FROM rad_regis rr
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                WHERE rr."deletedAt" IS NULL
                    AND p."deletedAt" IS NULL
                    ${paramCount}
            `, s);

            // Query untuk statistik tambahan
            let statsData = await sq.query(`
                SELECT
                    COUNT(DISTINCT rr.id) as total_pasien,
                    COUNT(DISTINCT CASE WHEN rr.is_cito = true THEN rr.id END) as total_cito,
                    COUNT(DISTINCT CASE WHEN rh.id IS NOT NULL THEN rr.id END) as total_sudah_periksa,
                    COUNT(DISTINCT CASE WHEN re.id IS NOT NULL THEN rr.id END) as total_sudah_expertise,
                    COUNT(DISTINCT CASE WHEN re.status_expertise = 'final' THEN rr.id END) as total_expertise_final,
                    COUNT(DISTINCT CASE WHEN rr.status = 3 THEN rr.id END) as total_hasil_siap,
                    AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/3600) as avg_waiting_time_hours,
                    COUNT(DISTINCT CASE WHEN re.critical_findings = true THEN rr.id END) as total_critical_findings
                FROM rad_regis rr
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                WHERE rr."deletedAt" IS NULL
                    AND p."deletedAt" IS NULL
                    ${paramCount}
            `, s);

            const total = countData[0]?.total || 0;
            const stats = statsData[0] || {};

            // Process data untuk JSON fields dan formatting
            const processedData = data.map(item => {
                // Parse JSON fields jika ada
                try {
                    if (item.diagnosa) item.diagnosa = JSON.parse(item.diagnosa);
                    if (item.hasil) item.hasil = JSON.parse(item.hasil);
                    if (item.kesan) item.kesan = JSON.parse(item.kesan);
                    if (item.saran) item.saran = JSON.parse(item.saran);
                } catch (e) {
                    console.warn('Error parsing JSON fields:', e);
                }

                // Format tanggal
                if (item.tanggal_request) {
                    item.tanggal_request = moment(item.tanggal_request).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tanggal_pemeriksaan) {
                    item.tanggal_pemeriksaan = moment(item.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tgl_lahir) {
                    item.tgl_lahir = moment(item.tgl_lahir).format('YYYY-MM-DD');
                }

                return item;
            });

            res.status(200).json({
                status: 200,
                message: "sukses",
                data: processedData,
                pagination: {
                    page: parseInt(page),
                    perPage: parseInt(perPage),
                    total,
                    totalPages: Math.ceil(total / perPage)
                },
                statistics: {
                    total_pasien: parseInt(stats.total_pasien) || 0,
                    total_cito: parseInt(stats.total_cito) || 0,
                    total_sudah_periksa: parseInt(stats.total_sudah_periksa) || 0,
                    total_sudah_expertise: parseInt(stats.total_sudah_expertise) || 0,
                    total_expertise_final: parseInt(stats.total_expertise_final) || 0,
                    total_hasil_siap: parseInt(stats.total_hasil_siap) || 0,
                    avg_waiting_time_hours: parseFloat(stats.avg_waiting_time_hours) || 0,
                    total_critical_findings: parseInt(stats.total_critical_findings) || 0
                }
            });

        } catch (error) {
            console.error('Error in getPatientRecap:', error);
            res.status(500).json({
                status: 500,
                message: "gagal mengambil data rekap pasien radiologi",
                data: error.message
            });
        }
    }

    // Export patient recap to Excel
    static async exportPatientRecapExcel(req, res) {
        const {
            startDate,
            endDate,
            search,
            status_regis,
            jenis_kelamin,
            umur_min,
            umur_max,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            radiolog_id,
            is_cito,
            sortBy = 'tanggal_request',
            sortOrder = 'DESC'
        } = req.body;

        try {
            // Ambil data tanpa pagination untuk export
            const recapData = await Controller.getPatientRecapData({
                startDate,
                endDate,
                search,
                status_regis,
                jenis_kelamin,
                umur_min,
                umur_max,
                tipe_pemeriksaan,
                dokter_pengirim_id,
                radiolog_id,
                is_cito,
                sortBy,
                sortOrder,
                page: 1,
                perPage: 10000 // Large number for export
            });

            console.log('===> controller.js:1582 ~ recapData', recapData);
            if (!recapData || recapData.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "Data tidak ditemukan untuk periode yang dipilih"
                });
            }

            // Generate Excel
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Rekap Pasien Radiologi');

            // Define columns
            worksheet.columns = [
                { header: 'No. RM', key: 'no_rm', width: 15 },
                { header: 'Nama Pasien', key: 'nama_lengkap', width: 30 },
                { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
                { header: 'Umur', key: 'umur_desc', width: 15 },
                { header: 'Alamat', key: 'alamat_sekarang', width: 40 },
                { header: 'No. HP', key: 'no_hp', width: 15 },
                { header: 'Tanggal Request', key: 'tanggal_request', width: 20 },
                { header: 'Tanggal Pemeriksaan', key: 'tanggal_pemeriksaan', width: 20 },
                { header: 'Jenis Pemeriksaan', key: 'nama_rad_test', width: 25 },
                { header: 'Dokter Pengirim', key: 'nama_dokter_pengirim', width: 25 },
                { header: 'Radiolog', key: 'nama_radiolog', width: 25 },
                { header: 'Status Registrasi', key: 'status_regis_desc', width: 20 },
                { header: 'Status Expertise', key: 'status_expertise_desc', width: 20 },
                { header: 'CITO', key: 'is_cito', width: 10 },
                { header: 'Critical Findings', key: 'critical_findings', width: 20 }
            ];

            // Style header
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '366092' }
            };
            worksheet.getRow(1).alignment = { horizontal: 'center' };
            worksheet.getRow(1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Add data
            recapData.forEach((item, index) => {
                const row = worksheet.addRow({
                    no_rm: item.no_rm || '',
                    nama_lengkap: item.nama_lengkap || '',
                    jenis_kelamin: item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    umur_desc: item.umur_desc || '',
                    alamat_sekarang: item.alamat_sekarang || '',
                    no_hp: item.no_telepon || '',
                    tanggal_request: item.tanggal_request || '',
                    tanggal_pemeriksaan: item.tanggal_pemeriksaan || '',
                    nama_rad_test: item.nama_rad_test || '',
                    nama_dokter_pengirim: item.nama_dokter_pengirim || '',
                    nama_radiolog: item.nama_radiolog || 'Belum ada',
                    status_regis_desc: item.status_regis_desc || '',
                    status_expertise_desc: item.status_expertise_desc || 'Belum ada',
                    is_cito: item.is_cito ? 'Ya' : 'Tidak',
                    critical_findings: item.critical_findings ? 'Ya' : 'Tidak'
                });

                // Style data rows
                row.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Alternating row colors
                if (index % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'F2F2F2' }
                    };
                }
            });

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                column.width = Math.max(column.width, column.header.length + 5);
            });

            // Generate filename
            const filename = `Rekap_Pasien_Radiologi_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Cache-Control', 'no-cache');

            // Send file
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Error exporting patient recap to Excel:', error);
            res.status(500).json({
                status: 500,
                message: "gagal export Excel",
                data: error.message
            });
        }
    }

    // Helper method untuk get patient recap data (tanpa pagination)
    static async getPatientRecapData(params) {
        const {
            startDate,
            endDate,
            search,
            status_regis,
            jenis_kelamin,
            umur_min,
            umur_max,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            radiolog_id,
            is_cito,
            sortBy = 'tanggal_request',
            sortOrder = 'DESC',
            page = 1,
            perPage = 10
        } = params;

        let param = '';
        let offset = (page - 1) * perPage;

        // Apply same filters as getPatientRecap
        if (startDate && endDate) {
            param += ` AND DATE(rr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
        }
        if (status_regis !== undefined) {
            param += ` AND rr.status = ${status_regis}`;
        }
        if (jenis_kelamin) {
            param += ` AND p.jenis_kelamin = '${jenis_kelamin}'`;
        }
        if (umur_min !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) >= ${umur_min}`;
        }
        if (umur_max !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) <= ${umur_max}`;
        }
        if (tipe_pemeriksaan) {
            param += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
        }
        if (dokter_pengirim_id) {
            param += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
        }
        if (radiolog_id) {
            param += ` AND re.radiolog_id = '${radiolog_id}'`;
        }
        if (is_cito !== undefined) {
            param += ` AND rr.is_cito = ${is_cito}`;
        }
        if (search) {
            param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%' OR d.nama_dokter ILIKE '%${search}%')`;
        }

        const validSortColumns = ['tanggal_request', 'tanggal_pemeriksaan', 'nama_pasien', 'no_rm', 'nama_rad_test', 'status_regis'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'tanggal_request';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        try {
            const data = await sq.query(`
                SELECT DISTINCT
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.alamat_sekarang,
                    p.no_telepon,
                    EXTRACT(YEAR FROM AGE(p.tgl_lahir)) as umur_tahun,
                    EXTRACT(MONTH FROM AGE(p.tgl_lahir)) as umur_bulan,
                    EXTRACT(DAY FROM AGE(p.tgl_lahir)) as umur_hari,
                    r.id as registrasi_id,
                    r.no_antrian,
                    r.no_sep,
                    r.no_rujukan,
                    r.tgl_registrasi as tanggal_daftar,
                    rr.id as rad_regis_id,
                    rr.tanggal_request,
                    rr.tanggal_ambil_sampel,
                    rr.klinis,
                    rr.is_cito,
                    rr.is_puasa,
                    rr.proyeksi,
                    rr.kv,
                    rr.mas,
                    rr.ffd,
                    rr.bsf,
                    rr.inak,
                    rr.jumlah_penyinaran,
                    rr.dosis_radiasi,
                    rr.keterangan_rad_regis,
                    rr.status as status_regis,
                    rr."createdAt" as reg_created_at,
                    d.id as dokter_pengirim_id,
                    d.nama_dokter as nama_dokter_pengirim,
                    rt.id as rad_test_id,
                    rt.nama_rad_test,
                    rt.keterangan_rad_test,
                    rh.id as rad_hasil_id,
                    rh.tanggal_pemeriksaan,
                    rh.hasil,
                    rh.kesan,
                    rh.saran,
                    rh.file_tambahan,
                    rh.queue as queue_hasil,
                    rh.keterangan_rad_hasil,
                    rh."createdAt" as hasil_created_at,
                    re.id as expertise_id,
                    re.temuan,
                    re.kesimpulan,
                    re.saran as saran_expertise,
                    re.status_expertise,
                    re.urgency_level,
                    re.critical_findings,
                    re.report_completion_time,
                    rad.nama_dokter as nama_radiolog,
                    re."createdAt" as expertise_created_at,
                    pp.nama_penunjang,
                    pp.keterangan_penunjang as deskripsi_penunjang,
                    CASE
                        WHEN rr.status = 0 THEN 'Baru'
                        WHEN rr.status = 1 THEN 'Proses'
                        WHEN rr.status = 2 THEN 'Sampel Diambil'
                        WHEN rr.status = 3 THEN 'Hasil Siap'
                        ELSE rr.status::text
                    END as status_regis_desc,
                    CASE
                        WHEN re.status_expertise = 'draft' THEN 'Draft'
                        WHEN re.status_expertise = 'final' THEN 'Final'
                        WHEN re.status_expertise = 'second_opinion' THEN 'Second Opinion'
                        WHEN re.status_expertise = 'revised' THEN 'Revised'
                        ELSE 'Belum Ada'
                    END as status_expertise_desc,
                    CASE
                        WHEN EXTRACT(YEAR FROM AGE(p.tgl_lahir)) > 0 THEN
                            EXTRACT(YEAR FROM AGE(p.tgl_lahir))::text || ' tahun'
                        WHEN EXTRACT(MONTH FROM AGE(p.tgl_lahir)) > 0 THEN
                            EXTRACT(MONTH FROM AGE(p.tgl_lahir))::text || ' bulan'
                        ELSE
                            EXTRACT(DAY FROM AGE(p.tgl_lahir))::text || ' hari'
                    END as umur_desc
                FROM rad_regis rr
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                LEFT JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                WHERE rr."deletedAt" IS NULL
                    AND p."deletedAt" IS NULL
                    ${param}
                ORDER BY ${sortColumn} ${sortDirection}
                LIMIT ${perPage} OFFSET ${offset}
            `, s);

            // Process data
            return data.map(item => {
                try {
                    if (item.diagnosa) item.diagnosa = JSON.parse(item.diagnosa);
                    if (item.hasil) item.hasil = JSON.parse(item.hasil);
                    if (item.kesan) item.kesan = JSON.parse(item.kesan);
                    if (item.saran) item.saran = JSON.parse(item.saran);
                } catch (e) {
                    console.warn('Error parsing JSON fields:', e);
                }

                if (item.tanggal_request) {
                    item.tanggal_request = moment(item.tanggal_request).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tanggal_pemeriksaan) {
                    item.tanggal_pemeriksaan = moment(item.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tgl_lahir) {
                    item.tgl_lahir = moment(item.tgl_lahir).format('YYYY-MM-DD');
                }

                return item;
            });

        } catch (error) {
            console.error('Error in getPatientRecapData:', error);
            return [];
        }
    }

    // Get radiology waiting time analysis
    static async getWaitingTimeAnalysis(req, res) {
        const {
            startDate,
            endDate,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            radiolog_id,
            is_cito,
            analysis_type = 'summary', // summary, detailed, trend
            group_by = 'day' // day, week, month
        } = req.body;

        let param = '';
        let groupByClause = '';

        // Filter berdasarkan rentang tanggal
        if (startDate && endDate) {
            param += ` AND DATE(rr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
        }

        // Filter berdasarkan tipe pemeriksaan
        if (tipe_pemeriksaan) {
            param += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
        }

        // Filter berdasarkan dokter pengirim
        if (dokter_pengirim_id) {
            param += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
        }

        // Filter berdasarkan radiolog
        if (radiolog_id) {
            param += ` AND re.radiolog_id = '${radiolog_id}'`;
        }

        // Filter CITO
        if (is_cito !== undefined) {
            param += ` AND rr.is_cito = ${is_cito}`;
        }

        // Set grouping clause
        switch (group_by) {
            case 'week':
                groupByClause = "DATE_TRUNC('week', rr.tanggal_request)";
                break;
            case 'month':
                groupByClause = "DATE_TRUNC('month', rr.tanggal_request)";
                break;
            default:
                groupByClause = "DATE(rr.tanggal_request)";
        }

        try {
            let data, statistics;

            if (analysis_type === 'summary') {
                // Summary statistics
                [data, statistics] = await Promise.all([
                    sq.query(`
                        SELECT
                            COUNT(*) as total_cases,
                            COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cases,
                            COUNT(CASE WHEN rh.id IS NOT NULL THEN 1 END) as completed_cases,
                            COUNT(CASE WHEN re.id IS NOT NULL THEN 1 END) as expertise_completed,
                            COUNT(CASE WHEN re.status_expertise = 'final' THEN 1 END) as final_expertise,

                            -- Average waiting times in minutes
                            AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as avg_request_to_examination,
                            AVG(EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as avg_examination_to_expertise,
                            AVG(EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as avg_total_waiting_time,

                            -- Minimum waiting times
                            MIN(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as min_request_to_examination,
                            MIN(EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as min_examination_to_expertise,
                            MIN(EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as min_total_waiting_time,

                            -- Maximum waiting times
                            MAX(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as max_request_to_examination,
                            MAX(EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as max_examination_to_expertise,
                            MAX(EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as max_total_waiting_time,

                            -- Percentiles
                            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as median_request_to_examination,
                            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as median_examination_to_expertise,
                            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as median_total_waiting_time,

                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as p95_request_to_examination,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_pemeriksaan))/60) as p95_examination_to_expertise,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as p95_total_waiting_time

                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                        WHERE rr."deletedAt" IS NULL
                            AND p."deletedAt" IS NULL
                            AND rh.tanggal_pemeriksaan IS NOT NULL
                            ${param}
                    `, s),

                    // Additional breakdown statistics
                    sq.query(`
                        SELECT
                            'By Test Type' as category,
                            rt.nama_rad_test as group_name,
                            COUNT(*) as total_cases,
                            COUNT(CASE WHEN rh.id IS NOT NULL THEN 1 END) as completed_cases,
                            AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as avg_wait_time,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as p95_wait_time
                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        WHERE rr."deletedAt" IS NULL
                            AND p."deletedAt" IS NULL
                            AND rh.tanggal_pemeriksaan IS NOT NULL
                            ${param}
                        GROUP BY rt.nama_rad_test
                        ORDER BY avg_wait_time DESC
                        LIMIT 10
                    `, s)
                ]);

            } else if (analysis_type === 'detailed') {
                // Detailed case-by-case analysis
                data = await sq.query(`
                    SELECT
                        -- Patient Info
                        p.no_rm,
                        p.nama_lengkap,
                        p.jenis_kelamin,
                        EXTRACT(YEAR FROM AGE(p.tgl_lahir)) as umur_tahun,

                        -- Request Info
                        rr.tanggal_request,
                        rr.is_cito,
                        rr.status as status_regis,

                        -- Test Info
                        rt.nama_rad_test,
                        d.nama_dokter as nama_dokter_pengirim,
                        rad.nama_dokter as nama_radiolog,

                        -- Timestamps
                        rh.tanggal_pemeriksaan,
                        re."createdAt" as expertise_created_at,

                        -- Waiting Times in Minutes
                        EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 as request_to_examination_minutes,
                        EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60 as examination_to_expertise_minutes,
                        EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60 as total_waiting_time_minutes,

                        -- Performance Classification
                        CASE
                            WHEN EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 30 THEN 'Fast'
                            WHEN EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 60 THEN 'Normal'
                            WHEN EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 120 THEN 'Slow'
                            ELSE 'Very Slow'
                        END as performance_category,

                        -- SLA Status
                        CASE
                            WHEN rr.is_cito = true AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 15 THEN 'SLA Met'
                            WHEN rr.is_cito = false AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 60 THEN 'SLA Met'
                            ELSE 'SLA Breached'
                        END as sla_status

                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                    WHERE rr."deletedAt" IS NULL
                        AND p."deletedAt" IS NULL
                        AND rh.tanggal_pemeriksaan IS NOT NULL
                        ${param}
                    ORDER BY rr.tanggal_request DESC
                `, s);

                statistics = null;

            } else if (analysis_type === 'trend') {
                // Trend analysis over time
                data = await sq.query(`
                    SELECT
                        ${groupByClause} as period,
                        DATE(${groupByClause}) as period_date,

                        COUNT(*) as total_cases,
                        COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cases,
                        COUNT(CASE WHEN rh.id IS NOT NULL THEN 1 END) as completed_cases,

                        -- Average waiting times
                        AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as avg_wait_time,
                        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as median_wait_time,
                        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as p95_wait_time,

                        -- SLA Performance
                        COUNT(CASE WHEN
                            (rr.is_cito = true AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 15)
                            OR (rr.is_cito = false AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 60)
                        THEN 1 END) as sla_met_count,

                        COUNT(CASE WHEN
                            (rr.is_cito = true AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 > 15)
                            OR (rr.is_cito = false AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 > 60)
                        THEN 1 END) as sla_breached_count

                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    WHERE rr."deletedAt" IS NULL
                        AND p."deletedAt" IS NULL
                        AND rh.tanggal_pemeriksaan IS NOT NULL
                        ${param}
                    GROUP BY ${groupByClause}
                    ORDER BY period_date
                `, s);

                statistics = null;
            }

            // Process data
            const processedData = Array.isArray(data) ? data.map(item => {
                // Format dates and numbers
                if (item.tanggal_request) {
                    item.tanggal_request = moment(item.tanggal_request).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tanggal_pemeriksaan) {
                    item.tanggal_pemeriksaan = moment(item.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.expertise_created_at) {
                    item.expertise_created_at = moment(item.expertise_created_at).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.period_date) {
                    item.period_date = moment(item.period_date).format('YYYY-MM-DD');
                }

                // Round numeric values
                if (item.avg_wait_time) item.avg_wait_time = Math.round(item.avg_wait_time * 100) / 100;
                if (item.median_wait_time) item.median_wait_time = Math.round(item.median_wait_time * 100) / 100;
                if (item.p95_wait_time) item.p95_wait_time = Math.round(item.p95_wait_time * 100) / 100;
                if (item.request_to_examination_minutes) item.request_to_examination_minutes = Math.round(item.request_to_examination_minutes * 100) / 100;
                if (item.examination_to_expertise_minutes) item.examination_to_expertise_minutes = Math.round(item.examination_to_expertise_minutes * 100) / 100;
                if (item.total_waiting_time_minutes) item.total_waiting_time_minutes = Math.round(item.total_waiting_time_minutes * 100) / 100;

                return item;
            }) : data;

            // Process statistics
            const processedStatistics = statistics ? statistics.map(item => {
                // Round numeric values
                Object.keys(item).forEach(key => {
                    if (key.includes('avg_') || key.includes('min_') || key.includes('max_') ||
                        key.includes('median_') || key.includes('p95_') || key.includes('wait_time')) {
                        if (item[key] !== null) {
                            item[key] = Math.round(item[key] * 100) / 100;
                        }
                    }
                });
                return item;
            }) : null;

            res.status(200).json({
                status: 200,
                message: "sukses",
                data: processedData,
                statistics: processedStatistics,
                analysis_type,
                filters: {
                    startDate,
                    endDate,
                    tipe_pemeriksaan,
                    dokter_pengirim_id,
                    radiolog_id,
                    is_cito,
                    group_by
                }
            });

        } catch (error) {
            console.error('Error in getWaitingTimeAnalysis:', error);
            res.status(500).json({
                status: 500,
                message: "gagal mengambil data analisis waktu tunggu",
                data: error.message
            });
        }
    }

    // Export waiting time analysis to Excel
    static async exportWaitingTimeAnalysisExcel(req, res) {
        const {
            startDate,
            endDate,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            radiolog_id,
            is_cito,
            analysis_type = 'detailed'
        } = req.body;

        try {
            // Get data without pagination for export
            const analysisData = await Controller.getWaitingTimeAnalysisData({
                startDate,
                endDate,
                tipe_pemeriksaan,
                dokter_pengirim_id,
                radiolog_id,
                is_cito,
                analysis_type
            });

            if (!analysisData || (Array.isArray(analysisData) && analysisData.length === 0)) {
                return res.status(404).json({
                    status: 404,
                    message: "Data tidak ditemukan untuk periode yang dipilih"
                });
            }

            // Generate Excel
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();

            if (analysis_type === 'summary') {
                // Create summary sheet
                const summarySheet = workbook.addWorksheet('Ringkasan Waktu Tunggu');

                // Summary headers
                summarySheet.columns = [
                    { header: 'Metrik', key: 'metric', width: 30 },
                    { header: 'Nilai', key: 'value', width: 20 },
                    { header: 'Satuan', key: 'unit', width: 15 }
                ];

                // Add summary data
                const summaryData = analysisData[0];
                summarySheet.addRows([
                    { metric: 'Total Kasus', value: summaryData.total_cases, unit: 'kasus' },
                    { metric: 'Kasus CITO', value: summaryData.cito_cases, unit: 'kasus' },
                    { metric: 'Kasus Selesai Pemeriksaan', value: summaryData.completed_cases, unit: 'kasus' },
                    { metric: 'Kasus Selesai Expertise', value: summaryData.expertise_completed, unit: 'kasus' },
                    { metric: 'Expertise Final', value: summaryData.final_expertise, unit: 'kasus' },
                    {},
                    { metric: 'Rata-rata Request ke Pemeriksaan', value: summaryData.avg_request_to_examination, unit: 'menit' },
                    { metric: 'Rata-rata Pemeriksaan ke Expertise', value: summaryData.avg_examination_to_expertise, unit: 'menit' },
                    { metric: 'Rata-rata Total Waktu Tunggu', value: summaryData.avg_total_waiting_time, unit: 'menit' },
                    {},
                    { metric: 'Median Request ke Pemeriksaan', value: summaryData.median_request_to_examination, unit: 'menit' },
                    { metric: 'Median Pemeriksaan ke Expertise', value: summaryData.median_examination_to_expertise, unit: 'menit' },
                    { metric: 'Median Total Waktu Tunggu', value: summaryData.median_total_waiting_time, unit: 'menit' },
                    {},
                    { metric: 'P95 Request ke Pemeriksaan', value: summaryData.p95_request_to_examination, unit: 'menit' },
                    { metric: 'P95 Pemeriksaan ke Expertise', value: summaryData.p95_examination_to_expertise, unit: 'menit' },
                    { metric: 'P95 Total Waktu Tunggu', value: summaryData.p95_total_waiting_time, unit: 'menit' }
                ]);

                // Create breakdown sheet
                const breakdownSheet = workbook.addWorksheet('Breakdown per Jenis Pemeriksaan');
                breakdownSheet.columns = [
                    { header: 'Jenis Pemeriksaan', key: 'nama_rad_test', width: 30 },
                    { header: 'Total Kasus', key: 'total_cases', width: 15 },
                    { header: 'Kasus Selesai', key: 'completed_cases', width: 15 },
                    { header: 'Rata-rata Waktu Tunggu (menit)', key: 'avg_wait_time', width: 25 },
                    { header: 'P95 Waktu Tunggu (menit)', key: 'p95_wait_time', width: 25 }
                ];

                breakdownSheet.addRows(analysisData[1]);

            } else if (analysis_type === 'detailed') {
                // Detailed case-by-case sheet
                const detailSheet = workbook.addWorksheet('Detail Waktu Tunggu per Kasus');

                detailSheet.columns = [
                    { header: 'No. RM', key: 'no_rm', width: 15 },
                    { header: 'Nama Pasien', key: 'nama_lengkap', width: 30 },
                    { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
                    { header: 'Umur', key: 'umur_tahun', width: 10 },
                    { header: 'Tanggal Request', key: 'tanggal_request', width: 20 },
                    { header: 'Jenis Pemeriksaan', key: 'nama_rad_test', width: 25 },
                    { header: 'Dokter Pengirim', key: 'nama_dokter_pengirim', width: 25 },
                    { header: 'Radiolog', key: 'nama_radiolog', width: 25 },
                    { header: 'Tanggal Pemeriksaan', key: 'tanggal_pemeriksaan', width: 20 },
                    { header: 'Waktu Request ke Pemeriksaan (menit)', key: 'request_to_examination_minutes', width: 35 },
                    { header: 'Waktu Pemeriksaan ke Expertise (menit)', key: 'examination_to_expertise_minutes', width: 35 },
                    { header: 'Total Waktu Tunggu (menit)', key: 'total_waiting_time_minutes', width: 25 },
                    { header: 'Kategori Performa', key: 'performance_category', width: 20 },
                    { header: 'Status SLA', key: 'sla_status', width: 15 },
                    { header: 'CITO', key: 'is_cito', width: 10 }
                ];

                // Add data
                analysisData.forEach(item => {
                    detailSheet.addRow({
                        no_rm: item.no_rm || '',
                        nama_lengkap: item.nama_lengkap || '',
                        jenis_kelamin: item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                        umur_tahun: item.umur_tahun || 0,
                        tanggal_request: item.tanggal_request || '',
                        nama_rad_test: item.nama_rad_test || '',
                        nama_dokter_pengirim: item.nama_dokter_pengirim || '',
                        nama_radiolog: item.nama_radiolog || 'Belum ada',
                        tanggal_pemeriksaan: item.tanggal_pemeriksaan || '',
                        request_to_examination_minutes: item.request_to_examination_minutes || 0,
                        examination_to_expertise_minutes: item.examination_to_expertise_minutes || 0,
                        total_waiting_time_minutes: item.total_waiting_time_minutes || 0,
                        performance_category: item.performance_category || '',
                        sla_status: item.sla_status || '',
                        is_cito: item.is_cito ? 'Ya' : 'Tidak'
                    });
                });

            } else if (analysis_type === 'trend') {
                // Trend analysis sheet
                const trendSheet = workbook.addWorksheet('Tren Waktu Tunggu');

                trendSheet.columns = [
                    { header: 'Periode', key: 'period_date', width: 15 },
                    { header: 'Total Kasus', key: 'total_cases', width: 15 },
                    { header: 'Kasus CITO', key: 'cito_cases', width: 15 },
                    { header: 'Kasus Selesai', key: 'completed_cases', width: 15 },
                    { header: 'Rata-rata Waktu Tunggu (menit)', key: 'avg_wait_time', width: 25 },
                    { header: 'Median Waktu Tunggu (menit)', key: 'median_wait_time', width: 25 },
                    { header: 'P95 Waktu Tunggu (menit)', key: 'p95_wait_time', width: 25 },
                    { header: 'SLA Terpenuhi', key: 'sla_met_count', width: 15 },
                    { header: 'SLA Terlampaui', key: 'sla_breached_count', width: 15 },
                    { header: '% SLA Terpenuhi', key: 'sla_met_percentage', width: 20 }
                ];

                // Calculate SLA percentage
                analysisData.forEach(item => {
                    item.sla_met_percentage = item.total_cases > 0
                        ? Math.round((item.sla_met_count / item.total_cases) * 100)
                        : 0;
                });

                trendSheet.addRows(analysisData);
            }

            // Style all sheets
            workbook.eachSheet((worksheet) => {
                // Style header
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '366092' }
                };
                headerRow.alignment = { horizontal: 'center' };
                headerRow.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Auto-fit columns
                worksheet.columns.forEach(column => {
                    column.width = Math.max(column.width, column.header.length + 5);
                });

                // Style data rows
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) {
                        row.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };

                        // Alternating row colors
                        if (rowNumber % 2 === 0) {
                            row.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'F2F2F2' }
                            };
                        }
                    }
                });
            });

            // Generate filename
            const filename = `Analisis_Waktu_Tunggu_Radiologi_${analysis_type}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Cache-Control', 'no-cache');

            // Send file
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Error exporting waiting time analysis to Excel:', error);
            res.status(500).json({
                status: 500,
                message: "gagal export Excel analisis waktu tunggu",
                data: error.message
            });
        }
    }

    // Helper method untuk get waiting time analysis data
    static async getWaitingTimeAnalysisData(params) {
        const {
            startDate,
            endDate,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            radiolog_id,
            is_cito,
            analysis_type = 'summary'
        } = params;

        let param = '';

        // Apply same filters as getWaitingTimeAnalysis
        if (startDate && endDate) {
            param += ` AND DATE(rr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
        }
        if (tipe_pemeriksaan) {
            param += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
        }
        if (dokter_pengirim_id) {
            param += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
        }
        if (radiolog_id) {
            param += ` AND re.radiolog_id = '${radiolog_id}'`;
        }
        if (is_cito !== undefined) {
            param += ` AND rr.is_cito = ${is_cito}`;
        }

        try {
            if (analysis_type === 'summary') {
                // Get summary and breakdown data
                const [summaryData, breakdownData] = await Promise.all([
                    sq.query(`
                        SELECT
                            COUNT(*) as total_cases,
                            COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cases,
                            COUNT(CASE WHEN rh.id IS NOT NULL THEN 1 END) as completed_cases,
                            COUNT(CASE WHEN re.id IS NOT NULL THEN 1 END) as expertise_completed,
                            COUNT(CASE WHEN re.status_expertise = 'final' THEN 1 END) as final_expertise,
                            AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as avg_request_to_examination,
                            AVG(EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as avg_examination_to_expertise,
                            AVG(EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as avg_total_waiting_time,
                            MIN(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as min_request_to_examination,
                            MIN(EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as min_examination_to_expertise,
                            MIN(EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as min_total_waiting_time,
                            MAX(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as max_request_to_examination,
                            MAX(EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as max_examination_to_expertise,
                            MAX(EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as max_total_waiting_time,
                            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as median_request_to_examination,
                            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as median_examination_to_expertise,
                            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as median_total_waiting_time,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as p95_request_to_examination,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60) as p95_examination_to_expertise,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60) as p95_total_waiting_time
                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                        WHERE rr."deletedAt" IS NULL
                            AND p."deletedAt" IS NULL
                            AND rh.tanggal_pemeriksaan IS NOT NULL
                            ${param}
                    `, s),

                    sq.query(`
                        SELECT
                            rt.nama_rad_test as group_name,
                            COUNT(*) as total_cases,
                            COUNT(CASE WHEN rh.id IS NOT NULL THEN 1 END) as completed_cases,
                            AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as avg_wait_time,
                            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as p95_wait_time
                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        WHERE rr."deletedAt" IS NULL
                            AND p."deletedAt" IS NULL
                            AND rh.tanggal_pemeriksaan IS NOT NULL
                            ${param}
                        GROUP BY rt.nama_rad_test
                        ORDER BY avg_wait_time DESC
                        LIMIT 10
                    `, s)
                ]);

                return [summaryData[0], breakdownData];

            } else if (analysis_type === 'detailed') {
                const data = await sq.query(`
                    SELECT
                        p.no_rm,
                        p.nama_lengkap,
                        p.jenis_kelamin,
                        EXTRACT(YEAR FROM AGE(p.tgl_lahir)) as umur_tahun,
                        rr.tanggal_request,
                        rr.is_cito,
                        rr.status as status_regis,
                        rt.nama_rad_test,
                        d.nama_dokter as nama_dokter_pengirim,
                        rad.nama_dokter as nama_radiolog,
                        rh.tanggal_pemeriksaan,
                        re."createdAt" as expertise_created_at,
                        EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 as request_to_examination_minutes,
                        EXTRACT(EPOCH FROM (re."createdAt" - rh.tanggal_pemeriksaan))/60 as examination_to_expertise_minutes,
                        EXTRACT(EPOCH FROM (re."createdAt" - rr.tanggal_request))/60 as total_waiting_time_minutes,
                        CASE
                            WHEN EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 30 THEN 'Fast'
                            WHEN EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 60 THEN 'Normal'
                            WHEN EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 120 THEN 'Slow'
                            ELSE 'Very Slow'
                        END as performance_category,
                        CASE
                            WHEN rr.is_cito = true AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 15 THEN 'SLA Met'
                            WHEN rr.is_cito = false AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 60 THEN 'SLA Met'
                            ELSE 'SLA Breached'
                        END as sla_status
                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                    WHERE rr."deletedAt" IS NULL
                        AND p."deletedAt" IS NULL
                        AND rh.tanggal_pemeriksaan IS NOT NULL
                        ${param}
                    ORDER BY rr.tanggal_request DESC
                `, s);

                return data.map(item => {
                    // Format dates
                    if (item.tanggal_request) {
                        item.tanggal_request = moment(item.tanggal_request).format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (item.tanggal_pemeriksaan) {
                        item.tanggal_pemeriksaan = moment(item.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (item.expertise_created_at) {
                        item.expertise_created_at = moment(item.expertise_created_at).format('YYYY-MM-DD HH:mm:ss');
                    }

                    // Round numeric values
                    Object.keys(item).forEach(key => {
                        if (key.includes('_minutes') && item[key] !== null) {
                            item[key] = Math.round(item[key] * 100) / 100;
                        }
                    });

                    return item;
                });

            } else if (analysis_type === 'trend') {
                const data = await sq.query(`
                    SELECT
                        DATE(rr.tanggal_request) as period_date,
                        COUNT(*) as total_cases,
                        COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cases,
                        COUNT(CASE WHEN rh.id IS NOT NULL THEN 1 END) as completed_cases,
                        AVG(EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as avg_wait_time,
                        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as median_wait_time,
                        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60) as p95_wait_time,
                        COUNT(CASE WHEN
                            (rr.is_cito = true AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 15)
                            OR (rr.is_cito = false AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 <= 60)
                        THEN 1 END) as sla_met_count,
                        COUNT(CASE WHEN
                            (rr.is_cito = true AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 > 15)
                            OR (rr.is_cito = false AND EXTRACT(EPOCH FROM (rh.tanggal_pemeriksaan - rr.tanggal_request))/60 > 60)
                        THEN 1 END) as sla_breached_count
                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    WHERE rr."deletedAt" IS NULL
                        AND p."deletedAt" IS NULL
                        AND rh.tanggal_pemeriksaan IS NOT NULL
                        ${param}
                    GROUP BY DATE(rr.tanggal_request)
                    ORDER BY period_date
                `, s);

                return data.map(item => {
                    item.period_date = moment(item.period_date).format('YYYY-MM-DD');
                    if (item.avg_wait_time) item.avg_wait_time = Math.round(item.avg_wait_time * 100) / 100;
                    if (item.median_wait_time) item.median_wait_time = Math.round(item.median_wait_time * 100) / 100;
                    if (item.p95_wait_time) item.p95_wait_time = Math.round(item.p95_wait_time * 100) / 100;
                    return item;
                });
            }

            return [];

        } catch (error) {
            console.error('Error in getWaitingTimeAnalysisData:', error);
            return [];
        }
    }

    // Get radiology cancellation analysis
    static async getCancellationAnalysis(req, res) {
        const {
            page = 1,
            perPage = 10,
            startDate,
            endDate,
            search,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            jenis_kelamin,
            umur_min,
            umur_max,
            alasan_pembatalan,
            status_pembatalan,
            sortBy = 'tanggal_pembatalan',
            sortOrder = 'DESC',
            analysis_type = 'summary' // summary, detailed, trend
        } = req.body;

        let param = '';
        let paramCount = '';
        let offset = (page - 1) * perPage;

        // Filter berdasarkan rentang tanggal
        if (startDate && endDate) {
            param += ` AND DATE(rr."deletedAt") BETWEEN '${startDate}' AND '${endDate}'`;
            paramCount += ` AND DATE(rr."deletedAt") BETWEEN '${startDate}' AND '${endDate}'`;
        }

        // Filter berdasarkan jenis kelamin
        if (jenis_kelamin) {
            param += ` AND p.jenis_kelamin = '${jenis_kelamin}'`;
            paramCount += ` AND p.jenis_kelamin = '${jenis_kelamin}'`;
        }

        // Filter berdasarkan umur
        if (umur_min !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) >= ${umur_min}`;
            paramCount += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) >= ${umur_min}`;
        }
        if (umur_max !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) <= ${umur_max}`;
            paramCount += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) <= ${umur_max}`;
        }

        // Filter berdasarkan tipe pemeriksaan
        if (tipe_pemeriksaan) {
            param += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
            paramCount += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
        }

        // Filter berdasarkan dokter pengirim
        if (dokter_pengirim_id) {
            param += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
            paramCount += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
        }

        // Filter berdasarkan alasan pembatalan
        if (alasan_pembatalan) {
            param += ` AND rr.keterangan_rad_regis ILIKE '%${alasan_pembatalan}%'`;
            paramCount += ` AND rr.keterangan_rad_regis ILIKE '%${alasan_pembatalan}%'`;
        }

        // Search berdasarkan nama pasien, no RM, atau dokter
        if (search) {
            param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%' OR d.nama_dokter ILIKE '%${search}%')`;
            paramCount += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%' OR d.nama_dokter ILIKE '%${search}%')`;
        }

        // Validasi kolom sorting
        const validSortColumns = ['tanggal_pembatalan', 'nama_pasien', 'no_rm', 'nama_rad_test', 'alasan_pembatalan'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'tanggal_pembatalan';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        try {
            let data, statistics;

            if (analysis_type === 'summary') {
                // Summary statistics
                [data, statistics] = await Promise.all([
                    sq.query(`
                        SELECT
                            COUNT(*) as total_cancellations,
                            COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cancellations,
                            COUNT(CASE WHEN rh.id IS NULL THEN 1 END) as cancelled_before_examination,
                            COUNT(CASE WHEN rh.id IS NOT NULL AND re.id IS NULL THEN 1 END) as cancelled_after_examination,
                            COUNT(CASE WHEN re.status_expertise = 'draft' THEN 1 END) as cancelled_during_expertise,

                            -- Cancellation by time periods
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 60 THEN 1 END) as cancelled_within_1h,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 BETWEEN 61 AND 360 THEN 1 END) as cancelled_1h_to_6h,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 BETWEEN 361 AND 1440 THEN 1 END) as cancelled_6h_to_24h,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 > 1440 THEN 1 END) as cancelled_after_24h,

                            -- Average cancellation time
                            AVG(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as avg_cancellation_time_minutes,
                            MIN(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as min_cancellation_time_minutes,
                            MAX(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as max_cancellation_time_minutes

                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                        WHERE rr."deletedAt" IS NOT NULL
                            AND p."deletedAt" IS NULL
                            ${param}
                    `, s),

                    // Breakdown by test type
                    sq.query(`
                        SELECT
                            rt.nama_rad_test as test_type,
                            COUNT(*) as total_cancellations,
                            COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cancellations,
                            AVG(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as avg_cancellation_time,
                            STRING_AGG(DISTINCT rr.keterangan_rad_regis, ', ') as common_reasons
                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                        WHERE rr."deletedAt" IS NOT NULL
                            AND p."deletedAt" IS NULL
                            AND rt.nama_rad_test IS NOT NULL
                            ${param}
                        GROUP BY rt.nama_rad_test
                        ORDER BY total_cancellations DESC
                        LIMIT 10
                    `, s)
                ]);

            } else if (analysis_type === 'detailed') {
                // Detailed case-by-case analysis

                data = await sq.query(`
                    SELECT
                        -- Patient Information
                        p.no_rm,
                        p.nama_lengkap,
                        p.jenis_kelamin,
                        p.tgl_lahir,
                        p.alamat_sekarang,
                        p.no_telepon,
                        EXTRACT(YEAR FROM AGE(p.tgl_lahir)) as umur_tahun,
                        EXTRACT(MONTH FROM AGE(p.tgl_lahir)) as umur_bulan,
                        EXTRACT(DAY FROM AGE(p.tgl_lahir)) as umur_hari,

                        -- Registration Information
                        r.id as registrasi_id,
                        r.no_antrian,
                        r.no_sep,
                        r.no_rujukan,
                        r.tgl_registrasi as tanggal_daftar,

                        -- Radiology Registration
                        rr.id as rad_regis_id, 
                        rr.tanggal_request,
                        rr.is_cito,
                        rr.is_puasa,
                        rr.diagnosa,
                        rr.klinis,
                        rr.reason as alasan_pembatalan,
                        rr.status as status_regis,
                        rr."createdAt" as reg_created_at,
                        rr."deletedAt" as tanggal_pembatalan,

                        -- Referring Doctor
                        d.id as dokter_pengirim_id,
                        d.nama_dokter as nama_dokter_pengirim,

                        -- Test Information
                        rt.id as rad_test_id,
                        rt.nama_rad_test,
                        rt.keterangan_rad_test,

                        -- Results Information (if exists)
                        rh.id as rad_hasil_id,
                        rh.tanggal_pemeriksaan,
                        rh.hasil,
                        rh.kesan,
                        rh.saran,

                        -- Expertise Information (if exists)
                        re.id as expertise_id,
                        re.temuan,
                        re.kesimpulan,
                        re.status_expertise,

                        -- Cancellation Analysis
                        EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 as cancellation_time_minutes,
                        EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/3600 as cancellation_time_hours,
                        EXTRACT(DAY FROM (rr."deletedAt" - rr.tanggal_request)) as cancellation_time_days,

                        -- Cancellation Time Category
                        CASE
                            WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 60 THEN 'Dalam 1 Jam'
                            WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 360 THEN '1-6 Jam'
                            WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 1440 THEN '6-24 Jam'
                            ELSE 'Lebih dari 24 Jam'
                        END as kategori_waktu_pembatalan,

                        -- Cancellation Stage
                        CASE
                            WHEN rh.id IS NULL THEN 'Sebelum Pemeriksaan'
                            WHEN re.id IS NULL THEN 'Setelah Pemeriksaan'
                            WHEN re.status_expertise = 'draft' THEN 'Sedang Dikerjakan'
                            ELSE 'Tidak Diketahui'
                        END as tahap_pembatalan,

                        -- Age calculation
                        CASE
                            WHEN EXTRACT(YEAR FROM AGE(p.tgl_lahir)) > 0 THEN
                                EXTRACT(YEAR FROM AGE(p.tgl_lahir))::text || ' tahun'
                            WHEN EXTRACT(MONTH FROM AGE(p.tgl_lahir)) > 0 THEN
                                EXTRACT(MONTH FROM AGE(p.tgl_lahir))::text || ' bulan'
                            ELSE
                                EXTRACT(DAY FROM AGE(p.tgl_lahir))::text || ' hari'
                        END as umur_desc

                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    WHERE rr."deletedAt" IS NOT NULL
                        AND p."deletedAt" IS NULL
                        ${param}
                    ORDER BY rr."deletedAt" ${sortDirection}
                    LIMIT ${perPage} OFFSET ${offset}
                `, s);

                // Get total count for pagination
                const countData = await sq.query(`
                    SELECT COUNT(*) as total
                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    WHERE rr."deletedAt" IS NOT NULL
                        AND p."deletedAt" IS NULL
                        ${paramCount}
                `, s);

                statistics = {
                    pagination: {
                        page: parseInt(page),
                        perPage: parseInt(perPage),
                        total: countData[0]?.total || 0,
                        totalPages: Math.ceil((countData[0]?.total || 0) / perPage)
                    }
                };

            } else if (analysis_type === 'trend') {
                // Trend analysis over time
                data = await sq.query(`
                    SELECT
                        DATE(rr."deletedAt") as tanggal_pembatalan,
                        COUNT(*) as total_cancellations,
                        COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cancellations,
                        COUNT(CASE WHEN rh.id IS NULL THEN 1 END) as cancelled_before_examination,
                        COUNT(CASE WHEN rh.id IS NOT NULL AND re.id IS NULL THEN 1 END) as cancelled_after_examination,
                        COUNT(CASE WHEN re.status_expertise = 'draft' THEN 1 END) as cancelled_during_expertise,
                        AVG(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as avg_cancellation_time,
                        STRING_AGG(DISTINCT rr.keterangan_rad_regis, ', ') as common_reasons

                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    WHERE rr."deletedAt" IS NOT NULL
                        AND p."deletedAt" IS NULL
                        ${param}
                    GROUP BY DATE(rr."deletedAt")
                    ORDER BY tanggal_pembatalan DESC
                `, s);

                statistics = null;
            }

            // Process data
            const processedData = Array.isArray(data) ? data.map(item => {
                // Format dates
                if (item.tanggal_request) {
                    item.tanggal_request = moment(item.tanggal_request).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tanggal_pembatalan) {
                    item.tanggal_pembatalan = moment(item.tanggal_pembatalan).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tanggal_pemeriksaan) {
                    item.tanggal_pemeriksaan = moment(item.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.tgl_lahir) {
                    item.tgl_lahir = moment(item.tgl_lahir).format('YYYY-MM-DD');
                }
                if (item.tanggal_daftar) {
                    item.tanggal_daftar = moment(item.tanggal_daftar).format('YYYY-MM-DD HH:mm:ss');
                }

                // Round numeric values
                if (item.avg_cancellation_time) item.avg_cancellation_time = Math.round(item.avg_cancellation_time * 100) / 100;
                if (item.cancellation_time_minutes) item.cancellation_time_minutes = Math.round(item.cancellation_time_minutes * 100) / 100;
                if (item.cancellation_time_hours) item.cancellation_time_hours = Math.round(item.cancellation_time_hours * 100) / 100;

                // Parse JSON fields if they exist
                try {
                    if (item.diagnosa) item.diagnosa = JSON.parse(item.diagnosa);
                    if (item.hasil) item.hasil = JSON.parse(item.hasil);
                    if (item.kesan) item.kesan = JSON.parse(item.kesan);
                    if (item.saran) item.saran = JSON.parse(item.saran);
                } catch (e) {
                    console.warn('Error parsing JSON fields:', e);
                }

                return item;
            }) : data;

            // Process statistics
            const processedStatistics = statistics && !statistics.pagination ? statistics.map(item => {
                // Round numeric values
                if (item.avg_cancellation_time) item.avg_cancellation_time = Math.round(item.avg_cancellation_time * 100) / 100;
                return item;
            }) : statistics;

            res.status(200).json({
                status: 200,
                message: "sukses",
                data: processedData,
                statistics: processedStatistics,
                analysis_type,
                filters: {
                    startDate,
                    endDate,
                    search,
                    tipe_pemeriksaan,
                    dokter_pengirim_id,
                    jenis_kelamin,
                    umur_min,
                    umur_max,
                    alasan_pembatalan,
                    status_pembatalan
                }
            });

        } catch (error) {
            console.error('Error in getCancellationAnalysis:', error);
            res.status(500).json({
                status: 500,
                message: "gagal mengambil data analisis pembatalan",
                data: error.message
            });
        }
    }

    // Export cancellation analysis to Excel
    static async exportCancellationAnalysisExcel(req, res) {
        const {
            startDate,
            endDate,
            search,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            jenis_kelamin,
            umur_min,
            umur_max,
            alasan_pembatalan,
            status_pembatalan,
            sortBy = 'tanggal_pembatalan',
            sortOrder = 'DESC',
            analysis_type = 'detailed'
        } = req.body;

        try {
            // Get data without pagination for export
            const cancellationData = await Controller.getCancellationAnalysisData({
                startDate,
                endDate,
                search,
                tipe_pemeriksaan,
                dokter_pengirim_id,
                jenis_kelamin,
                umur_min,
                umur_max,
                alasan_pembatalan,
                status_pembatalan,
                sortBy,
                sortOrder,
                analysis_type
            });

            if (!cancellationData || (Array.isArray(cancellationData) && cancellationData.length === 0)) {
                return res.status(404).json({
                    status: 404,
                    message: "Data tidak ditemukan untuk periode yang dipilih"
                });
            }

            // Generate Excel
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();

            if (analysis_type === 'summary') {
                // Create summary sheet
                const summarySheet = workbook.addWorksheet('Ringkasan Pembatalan');

                // Summary headers
                summarySheet.columns = [
                    { header: 'Metrik', key: 'metric', width: 30 },
                    { header: 'Nilai', key: 'value', width: 20 },
                    { header: 'Satuan', key: 'unit', width: 15 }
                ];

                // Add summary data
                const summaryData = cancellationData[0];
                summarySheet.addRows([
                    { metric: 'Total Pembatalan', value: summaryData.total_cancellations, unit: 'kasus' },
                    { metric: 'Pembatalan CITO', value: summaryData.cito_cancellations, unit: 'kasus' },
                    { metric: 'Pembatalan Sebelum Pemeriksaan', value: summaryData.cancelled_before_examination, unit: 'kasus' },
                    { metric: 'Pembatalan Setelah Pemeriksaan', value: summaryData.cancelled_after_examination, unit: 'kasus' },
                    { metric: 'Pembatalan Saat Expertise', value: summaryData.cancelled_during_expertise, unit: 'kasus' },
                    {},
                    { metric: 'Dibatalkan dalam 1 Jam', value: summaryData.cancelled_within_1h, unit: 'kasus' },
                    { metric: 'Dibatalkan 1-6 Jam', value: summaryData.cancelled_1h_to_6h, unit: 'kasus' },
                    { metric: 'Dibatalkan 6-24 Jam', value: summaryData.cancelled_6h_to_24h, unit: 'kasus' },
                    { metric: 'Dibatalkan >24 Jam', value: summaryData.cancelled_after_24h, unit: 'kasus' },
                    {},
                    { metric: 'Rata-rata Waktu Pembatalan', value: summaryData.avg_cancellation_time_minutes, unit: 'menit' },
                    { metric: 'Waktu Pembatalan Minimum', value: summaryData.min_cancellation_time_minutes, unit: 'menit' },
                    { metric: 'Waktu Pembatalan Maksimum', value: summaryData.max_cancellation_time_minutes, unit: 'menit' }
                ]);

                // Create breakdown sheet
                const breakdownSheet = workbook.addWorksheet('Breakdown per Jenis Pemeriksaan');
                breakdownSheet.columns = [
                    { header: 'Jenis Pemeriksaan', key: 'test_type', width: 30 },
                    { header: 'Total Pembatalan', key: 'total_cancellations', width: 20 },
                    { header: 'Pembatalan CITO', key: 'cito_cancellations', width: 20 },
                    { header: 'Rata-rata Waktu Pembatalan (menit)', key: 'avg_cancellation_time', width: 30 },
                    { header: 'Alasan Umum', key: 'common_reasons', width: 50 }
                ];

                breakdownSheet.addRows(cancellationData[1]);

            } else if (analysis_type === 'detailed') {
                // Detailed case-by-case sheet
                const detailSheet = workbook.addWorksheet('Detail Pembatalan per Kasus');

                detailSheet.columns = [
                    { header: 'No. RM', key: 'no_rm', width: 15 },
                    { header: 'Nama Pasien', key: 'nama_lengkap', width: 30 },
                    { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
                    { header: 'Umur', key: 'umur_desc', width: 15 },
                    { header: 'No. Telepon', key: 'no_telepon', width: 15 },
                    { header: 'Tanggal Request', key: 'tanggal_request', width: 20 },
                    { header: 'Jenis Pemeriksaan', key: 'nama_rad_test', width: 25 },
                    { header: 'Dokter Pengirim', key: 'nama_dokter_pengirim', width: 25 },
                    { header: 'CITO', key: 'is_cito', width: 10 },
                    { header: 'Tanggal Pemeriksaan', key: 'tanggal_pemeriksaan', width: 20 },
                    { header: 'Tanggal Pembatalan', key: 'tanggal_pembatalan', width: 20 },
                    { header: 'Alasan Pembatalan', key: 'alasan_pembatalan', width: 40 },
                    { header: 'Waktu Pembatalan (menit)', key: 'cancellation_time_minutes', width: 25 },
                    { header: 'Kategori Waktu', key: 'kategori_waktu_pembatalan', width: 25 },
                    { header: 'Tahap Pembatalan', key: 'tahap_pembatalan', width: 25 }
                ];

                // Add data
                cancellationData.forEach(item => {
                    detailSheet.addRow({
                        no_rm: item.no_rm || '',
                        nama_lengkap: item.nama_lengkap || '',
                        jenis_kelamin: item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                        umur_desc: item.umur_desc || '',
                        no_telepon: item.no_telepon || '',
                        tanggal_request: item.tanggal_request || '',
                        nama_rad_test: item.nama_rad_test || '',
                        nama_dokter_pengirim: item.nama_dokter_pengirim || '',
                        is_cito: item.is_cito ? 'Ya' : 'Tidak',
                        tanggal_pemeriksaan: item.tanggal_pemeriksaan || '-',
                        tanggal_pembatalan: item.tanggal_pembatalan || '',
                        alasan_pembatalan: item.alasan_pembatalan || '',
                        cancellation_time_minutes: item.cancellation_time_minutes || 0,
                        kategori_waktu_pembatalan: item.kategori_waktu_pembatalan || '',
                        tahap_pembatalan: item.tahap_pembatalan || ''
                    });
                });

            } else if (analysis_type === 'trend') {
                // Trend analysis sheet
                const trendSheet = workbook.addWorksheet('Tren Pembatalan');

                trendSheet.columns = [
                    { header: 'Tanggal Pembatalan', key: 'tanggal_pembatalan', width: 20 },
                    { header: 'Total Pembatalan', key: 'total_cancellations', width: 20 },
                    { header: 'Pembatalan CITO', key: 'cito_cancellations', width: 20 },
                    { header: 'Sebelum Pemeriksaan', key: 'cancelled_before_examination', width: 25 },
                    { header: 'Setelah Pemeriksaan', key: 'cancelled_after_examination', width: 25 },
                    { header: 'Saat Expertise', key: 'cancelled_during_expertise', width: 20 },
                    { header: 'Rata-rata Waktu Pembatalan (menit)', key: 'avg_cancellation_time', width: 30 },
                    { header: 'Alasan Umum', key: 'common_reasons', width: 50 }
                ];

                trendSheet.addRows(cancellationData);
            }

            // Style all sheets
            workbook.eachSheet((worksheet) => {
                // Style header
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '366092' }
                };
                headerRow.alignment = { horizontal: 'center' };
                headerRow.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Auto-fit columns
                worksheet.columns.forEach(column => {
                    column.width = Math.max(column.width, column.header.length + 5);
                });

                // Style data rows
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) {
                        row.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };

                        // Alternating row colors
                        if (rowNumber % 2 === 0) {
                            row.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'F2F2F2' }
                            };
                        }
                    }
                });
            });

            // Generate filename
            const filename = `Analisis_Pembatalan_Radiologi_${analysis_type}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Cache-Control', 'no-cache');

            // Send file
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Error exporting cancellation analysis to Excel:', error);
            res.status(500).json({
                status: 500,
                message: "gagal export Excel analisis pembatalan",
                data: error.message
            });
        }
    }

    // Helper method untuk get cancellation analysis data
    static async getCancellationAnalysisData(params) {
        const {
            startDate,
            endDate,
            search,
            tipe_pemeriksaan,
            dokter_pengirim_id,
            jenis_kelamin,
            umur_min,
            umur_max,
            alasan_pembatalan,
            status_pembatalan,
            sortBy = 'tanggal_pembatalan',
            sortOrder = 'DESC',
            analysis_type = 'summary'
        } = params;

        let param = '';

        // Apply same filters as getCancellationAnalysis
        if (startDate && endDate) {
            param += ` AND DATE(rr."deletedAt") BETWEEN '${startDate}' AND '${endDate}'`;
        }
        if (jenis_kelamin) {
            param += ` AND p.jenis_kelamin = '${jenis_kelamin}'`;
        }
        if (umur_min !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) >= ${umur_min}`;
        }
        if (umur_max !== undefined) {
            param += ` AND ${moment().format('YYYY')} - EXTRACT(YEAR FROM p.tgl_lahir) <= ${umur_max}`;
        }
        if (tipe_pemeriksaan) {
            param += ` AND rt.nama_rad_test ILIKE '%${tipe_pemeriksaan}%'`;
        }
        if (dokter_pengirim_id) {
            param += ` AND rr.ms_dokter_id = '${dokter_pengirim_id}'`;
        }
        if (alasan_pembatalan) {
            param += ` AND rr.keterangan_rad_regis ILIKE '%${alasan_pembatalan}%'`;
        }
        if (search) {
            param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%' OR d.nama_dokter ILIKE '%${search}%')`;
        }

        const validSortColumns = ['tanggal_pembatalan', 'nama_pasien', 'no_rm', 'nama_rad_test', 'alasan_pembatalan'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'tanggal_pembatalan';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        try {
            console.log('===> controller.js:3230 ~ analysis_type', analysis_type, param);
            if (analysis_type === 'summary') {
                // Get summary and breakdown data
                const [summaryData, breakdownData] = await Promise.all([
                    sq.query(`
                        SELECT
                            COUNT(*) as total_cancellations,
                            COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cancellations,
                            COUNT(CASE WHEN rh.id IS NULL THEN 1 END) as cancelled_before_examination,
                            COUNT(CASE WHEN rh.id IS NOT NULL AND re.id IS NULL THEN 1 END) as cancelled_after_examination,
                            COUNT(CASE WHEN re.status_expertise = 'draft' THEN 1 END) as cancelled_during_expertise,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 60 THEN 1 END) as cancelled_within_1h,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 BETWEEN 61 AND 360 THEN 1 END) as cancelled_1h_to_6h,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 BETWEEN 361 AND 1440 THEN 1 END) as cancelled_6h_to_24h,
                            COUNT(CASE WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 > 1440 THEN 1 END) as cancelled_after_24h,
                            AVG(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as avg_cancellation_time_minutes,
                            MIN(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as min_cancellation_time_minutes,
                            MAX(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as max_cancellation_time_minutes
                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                        WHERE rr."deletedAt" IS NOT NULL
                            AND p."deletedAt" IS NULL
                            ${param}
                    `, s),

                    sq.query(`
                        SELECT
                            rt.nama_rad_test as test_type,
                            COUNT(*) as total_cancellations,
                            COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cancellations,
                            AVG(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as avg_cancellation_time,
                            STRING_AGG(DISTINCT rr.keterangan_rad_regis, ', ') as common_reasons
                        FROM rad_regis rr
                        LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                        LEFT JOIN pasien p ON p.id = r.pasien_id
                        LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                        LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                        LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                        LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                        WHERE rr."deletedAt" IS NOT NULL
                            AND p."deletedAt" IS NULL
                            AND rt.nama_rad_test IS NOT NULL
                            ${param}
                        GROUP BY rt.nama_rad_test
                        ORDER BY total_cancellations DESC
                        LIMIT 10
                    `, s)
                ]);

                return [summaryData[0], breakdownData];

            } else if (analysis_type === 'detailed') { 
                const data = await sq.query(`
                    SELECT
                        p.no_rm,
                        p.nama_lengkap,
                        p.jenis_kelamin,
                        p.tgl_lahir,
                        p.alamat_sekarang,
                        p.no_telepon,
                        EXTRACT(YEAR FROM AGE(p.tgl_lahir)) as umur_tahun,
                        r.id as registrasi_id,
                        r.no_antrian,
                        r.no_sep,
                        r.no_rujukan,
                        r.tgl_registrasi as tanggal_daftar,
                        rr.id as rad_regis_id,
                        rr.tanggal_request,
                        rr.is_cito,
                        rr.is_puasa,
                        rr.diagnosa,
                        rr.klinis,
                        rr.reason as alasan_pembatalan,
                        rr.status as status_regis,
                        rr."createdAt" as reg_created_at,
                        rr."deletedAt" as tanggal_pembatalan,
                        d.id as dokter_pengirim_id,
                        d.nama_dokter as nama_dokter_pengirim,
                        rt.id as rad_test_id,
                        rt.nama_rad_test,
                        rt.keterangan_rad_test,
                        rh.id as rad_hasil_id,
                        rh.tanggal_pemeriksaan,
                        rh.hasil,
                        rh.kesan,
                        rh.saran,
                        re.id as expertise_id,
                        re.temuan,
                        re.kesimpulan,
                        re.status_expertise,
                        EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 as cancellation_time_minutes,
                        EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/3600 as cancellation_time_hours,
                        EXTRACT(DAY FROM (rr."deletedAt" - rr.tanggal_request)) as cancellation_time_days,
                        CASE
                            WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 60 THEN 'Dalam 1 Jam'
                            WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 360 THEN '1-6 Jam'
                            WHEN EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60 <= 1440 THEN '6-24 Jam'
                            ELSE 'Lebih dari 24 Jam'
                        END as kategori_waktu_pembatalan,
                        CASE
                            WHEN rh.id IS NULL THEN 'Sebelum Pemeriksaan'
                            WHEN re.id IS NULL THEN 'Setelah Pemeriksaan'
                            WHEN re.status_expertise = 'draft' THEN 'Sedang Dikerjakan'
                            ELSE 'Tidak Diketahui'
                        END as tahap_pembatalan,
                        CASE
                            WHEN EXTRACT(YEAR FROM AGE(p.tgl_lahir)) > 0 THEN
                                EXTRACT(YEAR FROM AGE(p.tgl_lahir))::text || ' tahun'
                            WHEN EXTRACT(MONTH FROM AGE(p.tgl_lahir)) > 0 THEN
                                EXTRACT(MONTH FROM AGE(p.tgl_lahir))::text || ' bulan'
                            ELSE
                                EXTRACT(DAY FROM AGE(p.tgl_lahir))::text || ' hari'
                        END as umur_desc
                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    WHERE rr."deletedAt" IS NOT NULL
                        AND p."deletedAt" IS NULL
                        ${param}
                    ORDER BY rr."deletedAt" ${sortDirection}
                `, s);

                return data.map(item => {
                    // Format dates
                    if (item.tanggal_request) {
                        item.tanggal_request = moment(item.tanggal_request).format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (item.tanggal_pembatalan) {
                        item.tanggal_pembatalan = moment(item.tanggal_pembatalan).format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (item.tanggal_pemeriksaan) {
                        item.tanggal_pemeriksaan = moment(item.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (item.tgl_lahir) {
                        item.tgl_lahir = moment(item.tgl_lahir).format('YYYY-MM-DD');
                    }
                    if (item.tanggal_daftar) {
                        item.tanggal_daftar = moment(item.tanggal_daftar).format('YYYY-MM-DD HH:mm:ss');
                    }

                    // Round numeric values
                    if (item.cancellation_time_minutes) item.cancellation_time_minutes = Math.round(item.cancellation_time_minutes * 100) / 100;
                    if (item.cancellation_time_hours) item.cancellation_time_hours = Math.round(item.cancellation_time_hours * 100) / 100;

                    // Parse JSON fields
                    try {
                        if (item.diagnosa) item.diagnosa = JSON.parse(item.diagnosa);
                        if (item.hasil) item.hasil = JSON.parse(item.hasil);
                        if (item.kesan) item.kesan = JSON.parse(item.kesan);
                        if (item.saran) item.saran = JSON.parse(item.saran);
                    } catch (e) {
                        console.warn('Error parsing JSON fields:', e);
                    }

                    return item;
                });

            } else if (analysis_type === 'trend') {
                const data = await sq.query(`
                    SELECT
                        DATE(rr."deletedAt") as tanggal_pembatalan,
                        COUNT(*) as total_cancellations,
                        COUNT(CASE WHEN rr.is_cito = true THEN 1 END) as cito_cancellations,
                        COUNT(CASE WHEN rh.id IS NULL THEN 1 END) as cancelled_before_examination,
                        COUNT(CASE WHEN rh.id IS NOT NULL AND re.id IS NULL THEN 1 END) as cancelled_after_examination,
                        COUNT(CASE WHEN re.status_expertise = 'draft' THEN 1 END) as cancelled_during_expertise,
                        AVG(EXTRACT(EPOCH FROM (rr."deletedAt" - rr.tanggal_request))/60) as avg_cancellation_time,
                        STRING_AGG(DISTINCT rr.keterangan_rad_regis, ', ') as common_reasons
                    FROM rad_regis rr
                    LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                    LEFT JOIN pasien p ON p.id = r.pasien_id
                    LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                    LEFT JOIN rad_hasil rh ON rh.rad_regis_id = rr.id
                    LEFT JOIN rad_test rt ON rt.id = rh.rad_test_id
                    LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
                    WHERE rr."deletedAt" IS NOT NULL
                        AND p."deletedAt" IS NULL
                        ${param}
                    GROUP BY DATE(rr."deletedAt")
                    ORDER BY tanggal_pembatalan DESC
                `, s);

                return data.map(item => {
                    item.tanggal_pembatalan = moment(item.tanggal_pembatalan).format('YYYY-MM-DD');
                    if (item.avg_cancellation_time) item.avg_cancellation_time = Math.round(item.avg_cancellation_time * 100) / 100;
                    return item;
                });
            }

            return [];

        } catch (error) {
            console.error('Error in getCancellationAnalysisData:', error);
            return [];
        }
    }
}

module.exports = Controller;