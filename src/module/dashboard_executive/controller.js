const { sq } = require("../../config/connection");
const { QueryTypes } = require('sequelize');
const moment = require("moment");

const s = { type: QueryTypes.SELECT };

class Controller {

    /**
     * API 1: GET /stats/visits
     * Mengambil total kunjungan pasien berdasarkan rentang waktu
     */
    static async getVisits(req, res) {
        const { range } = req.query;

        try {
            if (!range || !['daily', 'weekly', 'monthly', 'yearly'].includes(range)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid range parameter. Must be: daily, weekly, monthly, or yearly",
                    code: 400
                });
            }

            let dateCondition = '';
            let currentDate = moment();
            let dateLabel = '';

            switch (range) {
                case 'daily':
                    dateCondition = `DATE(r.tgl_registrasi) = '${currentDate.format('YYYY-MM-DD')}'`;
                    dateLabel = currentDate.format('YYYY-MM-DD');
                    break;
                case 'weekly':
                    const startOfWeek = currentDate.clone().startOf('week').format('YYYY-MM-DD');
                    const endOfWeek = currentDate.clone().endOf('week').format('YYYY-MM-DD');
                    dateCondition = `DATE(r.tgl_registrasi) BETWEEN '${startOfWeek}' AND '${endOfWeek}'`;
                    dateLabel = `${startOfWeek} to ${endOfWeek}`;
                    break;
                case 'monthly':
                    const startOfMonth = currentDate.clone().startOf('month').format('YYYY-MM-DD');
                    const endOfMonth = currentDate.clone().endOf('month').format('YYYY-MM-DD');
                    dateCondition = `DATE(r.tgl_registrasi) BETWEEN '${startOfMonth}' AND '${endOfMonth}'`;
                    dateLabel = currentDate.format('YYYY-MM');
                    break;
                case 'yearly':
                    const startOfYear = currentDate.clone().startOf('year').format('YYYY-MM-DD');
                    const endOfYear = currentDate.clone().endOf('year').format('YYYY-MM-DD');
                    dateCondition = `DATE(r.tgl_registrasi) BETWEEN '${startOfYear}' AND '${endOfYear}'`;
                    dateLabel = currentDate.format('YYYY');
                    break;
            }

            const query = `
                SELECT COUNT(r.id)::int as total_visits
                FROM registrasi r
                WHERE r."deletedAt" IS NULL
                AND ${dateCondition}
            `;

            const result = await sq.query(query, s);
            const totalVisits = result[0]?.total_visits || 0;

