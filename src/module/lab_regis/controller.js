const { labRegis, labPengambilanSampel } = require("../../models");
const { sq } = require("../../config/connection");
const { QueryTypes, Op } = require("sequelize");
const s = { type: QueryTypes.SELECT };
const { v4: uuid_v4 } = require("uuid");
const msDokter = require("../ms_dokter/model");
const labHasil = require("../lab_hasil/model");
const labPaketList = require("../lab_paket_list/model");
const labPaket = require("../lab_paket/model");
const penunjang = require("../penunjang/model");
const penjualan_penunjang = require("../penjualan_penunjang/model");
const { axios_satu_sehat } = require("../../helper/axios_satu_sehat");
const registrasi = require("../registrasi/model");
const pasien = require("../pasien/model");
const ExcelJS = require('exceljs');

class Controller {
  static register(req, res) {
    labRegis
      .create({ id: uuid_v4(), ...req.body })
      .then((hasil) => {
        res.status(200).json({ status: 200, message: "sukses", data: hasil });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      });
  }

  static async update(req, res) {
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.deletedAt;
    delete req.body.satu_sehat_puasa_id;
    delete req.body.satu_sehat_service_request_id;
    delete req.body.satu_sehat_specimen_id;
    delete req.body.satu_sehat_o_natrium_id;
    delete req.body.satu_sehat_o_chloride_id;
    delete req.body.satu_sehat_o_kalium_id;
    delete req.body.satu_sehat_report_id;
    try {
      const hasil = await labRegis.update(
        { ...req.body },
        { where: { id: req.body.id } }
      );
      console.log(hasil);
      const org_id = process.env.SATU_SEHAT_ORGANIZATION_ID;

      // sync satu sehat
      const lab = await labRegis.findOne({
        where: { id: req.body.id },
        include: [{ model: registrasi, include: [pasien, msDokter] }],
      });
      const nama_dokter = lab.registrasi.ms_dokter
        ? lab.registrasi.ms_dokter.nama_dokter
        : "";
      const nama_pasien = lab.registrasi.pasien
        ? lab.registrasi.pasien.nama_pasien
        : "";
      const pasien_id = lab.registrasi.pasien
        ? lab.registrasi.pasien.satu_sehat_id
        : "";
      const dokter_id = lab.registrasi.ms_dokter
        ? lab.registrasi.ms_dokter.satu_sehat_id
        : "";
      const encounter_id = lab.registrasi ? lab.registrasi.satu_sehat_id : "";
      const performedPeriod = new Date(lab.createdAt);
      const nowPeriod = new Date();

      let satu_sehat_puasa_id = lab.satu_sehat_puasa_id;

      if (
        lab.registrasi.satu_sehat_id &&
        lab.registrasi.pasien &&
        lab.registrasi.ms_dokter
      ) {
        if (!satu_sehat_puasa_id) {
          const puasa = {
            resourceType: "Procedure",
            status: lab.is_puasa ? "completed" : "not-done",
            category: {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: "103693007",
                  display: "Diagnostic procedure",
                },
              ],
              text: "Prosedur diagnostik",
            },
            code: {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: "792805006",
                  display: "Fasting",
                },
              ],
            },
            subject: {
              reference: `Patient/${pasien_id}`,
              display: `${nama_pasien}`,
            },
            encounter: {
              reference: `Encounter/${lab.registrasi.satu_sehat_id}`, //satu_sehat_id dari encounter
            },
            performedPeriod: {
              start: performedPeriod.toISOString(),
              end: performedPeriod.toISOString(),
            },
            performer: [
              {
                actor: {
                  reference: `Practitioner/${dokter_id}`,
                  display: `${nama_dokter}`,
                },
              },
            ],
            note: [
              {
                text: lab.is_puasa
                  ? "Pasien berpuasa 8 jam sebelum pengambilan sampel"
                  : "Pasien tidak perlu berpuasa terlebih dahulu",
              },
            ],
          };
          let hasil = await axios_satu_sehat("post", "Procedure", puasa, {});
          console.log("hasil_puasa", hasil);
          satu_sehat_puasa_id = hasil.data.data.id || hasil.data.id;
          await labRegis.update(
            { satu_sehat_puasa_id: hasil.data.data.id || hasil.data.id },
            { where: { id: req.body.id } }
          );
        }
        if (!lab.satu_sehat_service_request_id) {
          console.log("buat service request");
          let list_lab_paket = lab.list_lab_paket ? lab.list_lab_paket : [];
          for (let item of list_lab_paket) {
            if (item && item.kode_loinc) {
              const service_request = {
                resourceType: "ServiceRequest",
                identifier: [
                  {
                    system: `http://sys-ids.kemkes.go.id/servicerequest/${org_id}`,
                    value: "00001",
                  },
                ],
                status: "active",
                intent: "original-order",
                priority: "routine",
                category: [
                  {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "108252007",
                        display: "Laboratory procedure",
                      },
                    ],
                  },
                ],
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: item.kode_loinc,
                      display: item.nama_lab_paket,
                    },
                    // {
                    //   "system": "http://terminology.kemkes.go.id/CodeSystem/kptl",
                    //   "code": item.kode_kptl,
                    //   "display": item.nama_lab_paket
                    // }
                  ],
                  text: item.nama_lab_paket,
                },
                subject: {
                  reference: `Patient/${pasien_id}`,
                },
                encounter: {
                  reference: `Encounter/${encounter_id}`,
                },
                occurrenceDateTime: performedPeriod.toISOString(),
                authoredOn: nowPeriod.toISOString(),
                requester: {
                  reference: `Practitioner/${dokter_id}`,
                  display: `${nama_dokter}`,
                },
                performer: [
                  {
                    reference: `Practitioner/${dokter_id}`,
                    display: `${nama_dokter}`,
                  },
                ],
                reasonCode: [
                  {
                    text: `Paket pemeriksaan ${item.nama_lab_paket}`,
                  },
                ],
                note: [
                  {
                    text: lab.is_puasa
                      ? "Pasien berpuasa 8 jam sebelum pengambilan sampel"
                      : "Pasien tidak perlu berpuasa terlebih dahulu",
                  },
                ],
                supportingInfo: [
                  {
                    reference: `Procedure/${satu_sehat_puasa_id}`,
                  },
                ],
              };

              let hasil = await axios_satu_sehat(
                "post",
                "ServiceRequest",
                service_request,
                {}
              );
              item.satu_sehat_service_request_id =
                hasil.data?.data?.id || hasil.data.id;
              console.log("update service request id", item);
            }
          }

          console.log("RESULT------------------");
          console.log(list_lab_paket);
          await labRegis.update(
            { list_lab_paket },
            { where: { id: req.body.id } }
          );
        }
      }
      res.status(200).json({ status: 200, message: "sukses" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async updateSampel(req, res) {
    const { id, tanggal_ambil_sampel, status } = req.body;

    try {
      await labRegis.update(
        { tanggal_ambil_sampel, status },
        { where: { id } }
      );
      const lab = await labRegis.findOne({
        where: { id: req.body.id },
        include: [{ model: registrasi, include: [pasien, msDokter] }],
      });
      const nama_dokter = lab.registrasi.ms_dokter ? lab.registrasi.ms_dokter.nama_dokter : "";
      const nama_pasien = lab.registrasi.pasien ? lab.registrasi.pasien.nama_pasien : "";
      const pasien_id = lab.registrasi.pasien ? lab.registrasi.pasien.satu_sehat_id : "";
      const dokter_id = lab.registrasi.ms_dokter ? lab.registrasi.ms_dokter.satu_sehat_id : "";
      let list_lab_paket = lab.list_lab_paket ? lab.list_lab_paket : [];
      const dateSample = new Date(tanggal_ambil_sampel);
      for (let item of list_lab_paket) {
        if (item.satu_sehat_service_request_id) {
          const org_id = process.env.SATU_SEHAT_ORGANIZATION_ID;
          const specimen = {
            resourceType: "Specimen",
            identifier: [
              {
                system: `http://sys-ids.kemkes.go.id/specimen/${org_id}`,
                value: "00001",
                assigner: {
                  reference: `Organization/${org_id}`
                }
              }
            ],
            status: "available",
            type: {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: "119297000",
                  display: "Blood specimen (specimen)"
                }
              ]
            },
            subject: {
              reference: `Patient/${pasien_id}`,
              display: `${nama_pasien}`
            },
            request: [
              {
                reference: `ServiceRequest/${item.satu_sehat_service_request_id}`
              }
            ],
            receivedTime: dateSample.toISOString()
          };
          let hasil = await axios_satu_sehat(
            "post",
            "Specimen",
            specimen,
            {}
          );
          console.log("hasil_specimen", hasil.data);
          item.satu_sehat_specimen_id = hasil.data?.data?.id || hasil.data.id;
        }
      }
      console.log("RESULT------------------");
      console.log(list_lab_paket);
      await labRegis.update(
        { list_lab_paket },
        { where: { id: req.body.id } }
      );

      res.status(200).json({ status: 200, message: "sukses" });
    } catch (err) {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  // Fungsi baru untuk mendapatkan pengambilan sampel berdasarkan lab_regis_id
  static async getPengambilanSampelByLabRegis(req, res) {
    const { lab_regis_id } = req.params;

    try {
      const pengambilanSampels = await labPengambilanSampel.findAll({
        where: { lab_regis_id },
        include: ['petugasAmbil'],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        status: 200,
        message: "sukses",
        data: pengambilanSampels
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      });
    }
  }

  // Fungsi baru untuk membuat pengambilan sampel langsung dari lab_regis
  static async createPengambilanSampel(req, res) {
    const { id } = req.params;
    const {
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

    try {
      // Cek apakah lab_regis ada
      const labReg = await labRegis.findByPk(id);
      if (!labReg) {
        return res.status(404).json({
          status: 404,
          message: "Pendaftaran lab tidak ditemukan"
        });
      }

      // Cek apakah sudah ada pengambilan sampel yang aktif
      const existingPengambilan = await labPengambilanSampel.findOne({
        where: {
          lab_regis_id: id,
          status_pengambilan: [0, 1] // pending atau sedang diambil
        }
      });

      if (existingPengambilan) {
        return res.status(400).json({
          status: 400,
          message: "Sudah ada proses pengambilan sampel yang aktif"
        });
      }

      const pengambilanSampelId = uuid_v4();
      const pengambilanSampel = await labPengambilanSampel.create({
        id: pengambilanSampelId,
        lab_regis_id: id,
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

      res.status(201).json({
        status: 201,
        message: "Pengambilan sampel berhasil dibuat",
        data: pengambilanSampel
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      });
    }
  }

  // Fungsi baru untuk memulai pengambilan sampel
  static async startPengambilanSampel(req, res) {
    const { id } = req.params;
    const { pengambilan_sampel_id, petugas_ambil_id } = req.body;

    try {
      const pengambilanSampel = await labPengambilanSampel.findByPk(pengambilan_sampel_id);
      if (!pengambilanSampel) {
        return res.status(404).json({
          status: 404,
          message: "Pengambilan sampel tidak ditemukan"
        });
      }

      if (pengambilanSampel.lab_regis_id !== id) {
        return res.status(400).json({
          status: 400,
          message: "Pengambilan sampel tidak terkait dengan pendaftaran lab ini"
        });
      }

      if (pengambilanSampel.status_pengambilan !== 0) {
        return res.status(400).json({
          status: 400,
          message: "Status pengambilan tidak valid untuk memulai"
        });
      }

      await pengambilanSampel.update({
        status_pengambilan: 1, // sedang diambil
        waktu_mulai: new Date(),
        petugas_ambil_id
      });

      // Update status lab_regis ke 1 (proses)
      await labRegis.update(
        { status: 1 },
        { where: { id } }
      );

      res.status(200).json({
        status: 200,
        message: "Pengambilan sampel dimulai",
        data: pengambilanSampel
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      });
    }
  }

  // Fungsi baru untuk menyelesaikan pengambilan sampel
  static async finishPengambilanSampel(req, res) {
    const { id } = req.params;
    const {
      pengambilan_sampel_id,
      volume_sampel,
      kondisi_sampel,
      lokasi_ambil,
      tipe_sampel,
      no_rak,
      suhu_penyimpanan,
      catatan_pengambilan,
      keterangan
    } = req.body;

    try {
      const pengambilanSampel = await labPengambilanSampel.findByPk(pengambilan_sampel_id);
      if (!pengambilanSampel) {
        return res.status(404).json({
          status: 404,
          message: "Pengambilan sampel tidak ditemukan"
        });
      }

      if (pengambilanSampel.lab_regis_id !== id) {
        return res.status(400).json({
          status: 400,
          message: "Pengambilan sampel tidak terkait dengan pendaftaran lab ini"
        });
      }

      if (pengambilanSampel.status_pengambilan !== 1) {
        return res.status(400).json({
          status: 400,
          message: "Status pengambilan tidak valid untuk menyelesaikan"
        });
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
        { where: { id } }
      );

      res.status(200).json({
        status: 200,
        message: "Pengambilan sampel selesai",
        data: pengambilanSampel
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "gagal",
        data: error
      });
    }
  }

  static async list(req, res) {
    const { tanggal_request, no_rm, registrasi_id, halaman, jumlah } = req.body;
    let offset = "";
    let pagination = "";

    if (halaman && jumlah) {
      offset = (+halaman - 1) * jumlah;
      pagination = `limit ${jumlah} offset ${offset}`;
    }

    try {
      let cond = "";

      // Static condition
      cond += ' lr."deletedAt" isnull and md."deletedAt" isnull ';

      if (tanggal_request)
        cond += ` and lr.tanggal_request::date = '${tanggal_request}' `;
      if (no_rm) cond += ` and p.no_rm = '${no_rm}' `;
      if (registrasi_id) cond += ` and lr.registrasi_id = '${registrasi_id}' `;

      let data = await sq.query(
        `select lr.id as id_lab_regis, *, lr."createdAt" as "createdAt", (SELECT COUNT(*) FROM lab_hasil WHERE lab_regis_id = lr.id) as tot_lab_hasil 
            from lab_regis lr
            left join ms_dokter md on md.id=lr.dokter_id
            left join registrasi r on r.id=lr.registrasi_id
            left join pasien p on p.id = r.pasien_id
            left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where ${cond} order by lr."createdAt" desc ${pagination}`,
        s
      );

      let jml = await sq.query(
        `select count(*)
            from lab_regis lr
            left join ms_dokter md on md.id=lr.dokter_id
            left join registrasi r on r.id=lr.registrasi_id
            left join pasien p on p.id = r.pasien_id
            left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where ${cond}`,
        s
      );
      // console.log(data);
      res
        .status(200)
        .json({
          status: 200,
          message: "sukses",
          data,
          count: jml[0].count,
          jumlah,
          halaman,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async detailsById(req, res) {
    const { id } = req.body;
    try {
      let data = await sq.query(
        `select lr.id as id_lab_regis, * from lab_regis lr
            left join ms_dokter md on md.id=lr.dokter_id
            left join registrasi r on r.id=lr.registrasi_id
            left join pasien p on p.id = r.pasien_id
            left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
            where lr."deletedAt" isnull and md."deletedAt" isnull and lr.id = '${id}'`,
        s
      );
      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (error) {
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
  static delete(req, res) {
    const { id } = req.body;
    labRegis
      .destroy({ where: { id } })
      .then((hasil) => {
        res.status(200).json({ status: 200, message: "sukses" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      });
  }

  static async createLabHasil(req, res) {
    const t = await sq.transaction();
    const { id, forceUpdate } = req.body;
    try {
      //buat ambil penjualan id
      //select pj.id as penjualan_id, lr.id as lab_regis_id from lab_regis lr join registrasi r on lr.registrasi_id = r.id join penjualan pj on r.id = pj.registrasi_id where lr.id='0f9c39c7-0f84-4fa0-8339-4b7784a5da85'
      //check labHasil exist
      let getId =
        await sq.query(`select pj.id as penjualan_id, lr.id as lab_regis_id,mt.id as ms_tarif_id, mh.id as ms_harga_id  from lab_regis lr
            join registrasi r on lr.registrasi_id = r.id
            join penjualan pj on r.id = pj.registrasi_id
            join kelas_kunjungan kk on kk.id = r.kelas_kunjungan_id
            join ms_tarif mt on mt.id = kk.ms_tarif_id
            join ms_asuransi ma on ma.id = r.ms_asuransi_id
            join ms_harga mh on mh.id = ma.ms_harga_id
            where lr.id='${id}' `);
      // console.log(getId[0]);
      const checkLabHasil = await labHasil.findAll({
        where: { lab_regis_id: id },
      });
      if (checkLabHasil.length > 0 && !forceUpdate) {
        return res
          .status(500)
          .json({ status: 500, message: "gagal", data: "labHasil sudah ada" });
      }
      const dataLabRegis = await labRegis.findOne({ where: { id } });
      let labHasilBulk = [];
      let penjualan = [];
      for (let item of dataLabRegis.list_lab_paket) {
        // console.log(item);
        const dataLabPaket = await labPaketList.findAll({
          where: { lab_paket_id: item.id_lab_paket },
          include: [penunjang, labPaket],
        });
        console.log(dataLabPaket);
        for (let itemm of dataLabPaket) {
          // console.log(itemm);
          let getHarga = await sq.query(`select * from ms_harga_penunjang mhp where mhp.penunjang_id='${itemm.penunjang_id}' and mhp.ms_tarif_id='${getId[0][0].ms_tarif_id}' and mhp.ms_harga_id= '${getId[0][0].ms_harga_id}'`);
          //    console.log(getHarga[0]);
          if (getId[0].length) {
            if (getHarga[0].length) {
              penjualan.push({
                id: uuid_v4(),
                qty_penjualan_penunjang: 1,
                harga_penjualan_penunjang: getHarga[0][0].harga_jual_penunjang,
                harga_custom_penjualan_penunjang:
                  getHarga[0][0].harga_jual_penunjang,
                penunjang_id: itemm.penunjang_id,
                penjualan_id: getId[0][0].penjualan_id,
              });
            }
          }

          labHasilBulk.push({
            id: uuid_v4(),
            lab_paket_id: itemm.lab_paket_id,
            penunjang_id: itemm.penunjang_id,
            queue: itemm.queue,
            keterangan_lab_hasil: itemm.keterangan_lab_paket_list,
            lab_regis_id: id,
            hasil: "",
            is_normal: false,
            nama_penunjang: itemm.penunjang.nama_penunjang,
            parameter_normal: itemm.penunjang.parameter_normal,
            satuan: itemm.penunjang.satuan,
            operator: itemm.operator,
            nilai_r_neonatus_min: itemm.nilai_r_neonatus_min,
            nilai_r_neonatus_max: itemm.nilai_r_neonatus_max,
            nilai_r_bayi_min: itemm.nilai_r_bayi_min,
            nilai_r_bayi_max: itemm.nilai_r_bayi_max,
            nilai_r_anak_min: itemm.nilai_r_anak_min,
            nilai_r_anak_max: itemm.nilai_r_anak_max,
            nilai_r_d_perempuan_min: itemm.nilai_r_d_perempuan_min,
            nilai_r_d_perempuan_max: itemm.nilai_r_d_perempuan_max,
            nilai_r_d_laki_min: itemm.nilai_r_d_laki_min,
            nilai_r_d_laki_max: itemm.nilai_r_d_laki_max,
          });
        }
      }
      // console.log(penjualan);
      await labRegis.update({ status: 3 }, { where: { id } });
      await labHasil.destroy(
        { where: { lab_regis_id: id }, force: true },
        { transaction: t }
      );
      const data = await labHasil.bulkCreate(labHasilBulk, { transaction: t });
      await penjualan_penunjang.destroy(
        { where: { penjualan_id: getId[0][0].penjualan_id }, force: true },
        { transaction: t }
      );
      await penjualan_penunjang.bulkCreate(penjualan, {
        updateOnDuplicate: ["penunjang_id", "penjualan_id"],
        transaction: t,
      });

      await t.commit();
      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (error) {
      console.log(error);
      await t.rollback();
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async rekapExcel(req, res) {
    const{tanggal_request,no_rm,registrasi_id,tanggal_request_awal,tanggal_request_akhir}=req.body
    let offset = ""
    let pagination = ""
    let isi = ""

    try {
      let cond = ""

      // Static condition
      cond += ' lr."deletedAt" isnull and md."deletedAt" isnull '

      if(tanggal_request){
        cond += ` and lr.tanggal_request::date = '${tanggal_request}' `
      }
      if(tanggal_request_awal){
        cond+=` and date(lr.tanggal_request) >= date('${tanggal_request_awal}') `
      }
      if(tanggal_request_akhir){
        cond+=` and date(lr.tanggal_request) <= date('${tanggal_request_akhir}') `
      }
      if(no_rm) cond += ` and p.no_rm = '${no_rm}' `;
      if(registrasi_id) cond += ` and lr.registrasi_id = '${registrasi_id}' `;

      // Query untuk mendapatkan data rekap laboratorium
      let data = await sq.query(`
        SELECT
          lr.tanggal_request,
          p.no_rm,
          p.nama_lengkap as nama_pasien,
          p.jenis_kelamin,
          p.tgl_lahir as tanggal_lahir,
          r.tgl_registrasi,
          r.no_kunjungan,
          md.nama_dokter as dokter_pengirim,
          lr.diagnosa,
          lr.list_lab_paket,
          lr.klinis,
          lr.is_cito,
          lr.is_puasa,
          lr.is_registrasi,
          lr.status,
          lr.tanggal_ambil_sampel,
          lr.keterangan_lab_regis,
          lr.alasan_pembatalan,
          lr.user_batal,
          lr.tanggal_batal,
          lr."createdAt" as created_at,
          lr."updatedAt" as updated_at,
          CASE
            WHEN lr.status = 0 THEN 'New'
            WHEN lr.status = 1 THEN 'Proses'
            WHEN lr.status = 2 THEN 'Sampel'
            WHEN lr.status = 3 THEN 'Hasil'
            ELSE 'Unknown'
          END as status_text
        from lab_regis lr
        left join ms_dokter md on md.id=lr.dokter_id
        left join registrasi r on r.id=lr.registrasi_id
        left join pasien p on p.id = r.pasien_id
        left join ms_jenis_layanan mjl on mjl.id = r.ms_jenis_layanan_id
        where ${cond} order by lr.tanggal_request desc, lr."createdAt" desc
      `, s)

      // Membuat workbook Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekap Data Laboratorium');

      // Set headers
      worksheet.columns = [
        { header: 'Tanggal Request', key: 'tanggal_request', width: 20 },
        { header: 'No RM', key: 'no_rm', width: 15 },
        { header: 'Nama Pasien', key: 'nama_pasien', width: 25 },
        { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
        { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 20 },
        { header: 'Tanggal Registrasi', key: 'tgl_registrasi', width: 20 },
        { header: 'No Kunjungan', key: 'no_kunjungan', width: 15 },
        { header: 'Dokter Pengirim', key: 'dokter_pengirim', width: 25 },
        { header: 'Diagnosa', key: 'diagnosa', width: 30 },
        { header: 'List Lab Paket', key: 'list_lab_paket', width: 30 },
        { header: 'Klinis', key: 'klinis', width: 30 },
        { header: 'CITO', key: 'is_cito', width: 10 },
        { header: 'Puasa', key: 'is_puasa', width: 10 },
        { header: 'Registrasi', key: 'is_registrasi', width: 12 },
        { header: 'Status', key: 'status_text', width: 15 },
        { header: 'Tanggal Ambil Sampel', key: 'tanggal_ambil_sampel', width: 20 },
        { header: 'Keterangan', key: 'keterangan_lab_regis', width: 30 },
        { header: 'Alasan Pembatalan', key: 'alasan_pembatalan', width: 30 },
        { header: 'User Batal', key: 'user_batal', width: 20 },
        { header: 'Tanggal Batal', key: 'tanggal_batal', width: 20 },
        { header: 'Dibuat Tanggal', key: 'created_at', width: 20 },
        { header: 'Diupdate Tanggal', key: 'updated_at', width: 20 }
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6B8' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };

      // Add data rows
      data.forEach((row, index) => {
        const rowNum = index + 2;
        worksheet.addRow({
          tanggal_request: row.tanggal_request ? new Date(row.tanggal_request).toLocaleDateString('id-ID') : '',
          no_rm: row.no_rm || '',
          nama_pasien: row.nama_pasien || '',
          jenis_kelamin: row.jenis_kelamin || '',
          tanggal_lahir: row.tanggal_lahir ? new Date(row.tanggal_lahir).toLocaleDateString('id-ID') : '',
          tgl_registrasi: row.tgl_registrasi ? new Date(row.tgl_registrasi).toLocaleDateString('id-ID') : '',
          no_kunjungan: row.no_kunjungan || '',
          dokter_pengirim: row.dokter_pengirim || '',
          // diagnosa: row.diagnosa ? JSON.stringify(row.diagnosa) : '',
          diagnosa: Array.isArray(row.diagnosa) ? row.diagnosa.map(d => d.nama_diagnosa).join(', ') : '',
          list_lab_paket: Array.isArray(row.list_lab_paket) ? row.list_lab_paket.map(l => l.nama_lab_paket).join(', ') : '',
          klinis: row.klinis || '',
          is_cito: row.is_cito ? 'Ya' : 'Tidak',
          is_puasa: row.is_puasa ? 'Ya' : 'Tidak',
          is_registrasi: row.is_registrasi ? 'Ya' : 'Tidak',
          status_text: row.status_text || '',
          tanggal_ambil_sampel: row.tanggal_ambil_sampel ? new Date(row.tanggal_ambil_sampel).toLocaleDateString('id-ID') : '',
          keterangan_lab_regis: row.keterangan_lab_regis || '',
          alasan_pembatalan: row.alasan_pembatalan || '',
          user_batal: row.user_batal || '',
          tanggal_batal: row.tanggal_batal ? new Date(row.tanggal_batal).toLocaleDateString('id-ID') : '',
          created_at: row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '',
          updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : ''
        });

        // Style data rows
        worksheet.getRow(rowNum).alignment = { vertical: 'middle', wrapText: true };
        worksheet.getRow(rowNum).border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
      });

      // Auto-fit columns for better readability
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
          let columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `rekap_laboratorium_${timestamp}.xlsx`;

      // // Set response headers
      // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      // res.setHeader('Cache-Control', 'no-cache');

      // // Send file
      // await workbook.xlsx.write(res);
      // res.end();

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Type",
        "excel application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "no-cache");

      return res.send(buffer);

    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async statistic(req, res) {
    try {
      let data = await sq.query(
        `
                select count(A.id) as new from lab_regis A where A.status = 0 and A."deletedAt" isnull
            `,
        s
      );

      res
        .status(200)
        .json({ status: 200, message: "sukses", data: { new: data[0].new } });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
}
module.exports = Controller;
