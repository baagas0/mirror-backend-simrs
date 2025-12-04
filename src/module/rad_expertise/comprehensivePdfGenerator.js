const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

class ComprehensiveRadiologyPDF {
    constructor(data, options = {}) {
        this.data = data;
        this.options = {
            includeImages: options.includeImages || false,
            includeTechnicalDetails: options.includeTechnicalDetails || true,
            includeComparison: options.includeComparison || true,
            language: options.language || 'id',
            ...options
        };
        this.fonts = {
            regular: 'Helvetica',
            bold: 'Helvetica-Bold',
            italic: 'Helvetica-Oblique'
        };
    }

    generatePDF() {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 40, bottom: 40, left: 40, right: 40 },
                    info: {
                        Title: 'Laporan Pemeriksaan Radiologi Lengkap',
                        Author: 'RSUD Buton Selatan',
                        Subject: `Comprehensive Radiology Report - ${this.data.nama_pasien}`,
                        Creator: 'Radiology Information System',
                        Producer: 'RSUD Buton Selatan',
                        CreationDate: new Date()
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
        // Header Rumah Sakit
        this.addHospitalHeader(doc);

        // Judul Laporan
        this.addReportTitle(doc);

        // Informasi Pasien
        this.addPatientInformation(doc);

        // Informasi Klinis
        this.addClinicalInformation(doc);

        // Detail Pemeriksaan
        this.addExaminationDetails(doc);

        // Parameter Teknis (opsional)
        if (this.options.includeTechnicalDetails) {
            this.addTechnicalParameters(doc);
        }

        // Hasil Pemeriksaan
        this.addExaminationResults(doc);

        // Temuan dan Interpretasi
        this.addFindingsAndInterpretation(doc);

        // Pengukuran (jika ada)
        if (this.data.measurements) {
            this.addMeasurements(doc);
        }

        // Perbandingan (jika ada)
        if (this.options.includeComparison && this.data.comparison_notes) {
            this.addComparisonNotes(doc);
        }

        // Kesimpulan
        this.addConclusions(doc);

        // Saran
        this.addRecommendations(doc);

        // Status dan Informasi Tambahan
        this.addStatusInformation(doc);

        // Tanda Tangan
        this.addSignatures(doc);

        // Footer
        this.addFooter(doc);

        doc.end();
    }

    addHospitalHeader(doc) {
        // Header untuk RSUD Buton Selatan
        doc.fontSize(12).font(this.fonts.bold).text('RUMAH SAKIT UMUM DAERAH', 50, 50, { align: 'center' });
        doc.fontSize(14).font(this.fonts.bold).text('BUTON SELATAN', 50, 65, { align: 'center' });
        doc.fontSize(10).font(this.fonts.regular).text('Jl. Pembangunan No. 1, Batauga, Kab. Buton Selatan', 50, 85, { align: 'center' });
        doc.text('Sulawesi Tenggara, Indonesia 93771', { align: 'center' });
        doc.text('Telepon: (0404) 123456 | Email: info@rsbutonselatan.go.id', { align: 'center' });

        // Garis pemisah
        doc.moveTo(50, 110).lineTo(545, 110).lineWidth(2).stroke();
        doc.moveTo(50, 115).lineTo(545, 115).lineWidth(0.5).stroke();
    }

    addReportTitle(doc) {
        doc.y = 130;
        doc.fontSize(16).font(this.fonts.bold).text('LAPORAN PEMERIKSAAN RADIOLOGI LENGKAP', { align: 'center' });
        doc.fontSize(12).font(this.fonts.italic).text('Comprehensive Radiology Examination Report', { align: 'center' });

        // Tanggal cetak
        doc.fontSize(10).font(this.fonts.regular).text(`Tanggal Cetak: ${moment().format('DD MMMM YYYY HH:mm:ss')}`, { align: 'center' });
    }

    addPatientInformation(doc) {
        doc.y = 170;
        doc.fontSize(12).font(this.fonts.bold).text('DATA PASIEN');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
        doc.y += 10;

        const patientData = [
            ['No. RM:', this.data.no_rm || '-'],
            ['Nama Lengkap:', this.data.nama_lengkap || '-'],
            ['Jenis Kelamin:', this.data.jenis_kelamin === 'L' ? 'Laki-laki' : this.data.jenis_kelamin === 'P' ? 'Perempuan' : '-'],
            ['Tanggal Lahir:', this.data.tgl_lahir ? moment(this.data.tgl_lahir).format('DD MMMM YYYY') : '-'],
            ['Umur:', this.data.umur || '-'],
            ['NIK:', this.data.nik || '-'],
            ['Alamat:', this.data.alamat_sekarang || '-'],
            ['No. HP:', this.data.no_hp || '-']
        ];

        this.drawTable(doc, patientData, 50, doc.y, [100, 445]);

        doc.y += 10;
    }

