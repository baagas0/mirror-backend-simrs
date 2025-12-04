const PDFDocument = require('pdfkit');
const moment = require('moment');

class RadiologyExpertisePDF {
    constructor(data, options = {}) {
        this.data = data;
        this.options = {
            includeImages: options.includeImages || false,
            includeMeasurements: options.includeMeasurements || true,
            includeComparison: options.includeComparison || true,
            language: options.language || 'id',
            ...options
        };
    }

    generatePDF() {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                    info: {
                        Title: 'Hasil Pemeriksaan Radiologi - Expertise',
                        Author: 'RSUD Buton Selatan',
                        Subject: `Radiology Report - ${this.data.nama_pasien}`,
                        Creator: 'Radiology Information System',
                        Producer: 'RSUD Buton Selatan'
                    }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                });
                doc.on('error', reject);

                this.generateContent(doc);
            } catch (error) {
                reject(error);
            }
        });
    }

    generateContent(doc) {
        // Header
        this.addHeader(doc);

        // Patient Information
        this.addPatientInfo(doc);

        // Clinical Information
        this.addClinicalInfo(doc);

        // Examination Details
        this.addExaminationDetails(doc);

        // Findings (Temuan)
        this.addFindings(doc);

        // Measurements (if available)
        if (this.options.includeMeasurements && this.data.measurements) {
            this.addMeasurements(doc);
        }

        // Comparison (if available)
        if (this.options.includeComparison && this.data.comparison_notes) {
            this.addComparison(doc);
        }

        // Conclusion (Kesimpulan)
        this.addConclusion(doc);

        // Recommendations (Saran)
        this.addRecommendations(doc);

        // Signature Section
        this.addSignatures(doc);

        // Footer
        this.addFooter(doc);

        doc.end();
    }

    addHeader(doc) {
        // Header with hospital information
        doc.fontSize(16).text('HASIL PEMERIKSAAN RADIOLOGI', { align: 'center' });
        doc.fontSize(12).text('EXPERTISE & INTERPRETASI', { align: 'center' });
        doc.fontSize(11).text('RUMAH SAKIT UMUM DAERAH BUTON SELATAN', { align: 'center' });
        doc.fontSize(9).text('Jl. Gajah Mada, Kec. Batauga, Kab. Buton Selatan', { align: 'center' });
        doc.fontSize(9).text('Sulawesi Tenggara - Indonesia', { align: 'center' });
        doc.fontSize(9).text('Telepon: (0401) - 12345 | Email: rsudbusel@gmail.com', { align: 'center' });

        // Separator line
        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown();
    }

    addPatientInfo(doc) {
        doc.fontSize(12).text('INFORMASI PASIEN', { underline: true });
        doc.fontSize(10);

        const patientData = [
            ['Nama Pasien', this.data.nama_pasien || '-'],
            ['No. RM', this.data.no_rm || '-'],
            ['Jenis Kelamin', this.getJenisKelamin(this.data.jenis_kelamin)],
            ['Tanggal Lahir', this.formatDate(this.data.tgl_lahir)],
            ['Umur', this.calculateAge(this.data.tgl_lahir)],
            ['No. Registrasi', this.data.registrasi_id || '-'],
            ['Alamat', this.data.alamat_sekarang || '-']
        ];

        let y = doc.y;
        patientData.forEach(([label, value], index) => {
            if (index % 2 === 0) {
                doc.text(`${label}: ${value}`, 50, y);
            } else {
                doc.text(`${label}: ${value}`, 300, y);
                y += 15;
            }
        });

        doc.moveDown();
    }

    addClinicalInfo(doc) {
        doc.fontSize(12).text('INFORMASI KLINIS', { underline: true });
        doc.fontSize(10);

        const clinicalData = [
            ['Dokter Pengirim', this.data.nama_dokter_pengirim || '-'],
            ['Tanggal Permintaan', this.formatDateTime(this.data.tanggal_request)],
            ['Tanggal Pemeriksaan', this.formatDateTime(this.data.tanggal_pemeriksaan)],
            ['Diagnosa Klinis', this.getDiagnosa(this.data.diagnosa)],
            ['Informasi Klinis', this.data.klinis || '-'],
            ['Urgency', this.getUrgencyLevel(this.data.urgency_level)]
        ];

        let y = doc.y;
        clinicalData.forEach(([label, value], index) => {
            if (index % 2 === 0) {
                doc.text(`${label}: ${value}`, 50, y);
            } else {
                doc.text(`${label}: ${value}`, 300, y);
                y += 15;
            }
        });

        doc.moveDown();
    }

    addExaminationDetails(doc) {
        doc.fontSize(12).text('DETAIL PEMERIKSAAN', { underline: true });
        doc.fontSize(10);

        const examData = [
            ['Jenis Pemeriksaan', this.data.nama_rad_test || '-'],
            ['Modality', this.getModality(this.data.nama_rad_test)],
            ['Body Region', this.data.body_region || '-'],
            ['Technique', this.data.technique || this.data.technique_used || '-']
        ];

        // Add radiography parameters if available
        if (this.data.proyeksi || this.data.kv || this.data.mas) {
            examData.push(
                ['Proyeksi', this.data.proyeksi || '-'],
                ['Tegangan (kV)', this.data.kv || '-'],
                ['Arus (mAs)', this.data.mas || '-'],
                ['FFD', this.data.ffd || '-'],
                ['BSF', this.data.bsf || '-'],
                ['Dosis Radiasi', this.data.dosis_radiasi || '-']
            );
        }

        examData.forEach(([label, value]) => {
            doc.text(`${label}: ${value}`);
        });

        doc.moveDown();
    }

    addFindings(doc) {
        doc.fontSize(12).text('TEMUAN PEMERIKSAAN', { underline: true });
        doc.fontSize(10);

        if (this.data.temuan) {
            // Split findings into paragraphs for better readability
            const findings = this.data.temuan.split('\n');
            findings.forEach(paragraph => {
                if (paragraph.trim()) {
                    doc.text(`• ${paragraph.trim()}`, { align: 'justify' });
                    doc.moveDown(0.3);
                }
            });
        } else {
            doc.text('Tidak ada temuan khusus yang dilaporkan.');
        }

        // Add additional findings if available
        if (this.data.additional_findings && Object.keys(this.data.additional_findings).length > 0) {
            doc.moveDown(0.5);
            doc.fontSize(11).text('Temuan Tambahan:', { underline: true });
            doc.fontSize(10);

            Object.entries(this.data.additional_findings).forEach(([key, value]) => {
                if (value) {
                    doc.text(`• ${key}: ${value}`);
                    doc.moveDown(0.2);
                }
            });
        }

        doc.moveDown();
    }

    addMeasurements(doc) {
        doc.fontSize(12).text('PENGUKURAN', { underline: true });
        doc.fontSize(10);

        if (this.data.measurements && Object.keys(this.data.measurements).length > 0) {
            Object.entries(this.data.measurements).forEach(([key, value]) => {
                if (value) {
                    doc.text(`• ${key}: ${value}`);
                    doc.moveDown(0.2);
                }
            });
        } else {
            doc.text('Tidak ada pengukuran khusus yang dilaporkan.');
        }

        doc.moveDown();
    }

    addComparison(doc) {
        doc.fontSize(12).text('PERBANDINGAN', { underline: true });
        doc.fontSize(10);

        if (this.data.comparison_notes) {
            doc.text(this.data.comparison_notes, { align: 'justify' });
        } else {
            doc.text('Tidak ada pemeriksaan sebelumnya untuk perbandingan.');
        }

        doc.moveDown();
    }

    addConclusion(doc) {
        doc.fontSize(12).text('KESIMPULAN', { underline: true });
        doc.fontSize(10);

        if (this.data.kesimpulan) {
            const conclusions = this.data.kesimpulan.split('\n');
            conclusions.forEach(paragraph => {
                if (paragraph.trim()) {
                    doc.text(`${paragraph.trim()}`, { align: 'justify' });
                    doc.moveDown(0.3);
                }
            });
        } else {
            doc.text('Kesimpulan belum tersedia.');
        }

        // Add clinical correlation if available
        if (this.data.clinical_correlation) {
            doc.moveDown(0.5);
            doc.fontSize(11).text('Korelasi Klinis:', { underline: true });
            doc.fontSize(10);
            doc.text(this.data.clinical_correlation, { align: 'justify' });
        }

        doc.moveDown();
    }

    addRecommendations(doc) {
        doc.fontSize(12).text('SARAN / REKOMENDASI', { underline: true });
        doc.fontSize(10);

        if (this.data.saran) {
            const recommendations = this.data.saran.split('\n');
            recommendations.forEach(paragraph => {
                if (paragraph.trim()) {
                    doc.text(`${paragraph.trim()}`, { align: 'justify' });
                    doc.moveDown(0.3);
                }
            });
        } else {
            doc.text('Tidak ada saran khusus.');
        }

        // Add limitations if available
        if (this.data.limitations) {
            doc.moveDown(0.5);
            doc.fontSize(11).text('Keterbatasan Pemeriksaan:', { underline: true });
            doc.fontSize(10);
            doc.text(this.data.limitations, { align: 'justify' });
        }

        doc.moveDown();
    }

    addSignatures(doc) {
        // Add status indicators
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Status Laporan: ${this.getStatusText(this.data.status_expertise)}`);
        doc.text(`Tingkat Urgensi: ${this.getUrgencyText(this.data.urgency_level)}`);

        if (this.data.critical_findings) {
            doc.fillColor('red').text('⚠ TEMUAN KRITIS TERIDENTIFIKASI').fillColor('black');
        }

        doc.moveDown(1.5);

        // Signature section
        doc.fontSize(10).font('Helvetica');

        const signatureY = doc.y;

        // Radiologist signature
        doc.text('Dibuat oleh:', 50, signatureY);
        doc.text('_________________', 50, signatureY + 20);
        doc.text(this.data.nama_radiolog || 'Radiolog', 50, signatureY + 25);
        doc.text(`NIP: ${this.data.radiolog_id || '________________'}`, 50, signatureY + 30);

        // Peer reviewer signature (if available)
        if (this.data.peer_review_status) {
            doc.text('Diperiksa oleh:', 300, signatureY);
            doc.text('_________________', 300, signatureY + 20);
            doc.text(this.data.nama_peer_reviewer || 'Peer Reviewer', 300, signatureY + 25);
            doc.text(`NIP: ${this.data.peer_reviewer_id || '________________'}`, 300, signatureY + 30);
        }

        // Report information
        doc.moveDown(2);
        doc.fontSize(9);
        doc.text(`Laporan ID: ${this.data.id || '-'}`);
        doc.text(`Versi: ${this.data.version || 1}`);
        doc.text(`Tipe Laporan: ${this.getReportTypeText(this.data.report_type)}`);
        doc.text(`Waktu Penyelesaian: ${this.data.report_completion_time || 0} menit`);

        doc.moveDown(1);
    }

    addFooter(doc) {
        // Footer line
        doc.moveTo(50, 720).lineTo(550, 720).stroke();

        // Footer text
        doc.fontSize(8).text(
            `Dicetak pada: ${moment().format('DD MMMM YYYY HH:mm:ss')} | Halaman ${doc.page ? doc.page.number : 1}`,
            { align: 'center' }
        );

        doc.fontSize(8).text(
            'Laporan ini bersifat rahasia dan hanya untuk kepentingan medis | RSUD Buton Selatan',
            { align: 'center' }
        );

        // Add watermark if draft
        if (this.data.status_expertise === 'draft') {
            doc.save();
            doc.translate(300, 400);
            doc.rotate(-45);
            doc.fillColor('lightgray');
            doc.fontSize(60).text('DRAFT', { align: 'center' });
            doc.restore();
        }
    }

    // Helper methods
    formatDate(date) {
        return date ? moment(date).format('DD MMMM YYYY') : '-';
    }

    formatDateTime(date) {
        return date ? moment(date).format('DD MMMM YYYY HH:mm') : '-';
    }

    getJenisKelamin(jenis) {
        return jenis === 'L' ? 'Laki-laki' : jenis === 'P' ? 'Perempuan' : '-';
    }

    calculateAge(tanggalLahir) {
        if (!tanggalLahir) return '-';
        const today = moment();
        const birth = moment(tanggalLahir);
        const years = today.diff(birth, 'years');
        const months = today.diff(birth, 'months') % 12;
        return `${years} tahun ${months} bulan`;
    }

    getDiagnosa(diagnosa) {
        if (!diagnosa) return '-';
        if (typeof diagnosa === 'string') return diagnosa;
        if (Array.isArray(diagnosa)) {
            return diagnosa.map(d => d.nama_diagnosa || d).join(', ');
        }
        return '-';
    }

    getUrgencyLevel(level) {
        const levels = {
            'routine': 'Routine',
            'urgent': 'Urgent',
            'critical': 'Critical'
        };
        return levels[level] || level || '-';
    }

    getModality(testName) {
        if (!testName) return '-';
        const name = testName.toLowerCase();
        if (name.includes('x-ray') || name.includes('rontgen')) return 'X-Ray';
        if (name.includes('ct')) return 'CT Scan';
        if (name.includes('mri')) return 'MRI';
        if (name.includes('usg') || name.includes('ultrasound')) return 'Ultrasound';
        return testName;
    }

    getStatusText(status) {
        const statuses = {
            'draft': 'Draft',
            'final': 'Final',
            'revised': 'Revised',
            'second_opinion': 'Second Opinion'
        };
        return statuses[status] || status || '-';
    }

    getUrgencyText(urgency) {
        const urgencies = {
            'routine': 'Routine',
            'urgent': 'Urgent',
            'critical': 'Critical (Emergency)'
        };
        return urgencies[urgency] || urgency || '-';
    }

    getReportTypeText(type) {
        const types = {
            'preliminary': 'Preliminary',
            'final': 'Final',
            'addendum': 'Addendum'
        };
        return types[type] || type || '-';
    }
}

module.exports = RadiologyExpertisePDF;