            res.status(200).json({
                success: true,
                range: range,
                total_visits: totalVisits,
                date: dateLabel,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 2: GET /stats/bor
     * Mengambil nilai BOR realtime dan tren
     */
    static async getBOR(req, res) {
        const { trend_days = 30 } = req.query;

        try {
            const trendDays = parseInt(trend_days) || 30;

            // Query untuk mendapatkan total bed
            const totalBedsQuery = `
                SELECT COUNT(mb.id)::int as total_beds
                FROM ms_bed mb
                WHERE mb."deletedAt" IS NULL
                AND mb.status_bed = 1
            `;
            const totalBedsResult = await sq.query(totalBedsQuery, s);
            const totalBeds = totalBedsResult[0]?.total_beds || 1;

            // Query untuk BOR hari ini
            const today = moment().format('YYYY-MM-DD');
            const borTodayQuery = `
                SELECT COUNT(DISTINCT hb.ms_bed_id)::int as occupied_beds
                FROM history_bed hb
                WHERE hb."deletedAt" IS NULL
                AND hb.status_checkout = 0
                AND DATE(hb.tgl_mulai) <= '${today}'
                AND (hb.tgl_selesai IS NULL OR DATE(hb.tgl_selesai) >= '${today}')
            `;
            const borTodayResult = await sq.query(borTodayQuery, s);
            const occupiedBedsToday = borTodayResult[0]?.occupied_beds || 0;
            const borToday = ((occupiedBedsToday / totalBeds) * 100).toFixed(1);

            // Query untuk tren BOR
            const startDate = moment().subtract(trendDays - 1, 'days').format('YYYY-MM-DD');
            const endDate = moment().format('YYYY-MM-DD');

            const trendQuery = `
                WITH date_series AS (
                    SELECT generate_series(
                        '${startDate}'::date,
                        '${endDate}'::date,
                        '1 day'::interval
                    )::date as date
                ),
                daily_occupation AS (
                    SELECT 
                        ds.date,
                        COUNT(DISTINCT hb.ms_bed_id)::int as occupied_beds
                    FROM date_series ds
                    LEFT JOIN history_bed hb ON 
                        hb."deletedAt" IS NULL
                        AND hb.status_checkout = 0
                        AND DATE(hb.tgl_mulai) <= ds.date
                        AND (hb.tgl_selesai IS NULL OR DATE(hb.tgl_selesai) >= ds.date)
                    GROUP BY ds.date
                    ORDER BY ds.date
                )
                SELECT 
                    TO_CHAR(date, 'YYYY-MM-DD') as date,
                    ROUND((occupied_beds::numeric / ${totalBeds}) * 100, 1) as bor
                FROM daily_occupation
            `;

            const trendResult = await sq.query(trendQuery, s);

            res.status(200).json({
                success: true,
                bor_today: parseFloat(borToday),
                trend_days: trendDays,
                trend: trendResult,
                formula: "BOR = (Total Hari Perawatan) / (Jumlah Tempat Tidur × Jumlah Hari) × 100%"
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 3: GET /stats/igd-queue/realtime
     * Melihat status antrian IGD secara realtime
     */
    static async getIGDQueueRealtime(req, res) {
        try {
            const today = moment().format('YYYY-MM-DD');

            const query = `
                SELECT COUNT(r.id)::int as queue_count
                FROM registrasi r
                JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                WHERE r."deletedAt" IS NULL
                AND mjl.kode_jenis_layanan = 'IGD'
                AND DATE(r.tgl_registrasi) = '${today}'
                AND r.status_registrasi IN (1, 2)
            `;

            const result = await sq.query(query, s);
            const queueCount = result[0]?.queue_count || 0;

            // Tentukan status berdasarkan jumlah antrian
            let status = 'normal';
            if (queueCount >= 76) {
                status = 'kritis';
            } else if (queueCount >= 51) {
                status = 'padat';
            }

            res.status(200).json({
                success: true,
                queue_count: queueCount,
                status: status,
                classification: {
                    normal: "0 - 50",
                    padat: "51 - 75",
                    kritis: "76 - 100"
                },
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 4: GET /stats/idle-capacity
     * Menampilkan ruang/tempat tidur yang tidak terpakai (kapasitas idle)
     */
    static async getIdleCapacity(req, res) {
        try {
            // Query untuk total beds
            const totalBedsQuery = `
                SELECT COUNT(mb.id)::int as total_beds
                FROM ms_bed mb
                WHERE mb."deletedAt" IS NULL
                AND mb.status_bed = 1
            `;
            const totalBedsResult = await sq.query(totalBedsQuery, s);
            const totalBeds = totalBedsResult[0]?.total_beds || 0;

            // Query untuk occupied beds (yang sedang digunakan)
            const today = moment().format('YYYY-MM-DD');
            const occupiedBedsQuery = `
                SELECT COUNT(DISTINCT hb.ms_bed_id)::int as occupied_beds
                FROM history_bed hb
                WHERE hb."deletedAt" IS NULL
                AND hb.status_checkout = 0
                AND DATE(hb.tgl_mulai) <= '${today}'
                AND (hb.tgl_selesai IS NULL OR DATE(hb.tgl_selesai) >= '${today}')
            `;
            const occupiedBedsResult = await sq.query(occupiedBedsQuery, s);
            const occupiedBeds = occupiedBedsResult[0]?.occupied_beds || 0;

            // Hitung idle beds
            const idleBeds = totalBeds - occupiedBeds;
            const idlePercentage = totalBeds > 0 ? ((idleBeds / totalBeds) * 100).toFixed(1) : 0;

            // Generate rekomendasi berdasarkan idle percentage
            let recommendation = "";
            if (parseFloat(idlePercentage) > 50) {
                recommendation = "Kapasitas idle sangat tinggi. Pertimbangkan untuk meningkatkan promosi layanan atau evaluasi utilisasi ruangan.";
            } else if (parseFloat(idlePercentage) > 30) {
                recommendation = "Kapasitas idle cukup tinggi. Optimalkan ruang-ruang yang jarang terpakai untuk efisiensi kapasitas.";
            } else if (parseFloat(idlePercentage) > 10) {
                recommendation = "Kapasitas idle dalam batas normal. Pertahankan utilisasi ruangan yang baik.";
            } else {
                recommendation = "Kapasitas hampir penuh. Pastikan ada cadangan untuk kasus darurat.";
            }

            res.status(200).json({
                success: true,
                total_beds: totalBeds,
                occupied_beds: occupiedBeds,
                idle_beds: idleBeds,
                idle_percentage: parseFloat(idlePercentage),
                recommendation: recommendation,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 5: GET /financial/revenue-vs-operational
     * Perbandingan pendapatan vs biaya operasional dengan trend
     */
    static async getRevenueVsOperational(req, res) {
        const { trend = 'daily' } = req.query;

        try {
            if (!['daily', 'weekly', 'monthly'].includes(trend)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid trend parameter. Must be: daily, weekly, or monthly",
                    code: 400
                });
            }

            const currentMonth = moment().format('YYYY-MM');
            const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

            // Query total revenue bulan ini
            const totalRevenueQuery = `
                SELECT COALESCE(SUM(p.total_penjualan), 0)::numeric as total_revenue
                FROM penjualan p
                WHERE p."deletedAt" IS NULL
                AND DATE(p.tgl_penjualan) BETWEEN '${startOfMonth}' AND '${endOfMonth}'
                AND p.status_penjualan IN (2, 3)
            `;
            const totalRevenueResult = await sq.query(totalRevenueQuery, s);
            const totalRevenue = parseFloat(totalRevenueResult[0]?.total_revenue || 0);

            // Query untuk trend berdasarkan tipe
            let trendQuery = '';
            
            if (trend === 'daily') {
                trendQuery = `
                    WITH date_series AS (
                        SELECT generate_series(
                            '${startOfMonth}'::date,
                            '${endOfMonth}'::date,
                            '1 day'::interval
                        )::date as date
                    )
                    SELECT 
                        TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
                        COALESCE(SUM(p.total_penjualan), 0)::numeric as revenue
                    FROM date_series ds
                    LEFT JOIN penjualan p ON 
                        DATE(p.tgl_penjualan) = ds.date
                        AND p."deletedAt" IS NULL
                        AND p.status_penjualan IN (2, 3)
                    GROUP BY ds.date
                    ORDER BY ds.date
                `;
            } else if (trend === 'weekly') {
                trendQuery = `
                    SELECT 
                        TO_CHAR(DATE_TRUNC('week', p.tgl_penjualan), 'YYYY-MM-DD') as date,
                        COALESCE(SUM(p.total_penjualan), 0)::numeric as revenue
                    FROM penjualan p
                    WHERE p."deletedAt" IS NULL
                    AND DATE(p.tgl_penjualan) BETWEEN '${startOfMonth}' AND '${endOfMonth}'
                    AND p.status_penjualan IN (2, 3)
                    GROUP BY DATE_TRUNC('week', p.tgl_penjualan)
                    ORDER BY DATE_TRUNC('week', p.tgl_penjualan)
                `;
            } else { // monthly
                trendQuery = `
                    SELECT 
                        TO_CHAR(DATE_TRUNC('month', p.tgl_penjualan), 'YYYY-MM') as date,
                        COALESCE(SUM(p.total_penjualan), 0)::numeric as revenue
                    FROM penjualan p
                    WHERE p."deletedAt" IS NULL
                    AND DATE(p.tgl_penjualan) BETWEEN '${startOfMonth}' AND '${endOfMonth}'
                    AND p.status_penjualan IN (2, 3)
                    GROUP BY DATE_TRUNC('month', p.tgl_penjualan)
                    ORDER BY DATE_TRUNC('month', p.tgl_penjualan)
                `;
            }

            const trendResult = await sq.query(trendQuery, s);
            const formattedTrend = trendResult.map(item => ({
                date: item.date,
                revenue: parseFloat(item.revenue || 0)
            }));

            res.status(200).json({
                success: true,
                month: currentMonth,
                total_revenue: totalRevenue,
                total_operational_cost: null, // Tidak tersedia
                trend_type: trend,
                trend: formattedTrend,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 6: GET /financial/revenue-per-service
     * Pendapatan per jenis layanan (RJ, Ranap, IGD, Lab, Radiologi, OK)
     */
    static async getRevenuePerService(req, res) {
        const { range = 'monthly' } = req.query;

        try {
            if (!['monthly', 'yearly'].includes(range)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid range parameter. Must be: monthly or yearly",
                    code: 400
                });
            }

            let startDate, endDate;
            if (range === 'monthly') {
                startDate = moment().startOf('month').format('YYYY-MM-DD');
                endDate = moment().endOf('month').format('YYYY-MM-DD');
            } else {
                startDate = moment().startOf('year').format('YYYY-MM-DD');
                endDate = moment().endOf('year').format('YYYY-MM-DD');
            }

            // Query untuk mendapatkan revenue per service
            const query = `
                SELECT 
                    mjl.kode_jenis_layanan,
                    CASE 
                        WHEN mjl.kode_jenis_layanan = 'RAJAL' THEN 'RJ'
                        WHEN mjl.kode_jenis_layanan = 'RINAP' THEN 'Ranap'
                        WHEN mjl.kode_jenis_layanan = 'IGD' THEN 'IGD'
                        WHEN mjl.kode_jenis_layanan LIKE '%LAB%' THEN 'Lab'
                        WHEN mjl.kode_jenis_layanan LIKE '%RAD%' THEN 'Radiologi'
                        WHEN mjl.kode_jenis_layanan LIKE '%OK%' THEN 'OK'
                        ELSE mjl.kode_jenis_layanan
                    END as service,
                    COALESCE(SUM(p.total_penjualan), 0)::numeric as revenue
                FROM penjualan p
                JOIN ms_jenis_layanan mjl ON mjl.id = p.ms_jenis_layanan_id
                WHERE p."deletedAt" IS NULL
                AND mjl."deletedAt" IS NULL
                AND DATE(p.tgl_penjualan) BETWEEN '${startDate}' AND '${endDate}'
                AND p.status_penjualan IN (2, 3)
                GROUP BY mjl.kode_jenis_layanan
                ORDER BY revenue DESC
            `;

            const result = await sq.query(query, s);
            
            // Aggregate services
            const serviceMap = {
                'RJ': 0,
                'Ranap': 0,
                'IGD': 0,
                'Lab': 0,
                'Radiologi': 0,
                'OK': 0
            };

            result.forEach(item => {
                const service = item.service;
                const revenue = parseFloat(item.revenue || 0);
                
                if (serviceMap.hasOwnProperty(service)) {
                    serviceMap[service] += revenue;
                }
            });

            const services = Object.keys(serviceMap).map(key => ({
                service: key,
                revenue: serviceMap[key]
            }));

            res.status(200).json({
                success: true,
                range: range,
                services: services,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 7: GET /financial/bpjs-claim-status
     * Status klaim BPJS (outstanding, in progress, potential reject)
     */
    static async getBPJSClaimStatus(req, res) {
        try {
            // Query untuk klaim BPJS berdasarkan status registrasi dengan SEP
            const query = `
                SELECT 
                    COUNT(CASE WHEN r.status_registrasi = 1 THEN 1 END)::int as outstanding,
                    COUNT(CASE WHEN r.status_registrasi = 2 THEN 1 END)::int as in_progress
                FROM registrasi r
                JOIN ms_asuransi ma ON ma.id = r.ms_asuransi_id
                WHERE r."deletedAt" IS NULL
                AND ma."deletedAt" IS NULL
                AND ma.tipe_asuransi = 'BPJS'
                AND r.no_sep IS NOT NULL
                AND r.no_sep != ''
                AND r.status_registrasi IN (1, 2)
            `;

            const result = await sq.query(query, s);
            const data = result[0] || { outstanding: 0, in_progress: 0 };

            res.status(200).json({
                success: true,
                bpjs_claims: {
                    outstanding: data.outstanding || 0,
                    in_progress: data.in_progress || 0,
                    potential_reject: null // Tidak tersedia
                },
                note: "Potensi reject tidak tersedia karena data bridging tidak mencapai proses grouping.",
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 8: GET /financial/cost-per-patient
     * Biaya rata-rata per pasien dengan trend
     */
    static async getCostPerPatient(req, res) {
        const { trend = 'daily' } = req.query;

        try {
            if (!['daily', 'monthly'].includes(trend)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid trend parameter. Must be: daily or monthly",
                    code: 400
                });
            }

            const currentMonth = moment().format('YYYY-MM');
            const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

            // Query untuk average cost per patient bulan ini
            const avgCostQuery = `
                SELECT 
                    COALESCE(AVG(p.total_penjualan), 0)::numeric as avg_cost
                FROM penjualan p
                WHERE p."deletedAt" IS NULL
                AND DATE(p.tgl_penjualan) BETWEEN '${startOfMonth}' AND '${endOfMonth}'
                AND p.status_penjualan IN (2, 3)
                AND p.registrasi_id IS NOT NULL
            `;
            const avgCostResult = await sq.query(avgCostQuery, s);
            const averageCost = Math.round(parseFloat(avgCostResult[0]?.avg_cost || 0));

            // Query untuk trend
            let trendQuery = '';
            
            if (trend === 'daily') {
                trendQuery = `
                    WITH date_series AS (
                        SELECT generate_series(
                            '${startOfMonth}'::date,
                            '${endOfMonth}'::date,
                            '1 day'::interval
                        )::date as date
                    )
                    SELECT 
                        TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
                        COALESCE(AVG(p.total_penjualan), 0)::numeric as avg_cost
                    FROM date_series ds
                    LEFT JOIN penjualan p ON 
                        DATE(p.tgl_penjualan) = ds.date
                        AND p."deletedAt" IS NULL
                        AND p.status_penjualan IN (2, 3)
                        AND p.registrasi_id IS NOT NULL
                    GROUP BY ds.date
                    ORDER BY ds.date
                `;
            } else { // monthly
                trendQuery = `
                    SELECT 
                        TO_CHAR(DATE_TRUNC('month', p.tgl_penjualan), 'YYYY-MM') as date,
                        COALESCE(AVG(p.total_penjualan), 0)::numeric as avg_cost
                    FROM penjualan p
                    WHERE p."deletedAt" IS NULL
                    AND DATE(p.tgl_penjualan) BETWEEN '${startOfMonth}' AND '${endOfMonth}'
                    AND p.status_penjualan IN (2, 3)
                    AND p.registrasi_id IS NOT NULL
                    GROUP BY DATE_TRUNC('month', p.tgl_penjualan)
                    ORDER BY DATE_TRUNC('month', p.tgl_penjualan)
                `;
            }

            const trendResult = await sq.query(trendQuery, s);
            const formattedTrend = trendResult.map(item => ({
                date: item.date,
                avg_cost: Math.round(parseFloat(item.avg_cost || 0))
            }));

            res.status(200).json({
                success: true,
                trend_type: trend,
                average_cost_per_patient: averageCost,
                trend: formattedTrend,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 9: GET /services/patient-count
     * Jumlah pasien per jenis layanan (RJ, Ranap, IGD) dengan detail per unit
     */
    static async getPatientCount(req, res) {
        const { unit, date } = req.query;
        const targetDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

        try {
            // Query untuk count per jenis layanan
            const countsQuery = `
                SELECT 
                    COUNT(CASE WHEN mjl.kode_jenis_layanan = 'RAJAL' THEN 1 END)::int as rawat_jalan,
                    COUNT(CASE WHEN mjl.kode_jenis_layanan = 'RINAP' THEN 1 END)::int as rawat_inap,
                    COUNT(CASE WHEN mjl.kode_jenis_layanan = 'IGD' THEN 1 END)::int as igd
                FROM registrasi r
                JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                WHERE r."deletedAt" IS NULL
                AND mjl."deletedAt" IS NULL
                AND DATE(r.tgl_registrasi) = '${targetDate}'
                AND r.status_registrasi IN (1, 2)
            `;
            const countsResult = await sq.query(countsQuery, s);
            const counts = countsResult[0] || { rawat_jalan: 0, rawat_inap: 0, igd: 0 };

            // Query untuk detail per unit jika diminta
            let perUnit = [];
            if (unit === 'poli') {
                const unitQuery = `
                    SELECT 
                        mp.nama_poliklinik as unit,
                        COUNT(r.id)::int as count
                    FROM registrasi r
                    JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                    JOIN antrian_list al ON al.registrasi_id = r.id
                    JOIN jadwal_dokter jd ON jd.id = al.jadwal_dokter_id
                    JOIN ms_poliklinik mp ON mp.id = jd.ms_poliklinik_id
                    WHERE r."deletedAt" IS NULL
                    AND mjl."deletedAt" IS NULL
                    AND DATE(r.tgl_registrasi) = '${targetDate}'
                    AND mjl.kode_jenis_layanan = 'RAJAL'
                    AND r.status_registrasi IN (1, 2)
                    GROUP BY mp.nama_poliklinik
                    ORDER BY count DESC
                `;
                perUnit = await sq.query(unitQuery, s);
            } else if (unit === 'ruang') {
                const unitQuery = `
                    SELECT 
                        mr.nama_ruang as unit,
                        COUNT(r.id)::int as count
                    FROM registrasi r
                    JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                    JOIN history_bed hb ON hb.registrasi_id = r.id
                    JOIN ms_bed mb ON mb.id = hb.ms_bed_id
                    JOIN ms_kamar mk ON mk.id = mb.ms_kamar_id
                    JOIN ms_ruang mr ON mr.id = mk.ms_ruang_id
                    WHERE r."deletedAt" IS NULL
                    AND mjl."deletedAt" IS NULL
                    AND DATE(r.tgl_registrasi) = '${targetDate}'
                    AND mjl.kode_jenis_layanan = 'RINAP'
                    AND r.status_registrasi IN (1, 2)
                    AND hb.status_checkout = 0
                    GROUP BY mr.nama_ruang
                    ORDER BY count DESC
                `;
                perUnit = await sq.query(unitQuery, s);
            }

            res.status(200).json({
                success: true,
                date: targetDate,
                counts: counts,
                per_unit: perUnit,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 10: GET /services/waiting-time
     * Rata-rata waktu tunggu pasien dari registrasi sampai diproses
     */
    static async getWaitingTime(req, res) {
        const { range = 'daily' } = req.query;

        try {
            if (!['daily', 'monthly'].includes(range)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid range parameter. Must be: daily or monthly",
                    code: 400
                });
            }

            const currentDate = moment();
            let startDate, endDate;

            if (range === 'daily') {
                startDate = currentDate.clone().subtract(29, 'days').format('YYYY-MM-DD');
                endDate = currentDate.format('YYYY-MM-DD');
            } else {
                startDate = currentDate.clone().startOf('month').format('YYYY-MM-DD');
                endDate = currentDate.clone().endOf('month').format('YYYY-MM-DD');
            }

            // Query untuk average wait time
            const avgQuery = `
                SELECT 
                    AVG(EXTRACT(EPOCH FROM (al.tgl_diproses - al."createdAt")) / 60)::numeric as avg_wait_minutes
                FROM antrian_list al
                WHERE al."deletedAt" IS NULL
                AND al.tgl_diproses IS NOT NULL
                AND DATE(al."createdAt") BETWEEN '${startDate}' AND '${endDate}'
            `;
            const avgResult = await sq.query(avgQuery, s);
            const avgWaitTime = parseFloat(avgResult[0]?.avg_wait_minutes || 0).toFixed(1);

            // Query untuk detail/trend
            let detailQuery = '';
            if (range === 'daily') {
                detailQuery = `
                    SELECT 
                        TO_CHAR(DATE(al."createdAt"), 'YYYY-MM-DD') as date,
                        AVG(EXTRACT(EPOCH FROM (al.tgl_diproses - al."createdAt")) / 60)::numeric as avg_wait
                    FROM antrian_list al
                    WHERE al."deletedAt" IS NULL
                    AND al.tgl_diproses IS NOT NULL
                    AND DATE(al."createdAt") BETWEEN '${startDate}' AND '${endDate}'
                    GROUP BY DATE(al."createdAt")
                    ORDER BY DATE(al."createdAt")
                `;
            } else {
                detailQuery = `
                    SELECT 
                        TO_CHAR(DATE_TRUNC('week', al."createdAt"), 'YYYY-MM-DD') as date,
                        AVG(EXTRACT(EPOCH FROM (al.tgl_diproses - al."createdAt")) / 60)::numeric as avg_wait
                    FROM antrian_list al
                    WHERE al."deletedAt" IS NULL
                    AND al.tgl_diproses IS NOT NULL
                    AND DATE(al."createdAt") BETWEEN '${startDate}' AND '${endDate}'
                    GROUP BY DATE_TRUNC('week', al."createdAt")
                    ORDER BY DATE_TRUNC('week', al."createdAt")
                `;
            }

            const detailResult = await sq.query(detailQuery, s);
            const detail = detailResult.map(item => ({
                date: item.date,
                avg_wait: parseFloat(item.avg_wait || 0).toFixed(1)
            }));

            res.status(200).json({
                success: true,
                range: range,
                average_wait_time_minutes: parseFloat(avgWaitTime),
                detail: detail,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 11: GET /services/medical-actions
     * Jumlah tindakan medis (Lab dan Radiologi)
     */
    static async getMedicalActions(req, res) {
        const { range = 'daily' } = req.query;

        try {
            if (!['daily', 'monthly'].includes(range)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid range parameter. Must be: daily or monthly",
                    code: 400
                });
            }

            const currentDate = moment();
            let startDate, endDate;

            if (range === 'daily') {
                startDate = currentDate.clone().subtract(29, 'days').format('YYYY-MM-DD');
                endDate = currentDate.format('YYYY-MM-DD');
            } else {
                startDate = currentDate.clone().startOf('month').format('YYYY-MM-DD');
                endDate = currentDate.clone().endOf('month').format('YYYY-MM-DD');
            }

            // Query untuk total lab actions
            const labTotalQuery = `
                SELECT COUNT(lr.id)::int as total
                FROM lab_regis lr
                WHERE lr."deletedAt" IS NULL
                AND DATE(lr.tgl_permintaan) BETWEEN '${startDate}' AND '${endDate}'
            `;
            const labTotalResult = await sq.query(labTotalQuery, s);
            const labActions = labTotalResult[0]?.total || 0;

            // Query untuk total radiology actions
            const radTotalQuery = `
                SELECT COUNT(rr.id)::int as total
                FROM rad_regis rr
                WHERE rr."deletedAt" IS NULL
                AND DATE(rr.tgl_permintaan) BETWEEN '${startDate}' AND '${endDate}'
            `;
            const radTotalResult = await sq.query(radTotalQuery, s);
            const radiologyActions = radTotalResult[0]?.total || 0;

            // Query untuk trend
            const trendQuery = `
                WITH date_series AS (
                    SELECT generate_series(
                        '${startDate}'::date,
                        '${endDate}'::date,
                        '1 day'::interval
                    )::date as date
                ),
                lab_data AS (
                    SELECT 
                        DATE(lr.tgl_permintaan) as date,
                        COUNT(lr.id)::int as lab_count
                    FROM lab_regis lr
                    WHERE lr."deletedAt" IS NULL
                    GROUP BY DATE(lr.tgl_permintaan)
                ),
                rad_data AS (
                    SELECT 
                        DATE(rr.tgl_permintaan) as date,
                        COUNT(rr.id)::int as rad_count
                    FROM rad_regis rr
                    WHERE rr."deletedAt" IS NULL
                    GROUP BY DATE(rr.tgl_permintaan)
                )
                SELECT 
                    TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
                    COALESCE(ld.lab_count, 0) as lab,
                    COALESCE(rd.rad_count, 0) as radiology
                FROM date_series ds
                LEFT JOIN lab_data ld ON ld.date = ds.date
                LEFT JOIN rad_data rd ON rd.date = ds.date
                ORDER BY ds.date
            `;
            const trendResult = await sq.query(trendQuery, s);

            res.status(200).json({
                success: true,
                range: range,
                lab_actions: labActions,
                radiology_actions: radiologyActions,
                trend: trendResult,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 12: GET /services/top-diagnosis
     * Top 10 diagnosa dengan trend
     */
    static async getTopDiagnosis(req, res) {
        const { days = 30 } = req.query;

        try {
            const daysCount = parseInt(days) || 30;
            const startDate = moment().subtract(daysCount - 1, 'days').format('YYYY-MM-DD');
            const endDate = moment().format('YYYY-MM-DD');

            // Query untuk top 10 diagnosis
            const topDiagnosisQuery = `
                SELECT 
                    px.kode_diagnosa || ' - ' || px.nama_diagnosa as diagnosis,
                    COUNT(*)::int as count
                FROM (
                    SELECT 
                        p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa,
                        p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa,
                        DATE(amr."createdAt") as tanggal
                    FROM assesment_medis_rjalan amr 
                    CROSS JOIN jsonb_array_elements(amr.json_assesment_medis_rjalan->'assesment'->'diagnosa') p
                    WHERE amr."deletedAt" IS NULL 
                    AND amr.json_assesment_medis_rjalan IS NOT NULL 
                    AND p.* ->> 'tipe_diagnosa' = 'ICD'
                    
                    UNION ALL
                    
                    SELECT 
                        p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa,
                        p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa,
                        DATE(ami."createdAt") as tanggal
                    FROM assesment_medis_igd ami 
                    CROSS JOIN jsonb_array_elements(ami.json_assesment_medis_igd->'assesment'->'diagnosa') p
                    WHERE ami."deletedAt" IS NULL 
                    AND ami.json_assesment_medis_igd IS NOT NULL 
                    AND p.* ->> 'tipe_diagnosa' = 'ICD'
                    
                    UNION ALL
                    
                    SELECT 
                        p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa,
                        p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa,
                        DATE(c."createdAt") as tanggal
                    FROM cppt c 
                    CROSS JOIN json_array_elements(c.asesmen->'assesment'->'diagnosa') p
                    JOIN ms_tipe_tenaga_medis mttm ON mttm.id = c.ms_tipe_tenaga_medis_id 
                    WHERE c."deletedAt" IS NULL 
                    AND mttm.kode_tipe_tenaga_medis = 'Dr'
                    AND c.asesmen IS NOT NULL 
                    AND p.* ->> 'tipe_diagnosa' = 'ICD'
                ) px
                WHERE px.tanggal BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY px.kode_diagnosa, px.nama_diagnosa
                ORDER BY count DESC
                LIMIT 10
            `;
            const topDiagnosisResult = await sq.query(topDiagnosisQuery, s);

            // Query untuk trend (total diagnosis per hari)
            const trendQuery = `
                SELECT 
                    TO_CHAR(px.tanggal, 'YYYY-MM-DD') as date,
                    COUNT(*)::int as count
                FROM (
                    SELECT 
                        DATE(amr."createdAt") as tanggal
                    FROM assesment_medis_rjalan amr 
                    CROSS JOIN jsonb_array_elements(amr.json_assesment_medis_rjalan->'assesment'->'diagnosa') p
                    WHERE amr."deletedAt" IS NULL 
                    AND amr.json_assesment_medis_rjalan IS NOT NULL 
                    AND p.* ->> 'tipe_diagnosa' = 'ICD'
                    
                    UNION ALL
                    
                    SELECT 
                        DATE(ami."createdAt") as tanggal
                    FROM assesment_medis_igd ami 
                    CROSS JOIN jsonb_array_elements(ami.json_assesment_medis_igd->'assesment'->'diagnosa') p
                    WHERE ami."deletedAt" IS NULL 
                    AND ami.json_assesment_medis_igd IS NOT NULL 
                    AND p.* ->> 'tipe_diagnosa' = 'ICD'
                    
                    UNION ALL
                    
                    SELECT 
                        DATE(c."createdAt") as tanggal
                    FROM cppt c 
                    CROSS JOIN json_array_elements(c.asesmen->'assesment'->'diagnosa') p
                    JOIN ms_tipe_tenaga_medis mttm ON mttm.id = c.ms_tipe_tenaga_medis_id 
                    WHERE c."deletedAt" IS NULL 
                    AND mttm.kode_tipe_tenaga_medis = 'Dr'
                    AND c.asesmen IS NOT NULL 
                    AND p.* ->> 'tipe_diagnosa' = 'ICD'
                ) px
                WHERE px.tanggal BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY px.tanggal
                ORDER BY px.tanggal
            `;
            const trendResult = await sq.query(trendQuery, s);

            res.status(200).json({
                success: true,
                top_10_diagnosis: topDiagnosisResult,
                trend_days: daysCount,
                trend: trendResult,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 13: GET /facilities/bor-room
     * BOR (Bed Occupancy Rate) realtime per ruang
     */
    static async getBORPerRoom(req, res) {
        try {
            const today = moment().format('YYYY-MM-DD');

            const query = `
                SELECT 
                    mr.nama_ruang as room,
                    COUNT(DISTINCT mb.id)::int as capacity,
                    COUNT(DISTINCT CASE 
                        WHEN hb.status_checkout = 0 
                        AND DATE(hb.tgl_mulai) <= '${today}'
                        AND (hb.tgl_selesai IS NULL OR DATE(hb.tgl_selesai) >= '${today}')
                        THEN hb.ms_bed_id 
                    END)::int as occupied
                FROM ms_ruang mr
                LEFT JOIN ms_kamar mk ON mk.ms_ruang_id = mr.id AND mk."deletedAt" IS NULL
                LEFT JOIN ms_bed mb ON mb.ms_kamar_id = mk.id AND mb."deletedAt" IS NULL AND mb.status_bed = 1
                LEFT JOIN history_bed hb ON hb.ms_bed_id = mb.id AND hb."deletedAt" IS NULL
                WHERE mr."deletedAt" IS NULL
                GROUP BY mr.nama_ruang, mr.id
                HAVING COUNT(DISTINCT mb.id) > 0
                ORDER BY mr.nama_ruang
            `;

            const result = await sq.query(query, s);
            
            const bor = result.map(item => {
                const capacity = item.capacity || 0;
                const occupied = item.occupied || 0;
                const borPercent = capacity > 0 ? ((occupied / capacity) * 100).toFixed(1) : 0;
                
                return {
                    room: item.room,
                    capacity: capacity,
                    occupied: occupied,
                    bor_percent: parseFloat(borPercent)
                };
            });

            res.status(200).json({
                success: true,
                bor: bor,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 14: GET /facilities/doctors-oncall
     * Daftar dokter yang sedang on-call
     */
    static async getDoctorsOnCall(req, res) {
        const { date } = req.query;
        const targetDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

        try {
            // Get day of week (0 = Sunday, 6 = Saturday)
            const dayOfWeek = moment(targetDate).day();

            const query = `
                SELECT DISTINCT
                    md.nama_dokter as name,
                    ms.nama_specialist as specialist,
                    CASE 
                        WHEN jd.jam_mulai IS NOT NULL AND jd.jam_selesai IS NOT NULL 
                        THEN jd.jam_mulai || ' - ' || jd.jam_selesai
                        ELSE 'On-Call'
                    END as shift
                FROM jadwal_dokter jd
                JOIN ms_dokter md ON md.id = jd.ms_dokter_id
                LEFT JOIN ms_specialist ms ON ms.id = md.ms_spesialis_id
                WHERE jd."deletedAt" IS NULL
                AND md."deletedAt" IS NULL
                AND jd.hari = ${dayOfWeek}
                AND jd.status_jadwal = 1
                ORDER BY md.nama_dokter
            `;

            const result = await sq.query(query, s);

            res.status(200).json({
                success: true,
                date: targetDate,
                on_call: result,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 15: GET /facilities/operation-room-utilization
     * Utilisasi ruang operasi (OK)
     */
    static async getOperationRoomUtilization(req, res) {
        const { date } = req.query;
        const targetDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

        try {
            // Availability hours per room (8 hours per day)
            const availabilityHours = 8;

            const query = `
                SELECT 
                    mr.nama_ruang as room,
                    ${availabilityHours} as availability_hours,
                    COALESCE(
                        SUM(
                            EXTRACT(EPOCH FROM (
                                CASE 
                                    WHEN jo.waktu_selesai IS NOT NULL AND jo.waktu_mulai IS NOT NULL
                                    THEN (jo.waktu_selesai::time - jo.waktu_mulai::time)
                                    ELSE interval '0'
                                END
                            )) / 3600
                        ), 0
                    )::numeric as usage_hours
                FROM ms_ruang mr
                LEFT JOIN jadwal_operasi jo ON 
                    jo.ms_ruang_id = mr.id 
                    AND jo."deletedAt" IS NULL
                    AND DATE(jo.tanggal_operasi) = '${targetDate}'
                    AND jo.status IN (2, 3)
                WHERE mr."deletedAt" IS NULL
                AND mr.nama_ruang LIKE '%OK%'
                GROUP BY mr.nama_ruang, mr.id
                ORDER BY mr.nama_ruang
            `;

            const result = await sq.query(query, s);

            // Calculate utilization for each room
            const operatingRooms = result.map(item => {
                const usageHours = parseFloat(item.usage_hours || 0);
                const utilizationPercent = ((usageHours / availabilityHours) * 100).toFixed(1);

                return {
                    room: item.room,
                    availability_hours: availabilityHours,
                    usage_hours: parseFloat(usageHours.toFixed(2)),
                    utilization_percent: parseFloat(utilizationPercent)
                };
            });

            // Calculate summary
            const totalRooms = operatingRooms.length;
            const totalAvailabilityHours = totalRooms * availabilityHours;
            const totalUsageHours = operatingRooms.reduce((sum, room) => sum + room.usage_hours, 0);
            const overallUtilization = totalAvailabilityHours > 0 
                ? ((totalUsageHours / totalAvailabilityHours) * 100).toFixed(1)
                : 0;

            res.status(200).json({
                success: true,
                date: targetDate,
                operating_rooms: operatingRooms,
                summary: {
                    total_rooms: totalRooms,
                    total_availability_hours: totalAvailabilityHours,
                    total_usage_hours: parseFloat(totalUsageHours.toFixed(2)),
                    overall_utilization_percent: parseFloat(overallUtilization)
                },
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 16: GET /pharmacy/critical-stock
     * Stok obat kritis yang perlu restock
     */
    static async getCriticalStock(req, res) {
        const { threshold = 10 } = req.query;

        try {
            const minThreshold = parseInt(threshold) || 10;

            const query = `
                SELECT 
                    mb.nama_barang,
                    mb.type,
                    SUM(s.qty)::numeric as total_stock,
                    mg.nama_gudang,
                    msb.nama_satuan_barang as unit,
                    ${minThreshold} as threshold
                FROM stock s
                JOIN ms_barang mb ON mb.id = s.ms_barang_id
                JOIN ms_gudang mg ON mg.id = s.ms_gudang_id
                LEFT JOIN ms_satuan_barang msb ON msb.id = mb.ms_satuan_barang_id
                WHERE s."deletedAt" IS NULL
                AND mb."deletedAt" IS NULL
                AND mg."deletedAt" IS NULL
                GROUP BY mb.id, mb.nama_barang, mb.type, mg.nama_gudang, mg.id, msb.nama_satuan_barang
                HAVING SUM(s.qty) <= ${minThreshold}
                ORDER BY SUM(s.qty) ASC
                LIMIT 50
            `;

            const result = await sq.query(query, s);

            res.status(200).json({
                success: true,
                threshold: minThreshold,
                critical_items_count: result.length,
                critical_stock: result,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 17: GET /pharmacy/stock-value
     * Nilai total stok gudang dan potensi kadaluarsa
     */
    static async getStockValue(req, res) {
        try {
            const today = moment().format('YYYY-MM-DD');
            const thirtyDaysLater = moment().add(30, 'days').format('YYYY-MM-DD');

            // Query untuk total stock value
            const stockValueQuery = `
                SELECT 
                    mg.nama_gudang,
                    COUNT(DISTINCT mb.id)::int as total_items,
                    SUM(s.qty)::numeric as total_qty,
                    SUM(s.qty * mb.harga_pokok)::numeric as total_value
                FROM stock s
                JOIN ms_barang mb ON mb.id = s.ms_barang_id
                JOIN ms_gudang mg ON mg.id = s.ms_gudang_id
                WHERE s."deletedAt" IS NULL
                AND mb."deletedAt" IS NULL
                AND mg."deletedAt" IS NULL
                AND s.qty > 0
                GROUP BY mg.id, mg.nama_gudang
                ORDER BY total_value DESC
            `;

            const stockValueResult = await sq.query(stockValueQuery, s);

            // Query untuk expired items
            const expiredQuery = `
                SELECT 
                    mb.nama_barang,
                    mg.nama_gudang,
                    s.qty::numeric,
                    s.tgl_kadaluarsa,
                    (s.qty * mb.harga_pokok)::numeric as potential_loss,
                    CASE 
                        WHEN DATE(s.tgl_kadaluarsa) <= '${today}' THEN 'expired'
                        WHEN DATE(s.tgl_kadaluarsa) <= '${thirtyDaysLater}' THEN 'near_expiry'
                        ELSE 'safe'
                    END as status
                FROM stock s
                JOIN ms_barang mb ON mb.id = s.ms_barang_id
                JOIN ms_gudang mg ON mg.id = s.ms_gudang_id
                WHERE s."deletedAt" IS NULL
                AND mb."deletedAt" IS NULL
                AND mg."deletedAt" IS NULL
                AND s.tgl_kadaluarsa IS NOT NULL
                AND DATE(s.tgl_kadaluarsa) <= '${thirtyDaysLater}'
                AND s.qty > 0
                ORDER BY s.tgl_kadaluarsa ASC
                LIMIT 50
            `;

            const expiredResult = await sq.query(expiredQuery, s);

            // Calculate totals
            const totalStockValue = stockValueResult.reduce((sum, item) => 
                sum + parseFloat(item.total_value || 0), 0
            );

            const totalPotentialLoss = expiredResult.reduce((sum, item) => 
                sum + parseFloat(item.potential_loss || 0), 0
            );

            res.status(200).json({
                success: true,
                stock_by_warehouse: stockValueResult.map(item => ({
                    warehouse: item.nama_gudang,
                    total_items: item.total_items,
                    total_qty: parseFloat(item.total_qty || 0),
                    total_value: parseFloat(item.total_value || 0)
                })),
                total_stock_value: totalStockValue,
                expiry_warning: {
                    items_count: expiredResult.length,
                    potential_loss: totalPotentialLoss,
                    items: expiredResult.map(item => ({
                        item: item.nama_barang,
                        warehouse: item.nama_gudang,
                        qty: parseFloat(item.qty || 0),
                        expiry_date: item.tgl_kadaluarsa,
                        potential_loss: parseFloat(item.potential_loss || 0),
                        status: item.status
                    }))
                },
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 18: GET /pharmacy/top-medicines
     * Top 10 obat yang paling banyak digunakan
     */
    static async getTopMedicines(req, res) {
        const { days = 30 } = req.query;

        try {
            const daysCount = parseInt(days) || 30;
            const startDate = moment().subtract(daysCount - 1, 'days').format('YYYY-MM-DD');
            const endDate = moment().format('YYYY-MM-DD');

            const query = `
                SELECT 
                    mb.nama_barang as medicine,
                    mb.type,
                    SUM(pb.qty_barang)::int as total_qty,
                    COUNT(DISTINCT p.registrasi_id)::int as total_patients,
                    msb.nama_satuan_barang as unit
                FROM penjualan_barang pb
                JOIN penjualan p ON p.id = pb.penjualan_id
                JOIN ms_barang mb ON mb.id = pb.ms_barang_id
                LEFT JOIN ms_satuan_barang msb ON msb.id = mb.ms_satuan_barang_id
                WHERE pb."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                AND mb."deletedAt" IS NULL
                AND DATE(p.tgl_penjualan) BETWEEN '${startDate}' AND '${endDate}'
                AND p.status_penjualan IN (2, 3)
                AND mb.type = 'OBAT'
                GROUP BY mb.id, mb.nama_barang, mb.type, msb.nama_satuan_barang
                ORDER BY SUM(pb.qty_barang) DESC
                LIMIT 10
            `;

            const result = await sq.query(query, s);

            res.status(200).json({
                success: true,
                period_days: daysCount,
                start_date: startDate,
                end_date: endDate,
                top_medicines: result,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

    /**
     * API 19: GET /pharmacy/stock-movement
     * Monitoring pergerakan barang masuk/keluar
     */
    static async getStockMovement(req, res) {
        const { range = 'monthly' } = req.query;

        try {
            if (!['daily', 'weekly', 'monthly'].includes(range)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid range parameter. Must be: daily, weekly, or monthly",
                    code: 400
                });
            }

            let startDate, endDate;
            if (range === 'daily') {
                startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
                endDate = moment().format('YYYY-MM-DD');
            } else if (range === 'weekly') {
                startDate = moment().subtract(3, 'weeks').startOf('week').format('YYYY-MM-DD');
                endDate = moment().endOf('week').format('YYYY-MM-DD');
            } else {
                startDate = moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');
                endDate = moment().endOf('month').format('YYYY-MM-DD');
            }

            // Query untuk stock in (pembelian)
            const stockInQuery = `
                SELECT 
                    TO_CHAR(DATE(s.tgl_masuk), 'YYYY-MM-DD') as date,
                    COUNT(DISTINCT s.id)::int as items_count,
                    SUM(s.qty)::numeric as total_qty_in
                FROM stock s
                WHERE s."deletedAt" IS NULL
                AND DATE(s.tgl_masuk) BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY DATE(s.tgl_masuk)
                ORDER BY DATE(s.tgl_masuk)
            `;

            // Query untuk stock out (penjualan)
            const stockOutQuery = `
                SELECT 
                    TO_CHAR(DATE(p.tgl_penjualan), 'YYYY-MM-DD') as date,
                    COUNT(DISTINCT pb.id)::int as items_count,
                    SUM(pb.qty_barang)::numeric as total_qty_out
                FROM penjualan_barang pb
                JOIN penjualan p ON p.id = pb.penjualan_id
                WHERE pb."deletedAt" IS NULL
                AND p."deletedAt" IS NULL
                AND DATE(p.tgl_penjualan) BETWEEN '${startDate}' AND '${endDate}'
                AND p.status_penjualan IN (2, 3)
                GROUP BY DATE(p.tgl_penjualan)
                ORDER BY DATE(p.tgl_penjualan)
            `;

            const stockInResult = await sq.query(stockInQuery, s);
            const stockOutResult = await sq.query(stockOutQuery, s);

            // Merge data
            const movementMap = {};
            
            stockInResult.forEach(item => {
                if (!movementMap[item.date]) {
                    movementMap[item.date] = { date: item.date, in: 0, out: 0, in_items: 0, out_items: 0 };
                }
                movementMap[item.date].in = parseFloat(item.total_qty_in || 0);
                movementMap[item.date].in_items = item.items_count;
            });

            stockOutResult.forEach(item => {
                if (!movementMap[item.date]) {
                    movementMap[item.date] = { date: item.date, in: 0, out: 0, in_items: 0, out_items: 0 };
                }
                movementMap[item.date].out = parseFloat(item.total_qty_out || 0);
                movementMap[item.date].out_items = item.items_count;
            });

            const movement = Object.values(movementMap).sort((a, b) => 
                a.date.localeCompare(b.date)
            );

            // Calculate totals
            const totalIn = movement.reduce((sum, item) => sum + item.in, 0);
            const totalOut = movement.reduce((sum, item) => sum + item.out, 0);

            res.status(200).json({
                success: true,
                range: range,
                start_date: startDate,
                end_date: endDate,
                summary: {
                    total_in: totalIn,
                    total_out: totalOut,
                    net_movement: totalIn - totalOut
                },
                movement: movement,
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                code: 500
            });
        }
    }

}

module.exports = Controller;
