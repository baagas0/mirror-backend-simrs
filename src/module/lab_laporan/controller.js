const labHasil = require('../lab_hasil/model');
const labRegis = require('../lab_regis/model');
const labPaket = require('../lab_paket/model');
const penunjang = require('../penunjang/model');
const registrasi = require('../registrasi/model');
const pasien = require('../pasien/model');
const msDokter = require('../ms_dokter/model');
const { sq } = require('../../config/connection');
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePdfReport = (data, type) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 40, right: 40 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Header
            doc.fontSize(16).text('LAPORAN HASIL PEMERIKSAAN LABORATORIUM', { align: 'center' });
            doc.fontSize(12).text('RUMAH SAKIT UMUM DAERAH BUTON SELATAN', { align: 'center' });
            doc.fontSize(10).text('Jl. Menui, Kelurahan Bombonawulu, Kec. North Buton', { align: 'center' });

            // Garis pemisah
            doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            if (type === 'detail' && data.length > 0) {
                // Format detail laporan
                const item = data[0];

                // Informasi Pasien
                doc.fontSize(12).text('DATA PASIEN', { underline: true });
                doc.fontSize(10);

                const patientInfo = [
                    ['No. RM', item.registrasi?.no_rm || '-'],
                    ['Nama Lengkap', item.registrasi?.nama_lengkap || '-'],
                    ['Jenis Kelamin', item.registrasi?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
                    ['Tanggal Lahir', item.registrasi?.tgl_lahir ? new Date(item.registrasi.tgl_lahir).toLocaleDateString('id-ID') : '-'],
                    ['Umur', item.registrasi?.tgl_lahir ? hitungUmur(item.registrasi.tgl_lahir) : '-']
                ];

                patientInfo.forEach(([label, value]) => {
                    doc.text(`${label}: ${value}`);
                });

                doc.moveDown();

                // Informasi Pemeriksaan
                doc.fontSize(12).text('INFORMASI PEMERIKSAAN', { underline: true });
                doc.fontSize(10);

                const examInfo = [
                    ['Dokter Pengirim', item.registrasi?.nama_dokter || '-'],
                    ['Tanggal Registrasi', item.registrasi?.tgl_registrasi ? new Date(item.registrasi.tgl_registrasi).toLocaleDateString('id-ID') : '-'],
                    ['Tanggal Permintaan', item.registrasi?.tanggal_request ? new Date(item.registrasi.tanggal_request).toLocaleDateString('id-ID') : '-'],
                    ['Tanggal Ambil Sampel', item.registrasi?.tanggal_ambil_sampel ? new Date(item.registrasi.tanggal_ambil_sampel).toLocaleDateString('id-ID') : '-']
                ];

                examInfo.forEach(([label, value]) => {
                    doc.text(`${label}: ${value}`);
                });

                // Keterangan tambahan
                if (item.registrasi?.is_cito || item.registrasi?.is_puasa || item.registrasi?.klinis || item.registrasi?.diagnosa) {
                    doc.moveDown();
                    doc.fontSize(12).text('KETERANGAN TAMBAHAN', { underline: true });
                    doc.fontSize(10);

                    if (item.registrasi?.is_cito) {
                        doc.text(`• CITO: Ya`);
                    }
                    if (item.registrasi?.is_puasa) {
                        doc.text(`• Puasa: Ya`);
                    }
                    if (item.registrasi?.klinis) {
                        doc.text(`• Klinis: ${item.registrasi.klinis}`);
                    }
                    if (item.registrasi?.diagnosa) {
                        doc.text(`• Diagnosa: ${item.registrasi.diagnosa.map(d => d.nama_diagnosa).join(', ')}`);
                    }
                }

                doc.moveDown();

                // Hasil Pemeriksaan
                doc.fontSize(12).text('HASIL PEMERIKSAAN', { underline: true });
                doc.fontSize(10);

                let currentPaket = '';
                if (item.hasil && item.hasil.length > 0) {
                    for (const hasil of item.hasil) {
                        if (hasil.nama_paket !== currentPaket) {
                            if (currentPaket !== '') {
                                doc.moveDown(0.25);
                            }
                            currentPaket = hasil.nama_paket;
                            doc.fontSize(11).text(`${currentPaket.toUpperCase()}`, { underline: true });
                            doc.fontSize(10);
                        }

                        // Tabel hasil pemeriksaan dengan format lebih rapi
                        const startY = doc.y;
                        doc.text(`${hasil.nama_penunjang || hasil.nama_jenis_pemeriksaan || '-'}`, 40, startY);
                        doc.text(`: ${hasil.hasil || '-'} ${hasil.satuan || ''}`, 200, startY);

                        if (hasil.parameter_normal) {
                            doc.text(`Normal`, 40, doc.y);
                            doc.text(`: ${hasil.parameter_normal}`, 200, doc.y);
                        }

                        // Status dengan indikator visual
                        const statusY = doc.y + 5;
                        doc.text('Status', 40, statusY);
                        doc.text(`: ${hasil.hasil ? (hasil.is_normal ? 'Normal' : 'Abnormal') : '-'}`, 200, statusY);

                        // Garis pemisah untuk setiap item
                        doc.moveTo(40, doc.y + 10).lineTo(550, doc.y + 10).stroke();
                        doc.moveDown(1.5);
                    }
                } else {
                    doc.text('Belum ada hasil pemeriksaan');
                }

            } else if (type === 'list') {
                // Format daftar laporan
                doc.fontSize(12).text('DAFTAR PEMERIKSAAN LABORATORIUM', { underline: true });
                doc.moveDown();

                if (data && data.length > 0) {
                    // Header tabel
                    doc.fontSize(10).font('Helvetica-Bold');
                    doc.text('No', 40, doc.y);
                    doc.text('Nama Pasien', 70, doc.y - 12);
                    doc.text('No. RM', 200, doc.y - 12);
                    doc.text('Tgl. Permintaan', 280, doc.y - 12);
                    doc.text('Dokter', 380, doc.y - 12);
                    doc.text('Status', 480, doc.y - 12);
                    doc.font('Helvetica').moveDown();

                    // Garis header
                    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown(0.3);

                    data.forEach((item, index) => {
                        if (doc.y > 700) {
                            doc.addPage();
                            // Ulangi header di halaman baru
                            doc.fontSize(10).font('Helvetica-Bold');
                            doc.text('No', 40, doc.y);
                            doc.text('Nama Pasien', 70, doc.y - 12);
                            doc.text('No. RM', 200, doc.y - 12);
                            doc.text('Tgl. Permintaan', 280, doc.y - 12);
                            doc.text('Dokter', 380, doc.y - 12);
                            doc.text('Status', 480, doc.y - 12);
                            doc.font('Helvetica').moveDown();
                            doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                            doc.moveDown(0.3);
                        }

                        doc.fontSize(9);
                        const y = doc.y;
                        doc.text(`${index + 1}`, 40, y);
                        doc.text(`${item.registrasi?.nama_lengkap || '-'}`, 70, y);
                        doc.text(`${item.registrasi?.no_rm || '-'}`, 200, y);
                        doc.text(`${item.registrasi?.tanggal_request ? new Date(item.registrasi.tanggal_request).toLocaleDateString('id-ID') : '-'}`, 280, y);
                        doc.text(`${item.registrasi?.nama_dokter || '-'}`, 380, y);

                        // Status dengan warna
                        const statusText = item.registrasi?.status === 3 ? 'Selesai' : 'Dalam Proses';
                        doc.text(statusText, 480, y);

                        doc.moveDown(0.5);
                    });
                } else {
                    doc.text('Tidak ada data laporan');
                }
            }

            // Footer dengan tanda tangan
            doc.moveTo(40, 650).lineTo(550, 650).stroke();
            doc.moveDown(2);

            if (type === 'detail') {
                // Tanda tangan untuk laporan detail
                doc.fontSize(9);
                const signatureY = doc.y;

                // Dokter pemeriksa
                doc.text('Dokter Pemeriksa', 80, signatureY);
                doc.text('Petugas Laboratorium', 320, signatureY);

                doc.moveDown(3);

                doc.text('_________________', 80, doc.y);
                doc.text('_________________', 320, doc.y);

                doc.moveDown(0.5);
                doc.text('(NIP. __________________)', 80, doc.y);
                doc.text('(NIP. __________________)', 320, doc.y);

                doc.moveDown(2);
            }

            // Footer info
            doc.moveTo(40, 750).lineTo(550, 750).stroke();
            doc.fontSize(8);
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Halaman ${doc?.page?.number ? doc.page.number : 1}`, { align: 'center' });
            doc.moveDown(0.2);
            doc.text('Laporan ini bersifat rahasia dan hanya untuk kepentingan medis', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// Helper function untuk menghitung umur
const hitungUmur = (tanggalLahir) => {
    const today = new Date();
    const birthDate = new Date(tanggalLahir);
    let umur = today.getFullYear() - birthDate.getFullYear();
    const bulan = today.getMonth() - birthDate.getMonth();

    if (bulan < 0 || (bulan === 0 && today.getDate() < birthDate.getDate())) {
        umur--;
    }

    return `${umur} Tahun`;
}

// Helper function untuk menghitung selisih waktu dalam menit
const hitungSelisihWaktu = (waktuMulai, waktuSelesai) => {
    if (!waktuMulai || !waktuSelesai) return null;

    const mulai = new Date(waktuMulai);
    const selesai = new Date(waktuSelesai);
    const selisihMs = selesai - mulai;

    if (selisihMs < 0) return null;

    const menit = Math.floor(selisihMs / (1000 * 60));
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;

    return {
        totalMenit: menit,
        jam: jam,
        menit: sisaMenit,
        formatted: jam > 0 ? `${jam}j ${sisaMenit}m` : `${menit}m`
    };
}

// Generate PDF untuk laporan pembatalan
const generatePembatalanPdf = (data, statistik, filter) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 40, right: 40 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Header
            doc.fontSize(16).text('LAPORAN PEMBATALAN PEMERIKSAAN LABORATORIUM', { align: 'center' });
            doc.fontSize(12).text('RUMAH SAKIT UMUM DAERAH BUTON SELATAN', { align: 'center' });
            doc.fontSize(10).text('Jl. Menui, Kelurahan Bombonawulu, Kec. North Buton', { align: 'center' });

            // Garis pemisah
            doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Periode filter
            doc.fontSize(10);
            if (filter.startDate && filter.endDate) {
                doc.text(`Periode Pembatalan: ${new Date(filter.startDate).toLocaleDateString('id-ID')} - ${new Date(filter.endDate).toLocaleDateString('id-ID')}`);
            }
            if (filter.alasan_batal) {
                doc.text(`Filter Alasan: ${filter.alasan_batal}`);
            }
            if (filter.user_batal) {
                doc.text(`User Pembatal: ${filter.user_batal}`);
            }
            doc.moveDown();

            // Statistik Ringkasan
            doc.fontSize(12).text('RINGKASAN STATISTIK PEMBATALAN', { underline: true });
            doc.fontSize(10);

            const statsData = [
                ['Total Pembatalan', statistik.total_pembatalan || 0],
                ['CITO Dibatalkan', statistik.total_cito_dibatalkan || 0],
                ['Batal dari Status Baru', statistik.total_batal_dari_new || 0],
                ['Batal dari Status Proses', statistik.total_batal_dari_proses || 0],
                ['Batal dari Status Sampel Diambil', statistik.total_batal_dari_sampel_diambil || 0],
                ['Batal dari Status Selesai', statistik.total_batal_dari_selesai || 0],
                ['Rata-rata Waktu Sebelum Batal', `${Math.round(statistik.rata_waktu_sebelum_batal || 0)} menit`]
            ];

            statsData.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });

            // Statistik berdasarkan alasan
            doc.moveDown(0.5);
            doc.fontSize(11).text('PEMBATALAN BERDASARKAN ALASAN:', { underline: true });
            doc.fontSize(10);

            const alasanStats = [
                ['Karena Pasien', statistik.total_batal_karena_pasien || 0],
                ['Karena Alat/Equipment', statistik.total_batal_karena_alat || 0],
                ['Karena Sampel', statistik.total_batal_karena_sampel || 0]
            ];

            alasanStats.forEach(([label, value]) => {
                doc.text(`  • ${label}: ${value}`);
            });

            // Statistik berdasarkan hari
            doc.moveDown(0.5);
            doc.fontSize(11).text('DISTRIBUSI PEMBATALAN PER HARI:', { underline: true });
            doc.fontSize(10);

            const hariStats = [
                ['Minggu', statistik.pembatalan_minggu || 0],
                ['Senin', statistik.pembatalan_senin || 0],
                ['Selasa', statistik.pembatalan_selasa || 0],
                ['Rabu', statistik.pembatalan_rabu || 0],
                ['Kamis', statistik.pembatalan_kamis || 0],
                ['Jumat', statistik.pembatalan_jumat || 0],
                ['Sabtu', statistik.pembatalan_sabtu || 0]
            ];

            hariStats.forEach(([label, value]) => {
                doc.text(`  • ${label}: ${value}`);
            });

            doc.moveDown();

            // Tabel Data Detail
            doc.fontSize(12).text('DATA DETAIL PEMBATALAN', { underline: true });
            doc.moveDown();

            if (data && data.length > 0) {
                // Header tabel
                doc.fontSize(7).font('Helvetica-Bold');
                doc.text('No', 40, doc.y);
                doc.text('Tgl Batal', 60, doc.y - 7);
                doc.text('No. RM', 110, doc.y - 7);
                doc.text('Nama Pasien', 150, doc.y - 7);
                doc.text('Paket', 240, doc.y - 7);
                doc.text('Status', 320, doc.y - 7);
                doc.text('CITO', 360, doc.y - 7);
                doc.text('Waktu', 390, doc.y - 7);
                doc.text('Alasan', 430, doc.y - 7);
                doc.text('User', 500, doc.y - 7);
                doc.font('Helvetica').moveDown();

                // Garis header
                doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.3);

                data.forEach((item, index) => {
                    if (doc.y > 700) {
                        doc.addPage();
                        // Ulangi header di halaman baru
                        doc.fontSize(7).font('Helvetica-Bold');
                        doc.text('No', 40, doc.y);
                        doc.text('Tgl Batal', 60, doc.y - 7);
                        doc.text('No. RM', 110, doc.y - 7);
                        doc.text('Nama Pasien', 150, doc.y - 7);
                        doc.text('Paket', 240, doc.y - 7);
                        doc.text('Status', 320, doc.y - 7);
                        doc.text('CITO', 360, doc.y - 7);
                        doc.text('Waktu', 390, doc.y - 7);
                        doc.text('Alasan', 430, doc.y - 7);
                        doc.text('User', 500, doc.y - 7);
                        doc.font('Helvetica').moveDown();
                        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                        doc.moveDown(0.3);
                    }

                    doc.fontSize(6);
                    const y = doc.y;

                    // No dan Tanggal Batal
                    doc.text(`${index + 1}`, 40, y);
                    doc.text(item.tanggal_hapus ? new Date(item.tanggal_hapus).toLocaleDateString('id-ID') : '-', 60, y);

                    // No. RM
                    doc.text(`${item.no_rm || '-'}`, 110, y);

                    // Nama Pasien (truncate)
                    const nama = item.nama_lengkap || '-';
                    doc.text(nama.length > 15 ? nama.substring(0, 15) + '...' : nama, 150, y);

                    // Paket (truncate)
                    const paket = item.nama_paket || '-';
                    doc.text(paket.length > 20 ? paket.substring(0, 20) + '...' : paket, 240, y);

                    // Status sebelum dibatalkan
                    const statusText = item.status_sebelum_batal_text || '-';
                    doc.text(statusText, 320, y);

                    // CITO dengan warna
                    if (item.is_cito) {
                        doc.fillColor('red').text('YA', 360, y).fillColor('black');
                    } else {
                        doc.text('TIDAK', 360, y);
                    }

                    // Waktu sebelum pembatalan
                    const waktuRequestBatal = item.waktu_request_batal;
                    doc.text(waktuRequestBatal ? waktuRequestBatal.formatted : '-', 390, y);

                    // Alasan pembatalan (truncate)
                    const alasan = item.alasan_pembatalan || '-';
                    doc.text(alasan.length > 25 ? alasan.substring(0, 25) + '...' : alasan, 430, y);

                    // User pembatal
                    const user = item.user_batal || '-';
                    doc.text(user.length > 10 ? user.substring(0, 10) + '...' : user, 500, y);

                    doc.moveDown(0.4);
                });
            } else {
                doc.text('Tidak ada data pembatalan');
            }

            // Footer
            doc.moveTo(40, 750).lineTo(550, 750).stroke();
            doc.fontSize(8);
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Halaman ${doc?.page?.number ? doc.page.number : 1}`, { align: 'center' });
            doc.moveDown(0.2);
            doc.text('Laporan ini bersifat rahasia dan hanya untuk kepentingan medis', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// Generate PDF untuk laporan waktu tunggu
const generateWaktuTungguPdf = (data, statistik, filter) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 40, right: 40 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Header
            doc.fontSize(16).text('LAPORAN WAKTU TUNGGU LABORATORIUM', { align: 'center' });
            doc.fontSize(12).text('RUMAH SAKIT UMUM DAERAH BUTON SELATAN', { align: 'center' });
            doc.fontSize(10).text('Jl. Menui, Kelurahan Bombonawulu, Kec. North Buton', { align: 'center' });

            // Garis pemisah
            doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Periode filter
            doc.fontSize(10);
            if (filter.startDate && filter.endDate) {
                doc.text(`Periode: ${new Date(filter.startDate).toLocaleDateString('id-ID')} - ${new Date(filter.endDate).toLocaleDateString('id-ID')}`);
            }
            if (filter.status !== undefined && filter.status !== '') {
                const statusText = filter.status == 0 ? 'Baru' :
                                 filter.status == 1 ? 'Proses' :
                                 filter.status == 2 ? 'Sampel Diambil' :
                                 filter.status == 3 ? 'Selesai' : 'Semua Status';
                doc.text(`Status: ${statusText}`);
            }
            if (filter.is_cito !== undefined && filter.is_cito !== '') {
                doc.text(`CITO: ${filter.is_cito ? 'Ya' : 'Tidak'}`);
            }
            doc.moveDown();

            // Statistik Ringkasan
            doc.fontSize(12).text('RINGKASAN STATISTIK', { underline: true });
            doc.fontSize(10);

            const statsData = [
                ['Total Data', statistik.total_data || 0],
                ['Selesai', statistik.total_selesai || 0],
                ['CITO', statistik.total_cito || 0],
                ['Rata-rata Waktu (Request → Ambil)', `${Math.round(statistik.rata_request_ambil || 0)} menit`],
                ['Rata-rata Waktu Total', `${Math.round(statistik.rata_total || 0)} menit`],
                ['Waktu Maksimum', `${Math.round(statistik.max_total || 0)} menit`],
                ['Waktu Minimum', `${Math.round(statistik.min_total || 0)} menit`]
            ];

            statsData.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });

            doc.moveDown();

            // Tabel Data Detail
            doc.fontSize(12).text('DATA DETAIL WAKTU TUNGGU', { underline: true });
            doc.moveDown();

            if (data && data.length > 0) {
                // Header tabel
                doc.fontSize(8).font('Helvetica-Bold');
                doc.text('No', 40, doc.y);
                doc.text('No. RM', 65, doc.y - 8);
                doc.text('Nama Pasien', 110, doc.y - 8);
                doc.text('Request', 210, doc.y - 8);
                doc.text('Ambil', 270, doc.y - 8);
                doc.text('Total', 330, doc.y - 8);
                doc.text('Status', 380, doc.y - 8);
                doc.text('CITO', 450, doc.y - 8);
                doc.text('Dokter', 490, doc.y - 8);
                doc.font('Helvetica').moveDown();

                // Garis header
                doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.3);

                data.forEach((item, index) => {
                    if (doc.y > 700) {
                        doc.addPage();
                        // Ulangi header di halaman baru
                        doc.fontSize(8).font('Helvetica-Bold');
                        doc.text('No', 40, doc.y);
                        doc.text('No. RM', 65, doc.y - 8);
                        doc.text('Nama Pasien', 110, doc.y - 8);
                        doc.text('Request', 210, doc.y - 8);
                        doc.text('Ambil', 270, doc.y - 8);
                        doc.text('Total', 330, doc.y - 8);
                        doc.text('Status', 380, doc.y - 8);
                        doc.text('CITO', 450, doc.y - 8);
                        doc.text('Dokter', 490, doc.y - 8);
                        doc.font('Helvetica').moveDown();
                        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                        doc.moveDown(0.3);
                    }

                    doc.fontSize(7);
                    const y = doc.y;

                    // No dan RM
                    doc.text(`${index + 1}`, 40, y);
                    doc.text(`${item.no_rm || '-'}`, 65, y);

                    // Nama Pasien (truncate jika terlalu panjang)
                    const nama = item.nama_lengkap || '-';
                    doc.text(nama.length > 25 ? nama.substring(0, 25) + '...' : nama, 110, y);

                    // Waktu Request → Ambil
                    const waktuRequestAmbil = item.waktu_request_ambil;
                    doc.text(waktuRequestAmbil ? waktuRequestAmbil.formatted : '-', 210, y);

                    // Waktu Ambil → Selesai (hitung berdasarkan status)
                    let waktuAmbilSelesai = null;
                    if (item.tanggal_ambil_sampel && item.status === 3) {
                        waktuAmbilSelesai = hitungSelisihWaktu(item.tanggal_ambil_sampel, new Date());
                    }
                    doc.text(waktuAmbilSelesai ? waktuAmbilSelesai.formatted : '-', 270, y);

                    // Total waktu
                    const waktuTotal = item.waktu_total;
                    doc.text(waktuTotal ? waktuTotal.formatted : '-', 330, y);

                    // Status dengan warna indikator
                    const statusText = item.status_text || '-';
                    if (item.status === 3) {
                        doc.fillColor('green').text(statusText, 380, y).fillColor('black');
                    } else if (item.is_cito) {
                        doc.fillColor('red').text(statusText, 380, y).fillColor('black');
                    } else {
                        doc.text(statusText, 380, y);
                    }

                    // CITO
                    doc.text(item.is_cito ? 'YA' : 'TIDAK', 450, y);

                    // Dokter (truncate jika terlalu panjang)
                    const dokter = item.nama_dokter || '-';
                    doc.text(dokter.length > 15 ? dokter.substring(0, 15) + '...' : dokter, 490, y);

                    doc.moveDown(0.4);
                });
            } else {
                doc.text('Tidak ada data laporan waktu tunggu');
            }

            // Footer
            doc.moveTo(40, 750).lineTo(550, 750).stroke();
            doc.fontSize(8);
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Halaman ${doc?.page?.number ? doc.page.number : 1}`, { align: 'center' });
            doc.moveDown(0.2);
            doc.text('Laporan ini bersifat rahasia dan hanya untuk kepentingan medis', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// Query untuk laporan pembatalan
const getPembatalanData = async (payload) => {
    const { page, perPage, search, startDate, endDate, alasan_batal, user_batal } = payload;

    let param = '';
    let paramCount = '';

    // Filter berdasarkan rentang tanggal pembatalan
    if (startDate && endDate) {
        param += ` AND DATE(lr."deletedAt") BETWEEN '${startDate}' AND '${endDate}'`;
        paramCount += ` AND DATE(lr."deletedAt") BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Filter berdasarkan alasan pembatalan
    if (alasan_batal) {
        param += ` AND lr.alasan_pembatalan ILIKE '%${alasan_batal}%'`;
        paramCount += ` AND lr.alasan_pembatalan ILIKE '%${alasan_batal}%'`;
    }

    // Filter berdasarkan user yang membatalkan
    if (user_batal) {
        param += ` AND lr.user_batal ILIKE '%${user_batal}%'`;
        paramCount += ` AND lr.user_batal ILIKE '%${user_batal}%'`;
    }

    // Search berdasarkan nama pasien atau no RM
    if (search) {
        param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%')`;
        paramCount += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%')`;
    }

    try {
        // Query utama untuk data laporan pembatalan
        let data = await sq.query(`
            SELECT
                lr.id as lab_regis_id,
                lr.tanggal_request,
                lr.tanggal_ambil_sampel,
                lr.status as status_sebelum_batal,
                lr.is_cito,
                lr.alasan_pembatalan,
                lr.user_batal,
                lr.tanggal_batal,
                lr."deletedAt" as tanggal_hapus,
                r.tgl_registrasi,
                p.no_rm,
                p.nama_lengkap,
                p.jenis_kelamin,
                p.tgl_lahir,
                d.nama_dokter,
                -- Hitung waktu dari request ke pembatalan
                CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr."deletedAt" IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (lr."deletedAt" - lr.tanggal_request)) / 60
                    ELSE NULL
                END as menit_request_batal,
                -- Hitung waktu dari pengambilan sampel ke pembatalan (jika ada)
                CASE
                    WHEN lr.tanggal_ambil_sampel IS NOT NULL AND lr."deletedAt" IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (lr."deletedAt" - lr.tanggal_ambil_sampel)) / 60
                    ELSE NULL
                END as menit_ambil_batal,
                -- Ekstrak nama paket dari JSON
                CASE
                    WHEN lr.list_lab_paket IS NOT NULL THEN
                        (SELECT array_to_string(array_agg(lp.nama_lab_paket), ', ')
                         FROM json_array_elements(lr.list_lab_paket) as paket
                         LEFT JOIN lab_paket lp ON lp.id = (paket->>'id_lab_paket'))
                    ELSE NULL
                END as nama_paket
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            LEFT JOIN ms_dokter d ON d.id = lr.dokter_id
            WHERE lr."deletedAt" IS NOT NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${param}
            ORDER BY lr."deletedAt" DESC
            LIMIT ${perPage || 10} OFFSET ${((page || 1) - 1) * (perPage || 10)}
        `, s);

        // Query untuk total count
        let countData = await sq.query(`
            SELECT COUNT(DISTINCT lr.id) as total
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            WHERE lr."deletedAt" IS NOT NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${paramCount}
        `, s);

        // Query untuk statistik pembatalan
        let statistik = await sq.query(`
            SELECT
                COUNT(*) as total_pembatalan,
                COUNT(CASE WHEN lr.is_cito = true THEN 1 END) as total_cito_dibatalkan,
                COUNT(CASE WHEN lr.status = 0 THEN 1 END) as total_batal_dari_new,
                COUNT(CASE WHEN lr.status = 1 THEN 1 END) as total_batal_dari_proses,
                COUNT(CASE WHEN lr.status = 2 THEN 1 END) as total_batal_dari_sampel_diambil,
                COUNT(CASE WHEN lr.status = 3 THEN 1 END) as total_batal_dari_selesai,
                -- Statistik berdasarkan alasan pembatalan
                COUNT(CASE WHEN lr.alasan_pembatalan ILIKE '%pasien%' THEN 1 END) as total_batal_karena_pasien,
                COUNT(CASE WHEN lr.alasan_pembatalan ILIKE '%alat%' OR lr.alasan_pembatalan ILIKE '%equipment%' THEN 1 END) as total_batal_karena_alat,
                COUNT(CASE WHEN lr.alasan_pembatalan ILIKE '%sampel%' THEN 1 END) as total_batal_karena_sampel,
                -- Rata-rata waktu sebelum pembatalan
                AVG(CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr."deletedAt" IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (lr."deletedAt" - lr.tanggal_request)) / 60
                    ELSE NULL
                END) as rata_waktu_sebelum_batal,
                -- Pembatalan per hari dalam seminggu
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 0 THEN 1 END) as pembatalan_minggu,
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 1 THEN 1 END) as pembatalan_senin,
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 2 THEN 1 END) as pembatalan_selasa,
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 3 THEN 1 END) as pembatalan_rabu,
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 4 THEN 1 END) as pembatalan_kamis,
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 5 THEN 1 END) as pembatalan_jumat,
                COUNT(CASE WHEN EXTRACT(DOW FROM lr."deletedAt") = 6 THEN 1 END) as pembatalan_sabtu
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            WHERE lr."deletedAt" IS NOT NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${param}
        `, s);

        const total = countData[0]?.total || 0;

        // Format data dengan perhitungan waktu
        const formattedData = data.map(item => {
            const waktuRequestBatal = hitungSelisihWaktu(item.tanggal_request, item.tanggal_hapus);
            const waktuAmbilBatal = hitungSelisihWaktu(item.tanggal_ambil_sampel, item.tanggal_hapus);

            return {
                ...item,
                waktu_request_batal: waktuRequestBatal,
                waktu_ambil_batal: waktuAmbilBatal,
                status_sebelum_batal_text: item.status_sebelum_batal === 0 ? 'Baru' :
                                        item.status_sebelum_batal === 1 ? 'Proses' :
                                        item.status_sebelum_batal === 2 ? 'Sampel Diambil' :
                                        item.status_sebelum_batal === 3 ? 'Selesai' : 'Tidak Diketahui'
            };
        });

        return {
            status: 200,
            message: "sukses",
            data: formattedData,
            statistik: statistik[0] || {},
            pagination: {
                page: page || 1,
                perPage: perPage || 10,
                total,
                totalPages: Math.ceil(total / (perPage || 10))
            }
        };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "gagal", data: error };
    }
}

