const IntraOperasi = require('./model');
const JadwalOperasi = require('../jadwal_operasi/model');
const msDokter = require('../ms_dokter/model');
const { v4: uuid_v4 } = require('uuid');
const moment = require('moment');
const { Op } = require('sequelize');

class Controller {
  static async register(req, res) {
    try {
      const {
        jadwal_operasi_id,
        waktu_mulai,
        waktu_selesai,
        posisi_operasi,
        jenis_anestesi,
        tekanan_darah_awal,
        tekanan_darah_akhir,
        nadi_awal,
        nadi_akhir,
        saturasi_o2,
        suhu_tubuh,
        volume_cairan_masuk,
        volume_cairan_keluar,
        jumlah_darah,
        komplikasi_intra,
        tindakan_intra,
        operator_utama_id,
        catatan_perawat
      } = req.body;

      if (!jadwal_operasi_id || !waktu_mulai) {
        return res.status(200).json({ status: 400, message: 'jadwal_operasi_id dan waktu_mulai wajib diisi' });
      }

      if (waktu_selesai && moment(waktu_selesai).isBefore(moment(waktu_mulai))) {
        return res.status(200).json({ status: 400, message: 'waktu_selesai tidak boleh sebelum waktu_mulai' });
      }

      const data = await IntraOperasi.create({
        id: uuid_v4(),
        jadwal_operasi_id,
        waktu_mulai,
        waktu_selesai: waktu_selesai || null,
        posisi_operasi,
        jenis_anestesi,
        tekanan_darah_awal,
        tekanan_darah_akhir,
        nadi_awal,
        nadi_akhir,
        saturasi_o2,
        suhu_tubuh,
        volume_cairan_masuk,
        volume_cairan_keluar,
        jumlah_darah,
        komplikasi_intra,
        tindakan_intra,
        operator_utama_id,
        catatan_perawat
      });

      res.status(200).json({ status: 200, message: 'sukses', data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: 'gagal', data: error });
    }
  }

  static async update(req, res) {
    try {
      const {
        id,
        jadwal_operasi_id,
        waktu_mulai,
        waktu_selesai,
        posisi_operasi,
        jenis_anestesi,
        tekanan_darah_awal,
        tekanan_darah_akhir,
        nadi_awal,
        nadi_akhir,
        saturasi_o2,
        suhu_tubuh,
        volume_cairan_masuk,
        volume_cairan_keluar,
        jumlah_darah,
        komplikasi_intra,
        tindakan_intra,
        operator_utama_id,
        catatan_perawat
      } = req.body;

      if (!id) {
        return res.status(200).json({ status: 400, message: 'id wajib diisi' });
      }

      if (waktu_mulai && waktu_selesai && moment(waktu_selesai).isBefore(moment(waktu_mulai))) {
        return res.status(200).json({ status: 400, message: 'waktu_selesai tidak boleh sebelum waktu_mulai' });
      }

      const [count] = await IntraOperasi.update(
        {
          jadwal_operasi_id,
          waktu_mulai,
          waktu_selesai,
          posisi_operasi,
          jenis_anestesi,
          tekanan_darah_awal,
          tekanan_darah_akhir,
          nadi_awal,
          nadi_akhir,
          saturasi_o2,
          suhu_tubuh,
          volume_cairan_masuk,
          volume_cairan_keluar,
          jumlah_darah,
          komplikasi_intra,
          tindakan_intra,
          operator_utama_id,
          catatan_perawat
        },
        { where: { id } }
      );

      if (!count) {
        return res.status(200).json({ status: 404, message: 'data tidak ditemukan' });
      }

      res.status(200).json({ status: 200, message: 'sukses' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: 'gagal', data: error });
    }
  }

  static async list(req, res) {
    try {
      const {
        halaman = 1,
        jumlah = 10,
        jadwal_operasi_id,
        operator_utama_id,
        start_date, // filter waktu_mulai >= start_date
        end_date // filter waktu_mulai <= end_date
      } = req.body;

      const where = {};

      if (jadwal_operasi_id) where.jadwal_operasi_id = jadwal_operasi_id;
      if (operator_utama_id) where.operator_utama_id = operator_utama_id;

      if (start_date && end_date) {
        where.waktu_mulai = { [Op.between]: [start_date, end_date] };
      } else if (start_date) {
        where.waktu_mulai = { [Op.gte]: start_date };
      } else if (end_date) {
        where.waktu_mulai = { [Op.lte]: end_date };
      }

      const offset = (Number(halaman) - 1) * Number(jumlah);
      const limit = Number(jumlah);

      const [data, count] = await Promise.all([
        IntraOperasi.findAll({
          where,
          include: [
            { model: JadwalOperasi, as: 'jadwal_operasi' },
            { model: msDokter, as: 'operator_utama' }
          ],
          order: [['createdAt', 'DESC']],
          limit,
          offset
        }),
        IntraOperasi.count({ where })
      ]);

      res.status(200).json({ status: 200, message: 'sukses', data, count, jumlah: limit, halaman: Number(halaman) });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: 'gagal', data: error });
    }
  }

  static async detailsById(req, res) {
    try {
      const { id } = req.body;
      if (!id) return res.status(200).json({ status: 400, message: 'id wajib diisi' });

      const data = await IntraOperasi.findByPk(id, {
        include: [
          { model: JadwalOperasi, as: 'jadwal_operasi' },
          { model: msDokter, as: 'operator_utama' }
        ]
      });

      if (!data) {
        return res.status(200).json({ status: 404, message: 'data tidak ditemukan' });
      }

      res.status(200).json({ status: 200, message: 'sukses', data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: 'gagal', data: error });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.body;
      if (!id) return res.status(200).json({ status: 400, message: 'id wajib diisi' });

      const count = await IntraOperasi.destroy({ where: { id } });
      if (!count) {
        return res.status(200).json({ status: 404, message: 'data tidak ditemukan' });
      }

      res.status(200).json({ status: 200, message: 'sukses' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: 'gagal', data: error });
    }
  }
}

module.exports = Controller;