    addClinicalInformation(doc) {
        doc.fontSize(12).font(this.fonts.bold).text('INFORMASI KLINIS');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
        doc.y += 10;

        const clinicalData = [
            ['No. Registrasi:', this.data.registrasi_id || '-'],
            ['No. Antrian:', this.data.no_antrian || '-'],
            ['No. SEP:', this.data.no_sep || '-'],
            ['No. Rujukan:', this.data.no_rujukan || '-'],
            ['Dokter Pengirim:', this.data.nama_dokter_pengirim || '-'],
            ['Spesialisasi:', this.data.spesialisasi_pengirim || '-'],
            ['Tanggal Request:', this.data.tanggal_request ? moment(this.data.tanggal_request).format('DD MMMM YYYY HH:mm') : '-'],
            ['Tanggal Pemeriksaan:', this.data.tanggal_pemeriksaan ? moment(this.data.tanggal_pemeriksaan).format('DD MMMM YYYY HH:mm') : '-']
        ];

        this.drawTable(doc, clinicalData, 50, doc.y, [100, 445]);

        // Diagnosa Klinis
        if (this.data.diagnosa) {
            doc.y += 10;
            doc.fontSize(12).font(this.fonts.bold).text('DIAGNOSA KLINIS');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            if (Array.isArray(this.data.diagnosa)) {
                this.data.diagnosa.forEach((diagnosa, index) => {
                    doc.text(`${index + 1}. ${diagnosa.kode_icd || ''} - ${diagnosa.nama_diagnosa || diagnosa || '-'}`);
                });
            } else {
                doc.text(this.data.diagnosa);
            }
        }

        // Informasi Klinis
        if (this.data.klinis) {
            doc.y += 10;
            doc.fontSize(12).font(this.fonts.bold).text('INFORMASI KLINIS TAMBAHAN');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            doc.text(this.data.klinis);
        }

        doc.y += 10;
    }

    addExaminationDetails(doc) {
        doc.fontSize(12).font(this.fonts.bold).text('DETAIL PEMERIKSAAN');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
        doc.y += 10;

        const examinationData = [
            ['Jenis Pemeriksaan:', this.data.nama_rad_test || '-'],
            ['Keterangan Pemeriksaan:', this.data.keterangan_rad_test || '-'],
            ['Detail Spesifik:', this.data.keterangan_rad_test_list || '-'],
            ['Status CITO:', this.data.is_cito ? 'Ya' : 'Tidak'],
            ['Status Puasa:', this.data.is_puasa ? 'Ya' : 'Tidak'],
            ['Unit Penunjang:', this.data.nama_penunjang || '-']
        ];

        this.drawTable(doc, examinationData, 50, doc.y, [120, 425]);

        doc.y += 10;
    }

    addTechnicalParameters(doc) {
        if (this.data.proyeksi || this.data.kv || this.data.mas || this.data.ffd) {
            doc.fontSize(12).font(this.fonts.bold).text('PARAMETER TEKNIS RADIOGRAFI');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            const technicalData = [
                ['Proyeksi:', this.data.proyeksi || '-'],
                ['Tegangan (kV):', this.data.kv ? `${this.data.kv}` : '-'],
                ['Arus (mAs):', this.data.mas ? `${this.data.mas}` : '-'],
                ['FFD:', this.data.ffd ? `${this.data.ffd}` : '-'],
                ['BSF:', this.data.bsf ? `${this.data.bsf}` : '-'],
                ['INAK:', this.data.inak ? `${this.data.inak}` : '-'],
                ['Jumlah Penyinaran:', this.data.jumlah_penyinaran ? `${this.data.jumlah_penyinaran}` : '-'],
                ['Dosis Radiasi:', this.data.dosis_radiasi ? `${this.data.dosis_radiasi} mGy` : '-']
            ];

            this.drawTable(doc, technicalData, 50, doc.y, [150, 395]);

            doc.y += 10;
        }
    }

