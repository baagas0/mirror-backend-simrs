const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { permintaanKotor, permintaanKotorList } = require("./model");
const users = require("../users/model");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');

class Controller {

    static async register(req, res) {
        const { nama_unit, tanggal_permintaan, keterangan, items } = req.body;

        try {
            // Generate unique kode_permintaan
            const today = moment().format('YYYYMMDD');
            const prefix = `PK-${today}`;

            // Get last kode for today
            const lastRequest = await permintaanKotor.findOne({
                where: {
                    kode_permintaan: {
                        [Op.like]: `${prefix}%`
                    }
                },
                order: [['kode_permintaan', 'DESC']]
            });

            let sequence = '001';
            if (lastRequest) {
                const lastSequence = parseInt(lastRequest.kode_permintaan.split('-')[2]);
                sequence = String(lastSequence + 1).padStart(3, '0');
            }

            const kode_permintaan = `${prefix}-${sequence}`;

            // Create permintaan_kotor
            
            const permintaan = await permintaanKotor.create({
                id: uuid_v4(),
                kode_permintaan,
                nama_unit,
                tanggal_permintaan,
                status_permintaan: 1,
                keterangan,
                created_by: req.dataUsers.id,
                updated_by: req.dataUsers.id
            });

            // Create permintaan_kotor_list items if provided
            if (items && items.length > 0) {
                const listItems = items.map(item => ({
                    id: uuid_v4(),
                    permintaan_kotor_id: permintaan.id,
                    ms_barang_id: item.ms_barang_id,
                    jumlah: item.jumlah || 1,
                    keterangan: item.keterangan || null,
                    created_by: req.dataUsers.id,
                    updated_by: req.dataUsers.id
                }));

                await permintaanKotorList.bulkCreate(listItems);
            }

            // Get created data with relationships
            const createdData = await permintaanKotor.findOne({
                where: { id: permintaan.id },
                include: [
                    // {
                    //     model: users,
                    //     as: 'user_created',
                    //     attributes: ['id', 'nama']
                    // },
                    // {
                    //     model: permintaanKotorList,
                    //     as: 'items',
                    //     include: [{
                    //         model: require('../ms_barang/model'),
                    //         attributes: ['id', 'nama_barang']
                    //     }]
                    // }
                ]
            });

            res.status(200).json({ status: 200, message: "sukses", data: createdData });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async update(req, res) {
        const { id, nama_unit, tanggal_permintaan, status_permintaan, keterangan, items } = req.body;

        try {
            // Check if exists
            const existingPermintaan = await permintaanKotor.findOne({ where: { id } });
            if (!existingPermintaan) {
                return res.status(404).json({ status: 404, message: "data tidak ditemukan" });
            }

            // Update permintaan_kotor
            await permintaanKotor.update({
                nama_unit,
                tanggal_permintaan,
                status_permintaan,
                keterangan,
                updated_by: req.users.id
            }, { where: { id } });

            // Update items if provided
            if (items && items.length > 0) {
                // Delete existing items
                await permintaanKotorList.destroy({ where: { permintaan_kotor_id: id } });

                // Create new items
                const listItems = items.map(item => ({
                    id: uuid_v4(),
                    permintaan_kotor_id: id,
                    ms_barang_id: item.ms_barang_id,
                    jumlah: item.jumlah || 1,
                    keterangan: item.keterangan || null,
                    created_by: req.users.id,
                    updated_by: req.users.id
                }));

                await permintaanKotorList.bulkCreate(listItems);
            }

            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async delete(req, res) {
        const { id } = req.body;

        try {
            const existingPermintaan = await permintaanKotor.findOne({ where: { id } });
            if (!existingPermintaan) {
                return res.status(404).json({ status: 404, message: "data tidak ditemukan" });
            }

            await permintaanKotor.update({
                deleted_by: req.users.id,
                deletedAt: new Date()
            }, { where: { id } });

            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async list(req, res) {
        const { halaman, jumlah, nama_unit, status_permintaan, tanggal_permintaan, search, diterima_unit_cssd } = req.body;

        try {
            let whereClause = 'where pk."deletedAt" isnull ';
            let pagination = '';

            // Pagination
            if (halaman && jumlah) {
                const offset = (+halaman - 1) * jumlah;
                pagination = `limit ${jumlah} offset ${offset}`;
            }

            // Filters
            if (nama_unit) {
                whereClause += `and pk.nama_unit ilike '%${nama_unit}%' `;
            }
            if (status_permintaan) {
                whereClause += `and pk.status_permintaan = ${status_permintaan} `;
            }
            if (diterima_unit_cssd) {
                whereClause += `and pk.status_permintaan >= 2 `;
            }
            if (tanggal_permintaan) {
                whereClause += `and pk.tanggal_permintaan = '${tanggal_permintaan}' `;
            }
            if (search) {
                whereClause += `and (pk.nama_unit ilike '%${search}%' or pk.kode_permintaan ilike '%${search}%' or pk.keterangan ilike '%${search}%') `;
            }

            // Query data
            let data = await sq.query(`
                select
                    pk.*,
                    uc.username as created_by_name,
                    uu.username as updated_by_name,
                    case
                        when pk.status_permintaan = 1 then 'Menunggu'
                        when pk.status_permintaan = 2 then 'Diambil'
                        when pk.status_permintaan = 3 then 'Proses Sterilisasi'
                        when pk.status_permintaan = 4 then 'Selesai'
                        else 'Unknown'
                    end as status_permintaan_text
                from permintaan_kotor pk
                left join users uc on uc.id = pk.created_by
                left join users uu on uu.id = pk.updated_by
                ${whereClause}
                order by pk."createdAt" desc
                ${pagination}
            `, s);

            // Get total count
            let countQuery = await sq.query(`
                select count(*) as total
                from permintaan_kotor pk
                ${whereClause}
            `, s);

            // Get items for each permintaan
            let dataWithItems = [];
            for (let i = 0; i < data.length; i++) {
                let items = await sq.query(`
                    select
                        pkl.*,
                        mb.nama_barang,
                        mb.kode_produk
                    from permintaan_kotor_list pkl
                    join ms_barang mb on mb.id = pkl.ms_barang_id
                    where pkl.permintaan_kotor_id = '${data[i].id}' and pkl."deletedAt" is null
                    order by pkl."createdAt" asc
                `, s);

                dataWithItems.push({
                    ...data[i],
                    items: items
                });
            }

            res.status(200).json({
                status: 200,
                message: "sukses",
                data: dataWithItems,
                count: countQuery[0].total,
                jumlah,
                halaman
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async detailsById(req, res) {
        const { id } = req.body;

        try {
            // Get main data
            let permintaan = await sq.query(`
                select
                    pk.*,
                    uc.username as created_by_name,
                    uu.username as updated_by_name,
                    case
                        when pk.status_permintaan = 1 then 'Menunggu'
                        when pk.status_permintaan = 2 then 'Diambil'
                        when pk.status_permintaan = 3 then 'Proses Sterilisasi'
                        when pk.status_permintaan = 4 then 'Selesai'
                        else 'Unknown'
                    end as status_permintaan_text
                from permintaan_kotor pk
                left join users uc on uc.id = pk.created_by
                left join users uu on uu.id = pk.updated_by
                where pk.id = '${id}' and pk."deletedAt" isnull
            `, s);

            if (permintaan.length === 0) {
                return res.status(404).json({ status: 404, message: "data tidak ditemukan" });
            }

            // Get items
            let items = await sq.query(`
                select
                    pkl.*,
                    mb.nama_barang,
                    mb.kode_produk
                from permintaan_kotor_list pkl
                join ms_barang mb on mb.id = pkl.ms_barang_id
                where pkl.permintaan_kotor_id = '${id}' and pkl."deletedAt" isnull
                order by pkl."createdAt" asc
            `, s);

            const result = permintaan[0];
            result.items = items;

            res.status(200).json({ status: 200, message: "sukses", data: result });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async updateStatus(req, res) {
        const { id, status_permintaan } = req.body;

        try {
            const existingPermintaan = await permintaanKotor.findOne({ where: { id } });
            if (!existingPermintaan) {
                return res.status(404).json({ status: 404, message: "data tidak ditemukan" });
            }

            await permintaanKotor.update({
                status_permintaan,
                updated_by: req.dataUsers.id
            }, { where: { id } });

            res.status(200).json({ status: 200, message: "sukses" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async getItems(req, res) {
        const { permintaan_kotor_id } = req.body;

        try {
            let items = await sq.query(`
                select
                    pkl.*,
                    mb.nama_barang,
                    mb.kode_produk
                from permintaan_kotor_list pkl
                join ms_barang mb on mb.id = pkl.ms_barang_id
                where pkl.permintaan_kotor_id = '${permintaan_kotor_id}' and pkl."deletedAt" isnull
                order by pkl."createdAt" asc
            `, s);

            res.status(200).json({ status: 200, message: "sukses", data: items });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }

    static async dashboard(req, res) {
        try {
            // Get statistics
            let stats = await sq.query(`
                select
                    count(*) as total,
                    count(case when status_permintaan = 1 then 1 end) as menunggu,
                    count(case when status_permintaan = 2 then 1 end) as diambil,
                    count(case when status_permintaan = 3 then 1 end) as proses_sterilisasi,
                    count(case when status_permintaan = 4 then 1 end) as selesai
                from permintaan_kotor
                where "deletedAt" isnull
            `, s);

            // Get today's requests
            let todayRequests = await sq.query(`
                select
                    count(*) as total_today
                from permintaan_kotor
                where "deletedAt" isnull
                and date(tanggal_permintaan) = current_date
            `, s);

            // Get this month's requests
            let monthRequests = await sq.query(`
                select
                    count(*) as total_month
                from permintaan_kotor
                where "deletedAt" isnull
                and extract(month from tanggal_permintaan) = extract(month from current_date)
                and extract(year from tanggal_permintaan) = extract(year from current_date)
            `, s);

            const result = {
                ...stats[0],
                ...todayRequests[0],
                ...monthRequests[0]
            };

            res.status(200).json({ status: 200, message: "sukses", data: result });
        } catch (err) {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err.message });
        }
    }
}

module.exports = Controller;