// Query untuk laporan waktu tunggu
const getWaktuTungguData = async (payload) => {
    const { page, perPage, search, startDate, endDate, status, is_cito } = payload;

    let param = '';
    let paramCount = '';

    // Filter berdasarkan rentang tanggal
    if (startDate && endDate) {
        param += ` AND DATE(lr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
        paramCount += ` AND DATE(lr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Filter berdasarkan status
    if (status !== undefined && status !== '') {
        param += ` AND lr.status = ${status}`;
        paramCount += ` AND lr.status = ${status}`;
    }

    // Filter berdasarkan CITO
    if (is_cito !== undefined && is_cito !== '') {
        param += ` AND lr.is_cito = ${is_cito}`;
        paramCount += ` AND lr.is_cito = ${is_cito}`;
    }

    // Search berdasarkan nama pasien atau no RM
    if (search) {
        param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%')`;
        paramCount += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%')`;
    }

    try {
        // Query utama untuk data laporan waktu tunggu
        let data = await sq.query(`
            SELECT
                lr.id as lab_regis_id,
                lr.tanggal_request,
                lr.tanggal_ambil_sampel,
                lr.status,
                lr.is_cito,
                r.tgl_registrasi,
                p.no_rm,
                p.nama_lengkap,
                p.jenis_kelamin,
                d.nama_dokter,
                -- Waktu tunggu dari request ke pengambilan sampel
                CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr.tanggal_ambil_sampel IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (lr.tanggal_ambil_sampel - lr.tanggal_request)) / 60
                    ELSE NULL
                END as menit_request_ambil,
                -- Waktu tunggu dari pengambilan sampel ke hasil
                CASE
                    WHEN lr.tanggal_ambil_sampel IS NOT NULL AND lr.status = 3 THEN
                        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - lr.tanggal_ambil_sampel)) / 60
                    ELSE NULL
                END as menit_ambil_selesai,
                -- Total waktu tunggu
                CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr.status = 3 THEN
                        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - lr.tanggal_request)) / 60
                    ELSE NULL
                END as menit_total,
                COUNT(lh.id) as jumlah_pemeriksaan
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            LEFT JOIN ms_dokter d ON d.id = lr.dokter_id
            LEFT JOIN lab_hasil lh ON lh.lab_regis_id = lr.id
            WHERE lr."deletedAt" IS NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${param}
            GROUP BY lr.id, r.tgl_registrasi, p.id, d.nama_dokter
            ORDER BY lr.tanggal_request DESC
            LIMIT ${perPage || 10} OFFSET ${((page || 1) - 1) * (perPage || 10)}
        `, s);

        // Query untuk total count
        let countData = await sq.query(`
            SELECT COUNT(DISTINCT lr.id) as total
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            LEFT JOIN ms_dokter d ON d.id = lr.dokter_id
            WHERE lr."deletedAt" IS NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${paramCount}
        `, s);

        // Query untuk statistik
        let statistik = await sq.query(`
            SELECT
                COUNT(*) as total_data,
                COUNT(CASE WHEN lr.status = 3 THEN 1 END) as total_selesai,
                COUNT(CASE WHEN lr.is_cito = true THEN 1 END) as total_cito,
                AVG(CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr.tanggal_ambil_sampel IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (lr.tanggal_ambil_sampel - lr.tanggal_request)) / 60
                    ELSE NULL
                END) as rata_request_ambil,
                AVG(CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr.status = 3 THEN
                        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - lr.tanggal_request)) / 60
                    ELSE NULL
                END) as rata_total,
                MAX(CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr.status = 3 THEN
                        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - lr.tanggal_request)) / 60
                    ELSE NULL
                END) as max_total,
                MIN(CASE
                    WHEN lr.tanggal_request IS NOT NULL AND lr.status = 3 THEN
                        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - lr.tanggal_request)) / 60
                    ELSE NULL
                END) as min_total
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            WHERE lr."deletedAt" IS NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${param}
        `, s);

        const total = countData[0]?.total || 0;

        // Format data dengan perhitungan waktu
        const formattedData = data.map(item => {
            const waktuRequestAmbil = hitungSelisihWaktu(item.tanggal_request, item.tanggal_ambil_sampel);
            const waktuTotal = hitungSelisihWaktu(item.tanggal_request, item.status === 3 ? new Date() : null);

            return {
                ...item,
                waktu_request_ambil: waktuRequestAmbil,
                waktu_total: waktuTotal,
                status_text: item.status === 0 ? 'Baru' :
                           item.status === 1 ? 'Proses' :
                           item.status === 2 ? 'Sampel Diambil' :
                           item.status === 3 ? 'Selesai' : 'Tidak Diketahui'
            };
        });

        return {
            status: 200,
            message: "sukses",
            data: formattedData,
            statistik: statistik[0] || {},
            pagination: {
                page: page || 1,
                perPage: perPage || 10,
                total,
                totalPages: Math.ceil(total / (perPage || 10))
            }
        };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "gagal", data: error };
    }
}

const getQueryList = async (payload) => {
    const { page, perPage, search, startDate, endDate, status } = payload;

    let param = '';
    let paramCount = '';

    // Filter berdasarkan rentang tanggal
    if (startDate && endDate) {
        param += ` AND DATE(lr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
        paramCount += ` AND DATE(lr.tanggal_request) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Filter berdasarkan status
    if (status !== undefined && status !== '') {
        if (status.includes(',')) {
            const statusArray = status.split(',').map(s => s.trim()).filter(s => s !== '');
            param += ` AND lr.status IN (${statusArray.join(',')})`;
            paramCount += ` AND lr.status IN (${statusArray.join(',')})`;
        } else {
            param += ` AND lr.status = ${status}`;
            paramCount += ` AND lr.status = ${status}`;
        }
    }

    // Search berdasarkan nama pasien atau no RM
    if (search) {
        param += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%')`;
        paramCount += ` AND (p.nama_lengkap ILIKE '%${search}%' OR p.no_rm ILIKE '%${search}%')`;
    }

    try {
        // Query utama untuk data laporan - FIX QUERY untuk nama_paket
        let data = await sq.query(`
            SELECT
                lr.id as lab_regis_id,
                lr.tanggal_request,
                lr.tanggal_ambil_sampel,
                lr.status,
                lr.is_cito,
                lr.is_puasa,
                r.tgl_registrasi,
                p.id as pasien_id,
                p.no_rm,
                p.nama_lengkap,
                p.jenis_kelamin,
                p.tgl_lahir,
                d.nama_dokter,
                'SADASDASD' as nama_paket,
                COUNT(lh.id) as jumlah_pemeriksaan,
                CASE
                    WHEN lr.status = 0 THEN 'Baru'
                    WHEN lr.status = 1 THEN 'Proses'
                    WHEN lr.status = 2 THEN 'Sampel Diambil'
                    WHEN lr.status = 3 THEN 'Selesai'
                    ELSE 'Tidak Diketahui'
                END as status_text
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            LEFT JOIN ms_dokter d ON d.id = lr.dokter_id
            LEFT JOIN lab_hasil lh ON lh.lab_regis_id = lr.id
            WHERE lr."deletedAt" IS NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${param}
            GROUP BY lr.id, r.tgl_registrasi, p.id, d.nama_dokter
            ORDER BY lr.tanggal_request DESC
            LIMIT ${perPage || 10} OFFSET ${((page || 1) - 1) * (perPage || 10)}
        `, s);

        // Query untuk total count
        let countData = await sq.query(`
            SELECT COUNT(DISTINCT lr.id) as total
            FROM lab_regis lr
            LEFT JOIN registrasi r ON r.id = lr.registrasi_id
            LEFT JOIN pasien p ON p.id = r.pasien_id
            LEFT JOIN ms_dokter d ON d.id = lr.dokter_id
            LEFT JOIN lab_hasil lh ON lh.lab_regis_id = lr.id
            WHERE lr."deletedAt" IS NULL
                AND r."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                ${paramCount}
        `, s);

        const total = countData[0]?.total || 0;

        return {
            status: 200,
            message: "sukses",
            data,
            pagination: {
                page: page || 1,
                perPage: perPage || 10,
                total,
                totalPages: Math.ceil(total / (perPage || 10))
            }
        };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "gagal", data: error };
    }
}

const getDetailById = async (id) => {
        if (!id) {
            return null;
        }
        
        try {
            // Data registrasi lab
            let regisData = await sq.query(`
                SELECT
                    lr.id as lab_regis_id,
                    lr.tanggal_request,
                    lr.tanggal_ambil_sampel,
                    lr.status,
                    lr.is_cito,
                    lr.is_puasa,
                    lr.klinis,
                    lr.diagnosa,
                    r.tgl_registrasi,
                    p.id as pasien_id,
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    p.no_telepon,
                    d.nama_dokter,
                    d.id as dokter_id,
                    lr.list_lab_paket
                FROM lab_regis lr
                LEFT JOIN registrasi r ON r.id = lr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = lr.dokter_id
                WHERE lr.id = $1
                    AND lr."deletedAt" IS NULL
                    AND r."deletedAt" IS NULL
                    AND p."deletedAt" IS NULL
            `, { ...s, bind: [id] });

            if (regisData.length === 0) {
                return null;
            }

            // Data hasil pemeriksaan dengan penanganan yang lebih baik
            let hasilData = await sq.query(`
                SELECT
                    lh.id,
                    COALESCE(lh.hasil, 'Belum ada hasil') as hasil,
                    lh.is_normal,
                    COALESCE(lh.nama_penunjang, pen.nama_penunjang, 'Pemeriksaan') as nama_penunjang,
                    lh.parameter_normal,
                    lh.satuan,
                    COALESCE(lh.operator, '-') as operator,
                    lh.nilai_r_neonatus_min,
                    lh.nilai_r_neonatus_max,
                    lh.nilai_r_bayi_min,
                    lh.nilai_r_bayi_max,
                    lh.nilai_r_anak_min,
                    lh.nilai_r_anak_max,
                    lh.nilai_r_d_perempuan_min,
                    lh.nilai_r_d_perempuan_max,
                    lh.nilai_r_d_laki_min,
                    lh.nilai_r_d_laki_max,
                    COALESCE(lp.nama_lab_paket, 'Pemeriksaan Umum') as nama_paket,
                    pen.nama_penunjang as nama_jenis_pemeriksaan
                FROM lab_hasil lh
                LEFT JOIN penunjang pen ON pen.id = lh.penunjang_id
                LEFT JOIN lab_paket lp ON lp.id = lh.lab_paket_id
                WHERE lh.lab_regis_id = $1
                    AND lh."deletedAt" IS NULL
                ORDER BY COALESCE(lp.nama_lab_paket, 'Pemeriksaan Umum'), pen.nama_penunjang
            `, { ...s, bind: [id] });

            // Format data registrasi
            const regisInfo = regisData[0];

            // Parse paketData jika dalam format string
            let paketData = regisInfo.paketData;
            if (typeof paketData === 'string') {
                try {
                    paketData = JSON.parse(paketData);
                } catch (e) {
                    paketData = [];
                }
            }

            return {
                registrasi: {
                    ...regisInfo,
                    tanggal_request: regisInfo.tanggal_request ? new Date(regisInfo.tanggal_request) : null,
                    tanggal_ambil_sampel: regisInfo.tanggal_ambil_sampel ? new Date(regisInfo.tanggal_ambil_sampel) : null,
                    tgl_registrasi: regisInfo.tgl_registrasi ? new Date(regisInfo.tgl_registrasi) : null,
                    tgl_lahir: regisInfo.tgl_lahir ? new Date(regisInfo.tgl_lahir) : null
                },
                paket: paketData,
                hasil: hasilData
            };
        } catch (error) {
            console.error('Error in getDetailById:', error);
            return null;
        }
    }

class Controller {
    static async list(req, res) {
        try {
            const result = await getQueryList(req.body);

            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json(result);
        }
    }

    static async waktuTunggu(req, res) {
        try {
            const result = await getWaktuTungguData(req.body);

            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    static async pembatalan(req, res) {
        try {
            const result = await getPembatalanData(req.body);

            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    // Fungsi untuk membatalkan pemeriksaan lab
    static async batalkanPemeriksaan(req, res) {
        const { id, alasan_pembatalan } = req.body;

        if (!id) {
            return res.status(400).json({ status: 400, message: "ID pemeriksaan diperlukan" });
        }

        if (!alasan_pembatalan) {
            return res.status(400).json({ status: 400, message: "Alasan pembatalan diperlukan" });
        }

        try {
            const labRegis = require('../lab_regis/model');

            // Cek apakah data ada
            const dataExist = await labRegis.findByPk(id);
            if (!dataExist) {
                return res.status(404).json({ status: 404, message: "Data pemeriksaan tidak ditemukan" });
            }

            // Update data pembatalan
            await labRegis.update(
                {
                    alasan_pembatalan,
                    user_batal: req.user?.id || 'system',
                    tanggal_batal: new Date()
                },
                { where: { id } }
            );

            // Soft delete
            await dataExist.destroy();

            res.status(200).json({
                status: 200,
                message: "Pemeriksaan berhasil dibatalkan",
                data: {
                    id,
                    alasan_pembatalan,
                    tanggal_batal: new Date(),
                    user_batal: req.user?.id || 'system'
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal membatalkan pemeriksaan", data: error });
        }
    }

    static async detail(req, res) {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ status: 400, message: "ID laporan diperlukan" });
        }

        try {
            const result = await getDetailById(id);
            if (!result) {
                return res.status(404).json({ status: 404, message: "Data tidak ditemukan" });
            }

            res.status(200).json({
                status: 200,
                message: "sukses",
                data: result
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 500, message: "gagal", data: error });
        }
    }

    // Helper method untuk internal call
    // static async 

    static async exportPdf(req, res) {
        const { id, startDate, endDate, status } = req.body;

        try {
            let data;
            let filename;

            if (id) {
                // Export detail satu laporan - FIX: Gunakan helper method
                const detailResult = await getDetailById(id);
                if (!detailResult) {
                    return res.status(404).json({ status: 404, message: "Data tidak ditemukan" });
                }

                data = [detailResult];
                filename = `Laporan_Laboratorium_Detail_${new Date().toISOString().split('T')[0]}.pdf`;
            } else {
                // Export daftar laporan
                const listResult = await getQueryList({
                    page: 1,
                    perPage: 10000, // Ambil semua data untuk export
                    startDate,
                    endDate,
                    status
                });

                if (listResult.status !== 200) {
                    return res.status(listResult.status).json(listResult);
                }

                // Ambil detail untuk setiap item
                data = [];
                for (const item of listResult.data) {
                    try {
                        const detailResult = await getDetailById(item.lab_regis_id);
                        if (detailResult) {
                            data.push(detailResult);
                        }
                    } catch (error) {
                        console.log(`Error getting detail for ${item.lab_regis_id}:`, error);
                    }
                }

                filename = `Laporan_Laboratorium_Daftar_${new Date().toISOString().split('T')[0]}.pdf`;
            }

            // Generate PDF
            const pdfBuffer = await generatePdfReport(data, id ? 'detail' : 'list');

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: "gagal membuat PDF", data: error });
        }
    }

    static async exportWaktuTungguPdf(req, res) {
        const { startDate, endDate, status, is_cito } = req.body;

        try {
            // Ambil semua data untuk export
            const result = await getWaktuTungguData({
                page: 1,
                perPage: 10000, // Ambil semua data untuk export
                startDate,
                endDate,
                status,
                is_cito
            });

            if (result.status !== 200) {
                return res.status(result.status).json(result);
            }

            // Generate PDF untuk laporan waktu tunggu
            const pdfBuffer = await generateWaktuTungguPdf(
                result.data,
                result.statistik,
                { startDate, endDate, status, is_cito }
            );

            const filename = `Laporan_Waktu_Tunggu_Laboratorium_${new Date().toISOString().split('T')[0]}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: "gagal membuat PDF waktu tunggu", data: error });
        }
    }

    static async exportPembatalanPdf(req, res) {
        const { startDate, endDate, alasan_batal, user_batal } = req.body;

        try {
            // Ambil semua data untuk export
            const result = await getPembatalanData({
                page: 1,
                perPage: 10000, // Ambil semua data untuk export
                startDate,
                endDate,
                alasan_batal,
                user_batal
            });

            if (result.status !== 200) {
                return res.status(result.status).json(result);
            }

            // Generate PDF untuk laporan pembatalan
            const pdfBuffer = await generatePembatalanPdf(
                result.data,
                result.statistik,
                { startDate, endDate, alasan_batal, user_batal }
            );

            const filename = `Laporan_Pembatalan_Laboratorium_${new Date().toISOString().split('T')[0]}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: "gagal membuat PDF pembatalan", data: error });
        }
    }
}

module.exports = Controller;