    addExaminationResults(doc) {
        if (this.data.hasil) {
            doc.fontSize(12).font(this.fonts.bold).text('HASIL PEMERIKSAAN');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            const resultLines = this.data.hasil.split('\n');
            resultLines.forEach(line => {
                if (line.trim()) {
                    doc.text(line.trim(), { indent: 10 });
                }
            });

            // Kesan
            if (this.data.kesan) {
                doc.y += 10;
                doc.fontSize(12).font(this.fonts.bold).text('KESAN');
                doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
                doc.y += 10;

                doc.fontSize(11).font(this.fonts.regular);
                doc.text(this.data.kesan, { indent: 10 });
            }
        }

        doc.y += 10;
    }

    addFindingsAndInterpretation(doc) {
        if (this.data.temuan) {
            doc.fontSize(12).font(this.fonts.bold).text('TEMUAN PEMERIKSAAN');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            const findingLines = this.data.temuan.split('\n');
            findingLines.forEach(line => {
                if (line.trim()) {
                    doc.text(line.trim(), { indent: 10 });
                }
            });

            // Additional Findings
            if (this.data.additional_findings) {
                doc.y += 10;
                doc.fontSize(11).font(this.fonts.bold).text('Temuan Tambahan:');
                doc.fontSize(10).font(this.fonts.regular);

                if (Array.isArray(this.data.additional_findings)) {
                    this.data.additional_findings.forEach(finding => {
                        doc.text(`• ${finding}`, { indent: 20 });
                    });
                } else {
                    doc.text(this.data.additional_findings, { indent: 20 });
                }
            }
        }

        doc.y += 10;
    }

    addMeasurements(doc) {
        if (this.data.measurements) {
            doc.fontSize(12).font(this.fonts.bold).text('PENGUKURAN');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);

            if (Array.isArray(this.data.measurements)) {
                this.data.measurements.forEach(measurement => {
                    doc.text(`• ${measurement.description || measurement}: ${measurement.value || ''}`, { indent: 10 });
                });
            } else if (typeof this.data.measurements === 'object') {
                Object.entries(this.data.measurements).forEach(([key, value]) => {
                    doc.text(`• ${key}: ${value}`, { indent: 10 });
                });
            } else {
                doc.text(this.data.measurements, { indent: 10 });
            }

            doc.y += 10;
        }
    }

    addComparisonNotes(doc) {
        if (this.data.comparison_notes) {
            doc.fontSize(12).font(this.fonts.bold).text('CATATAN PERBANDINGAN');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            doc.text(this.data.comparison_notes, { indent: 10 });

            doc.y += 10;
        }
    }

    addConclusions(doc) {
        if (this.data.kesimpulan) {
            doc.fontSize(12).font(this.fonts.bold).text('KESIMPULAN');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            const conclusionLines = this.data.kesimpulan.split('\n');
            conclusionLines.forEach(line => {
                if (line.trim()) {
                    doc.text(line.trim(), { indent: 10 });
                }
            });

            doc.y += 10;
        }
    }

    addRecommendations(doc) {
        const recommendations = this.data.saran || this.data.saran_expertise;
        if (recommendations) {
            doc.fontSize(12).font(this.fonts.bold).text('SARAN/REKOMENDASI');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            doc.fontSize(11).font(this.fonts.regular);
            const recommendationLines = recommendations.split('\n');
            recommendationLines.forEach(line => {
                if (line.trim()) {
                    doc.text(line.trim(), { indent: 10 });
                }
            });

            doc.y += 10;
        }
    }

    addStatusInformation(doc) {
        doc.fontSize(12).font(this.fonts.bold).text('INFORMASI STATUS');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
        doc.y += 10;

        const statusData = [
            ['Status Laporan:', this.data.status_expertise ? this.formatStatus(this.data.status_expertise) : '-'],
            ['Tingkat Urgensi:', this.data.urgency_level ? this.formatUrgency(this.data.urgency_level) : '-'],
            ['Tipe Laporan:', this.data.report_type || '-'],
            ['Temuan Kritis:', this.data.critical_findings ? 'Ya' : 'Tidak'],
            ['Versi Laporan:', this.data.version ? `V${this.data.version}` : '-'],
            ['Waktu Penyelesaian:', this.data.report_completion_time ? `${this.data.report_completion_time} menit` : '-'],
            ['Dibuat pada:', this.data.expertise_created_at ? moment(this.data.expertise_created_at).format('DD MMMM YYYY HH:mm') : '-']
        ];

        this.drawTable(doc, statusData, 50, doc.y, [120, 425]);

        // Peer Review Information
        if (this.data.nama_peer_reviewer) {
            doc.y += 10;
            doc.fontSize(12).font(this.fonts.bold).text('INFORMASI PEER REVIEW');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
            doc.y += 10;

            const peerReviewData = [
                ['Peer Reviewer:', this.data.nama_peer_reviewer],
                ['Spesialisasi:', this.data.spesialisasi_peer_reviewer || '-'],
                ['Status Review:', this.data.peer_review_status || '-']
            ];

            this.drawTable(doc, peerReviewData, 50, doc.y, [100, 445]);

            if (this.data.peer_review_notes) {
                doc.y += 10;
                doc.fontSize(11).font(this.fonts.bold).text('Catatan Peer Review:');
                doc.fontSize(10).font(this.fonts.regular).text(this.data.peer_review_notes, { indent: 10 });
            }
        }

        doc.y += 10;
    }

    addSignatures(doc) {
        // Check if we need a new page for signatures
        if (doc.y > 650) {
            doc.addPage();
            doc.y = 50;
        }

        doc.fontSize(12).font(this.fonts.bold).text('TANDA TANGAN');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
        doc.y += 20;

        const signatureY = doc.y;

        // Referring Doctor Signature
        doc.fontSize(10).font(this.fonts.regular);
        doc.text('Dokter Pengirim', 80, signatureY, { width: 150, align: 'center' });
        doc.y = signatureY + 50;
        doc.text(`Dr. ${this.data.nama_dokter_pengirim || '-'}`, 80, doc.y, { width: 150, align: 'center' });
        doc.text(this.data.spesialisasi_pengirim || '-', 80, doc.y + 15, { width: 150, align: 'center' });

        // Radiologist Signature
        doc.y = signatureY + 50;
        doc.text('Radiolog', 225, signatureY, { width: 150, align: 'center' });
        doc.text(`Dr. ${this.data.nama_radiolog || '-'}`, 225, doc.y, { width: 150, align: 'center' });
        doc.text(this.data.spesialisasi_radiolog || '-', 225, doc.y + 15, { width: 150, align: 'center' });

        // Date and Location
        doc.y += 60;
        const currentLocation = 'Batauga, ' + moment().format('DD MMMM YYYY');
        doc.text(currentLocation, { align: 'right' });
    }

    addFooter(doc) {
        // Add page number
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(9).font(this.fonts.regular)
               .text(`Halaman ${i + 1} dari ${pageCount}`, 50, doc.page.height - 30, { align: 'center' });

            // Footer text
            doc.text('Dokumen ini adalah rahasia medis dan dilindungi oleh undang-undang', { align: 'center' });
        }
    }

    // Helper methods
    drawTable(doc, data, startX, startY, columnWidths) {
        const rowHeight = 20;
        const tableHeight = data.length * rowHeight;

        // Save current position
        const originalY = doc.y;
        doc.y = startY;

        data.forEach((row, index) => {
            const currentY = startY + (index * rowHeight);
            let currentX = startX;

            row.forEach((cell, cellIndex) => {
                const cellWidth = columnWidths[cellIndex];
                const cellHeight = rowHeight;

                // Draw cell border
                doc.rect(currentX, currentY, cellWidth, cellHeight).lineWidth(0.5).stroke();

                // Add text
                doc.fontSize(10).font(this.fonts.regular);
                const textX = currentX + 5;
                const textY = currentY + (cellHeight / 2) - 5;
                doc.text(cell || '', textX, textY, { width: cellWidth - 10 });

                currentX += cellWidth;
            });
        });

        // Restore position
        doc.y = originalY + tableHeight + 5;
    }

    formatStatus(status) {
        const statusMap = {
            'draft': 'Draft',
            'final': 'Final',
            'revised': 'Revisi',
            'second_opinion': 'Second Opinion'
        };
        return statusMap[status] || status;
    }

    formatUrgency(urgency) {
        const urgencyMap = {
            'routine': 'Routine',
            'urgent': 'Urgent',
            'critical': 'Critical'
        };
        return urgencyMap[urgency] || urgency;
    }
}

module.exports = ComprehensiveRadiologyPDF;