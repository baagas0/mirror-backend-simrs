const { sq } = require("../../config/connection");
const { QueryTypes } = require("sequelize");
const { Service } = require("./service");

const s = { type: QueryTypes.SELECT };

// Helper function untuk mendapatkan data registrasi lengkap
async function getDataRegistrasi(registrasi_id) {
  const dataRegistrasi = await sq.query(
    `
            SELECT
                r.id as registrasi_id,
                r.no_kunjungan,
                r.tgl_registrasi,
                r.satu_sehat_id as satu_sehat_id_registrasi,
                r.satu_sehat_condition_id as satu_sehat_condition_id_registrasi,
                r.satu_sehat_observation_id as satu_sehat_observation_id_registrasi,
                r.satu_sehat_request_service_id,
                r.satu_sehat_procedure_id,
                r.satu_sehat_tindak_lanjut_id,
                r.satu_sehat_clinical_impression_id,
                r.satu_sehat_diet_id,
                r.satu_sehat_kontrol_kembali_id,
                r.satu_sehat_alleri_intoleran_id,
                mjl.kode_jenis_layanan,
                p.id as pasien_id,
                p.nama_lengkap,
                p.satu_sehat_id as satu_sehat_id_pasien,
                md.id as ms_dokter_id,
                md.nama_dokter,
                md.satu_sehat_id as satu_sehat_id_dokter,
                mp2.id as ms_poliklinik_id,
                mp2.nama_poliklinik,
                mp2.satu_sehat_id as satu_sehat_id_poliklinik
            FROM registrasi r
            JOIN pasien p ON p.id = r.pasien_id
            JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
            LEFT JOIN ms_dokter md ON md.id = r.ms_dokter_id
            LEFT JOIN antrian_list al ON al.registrasi_id = r.id
            LEFT JOIN jadwal_dokter jd ON jd.id = al.jadwal_dokter_id
            LEFT JOIN ms_poliklinik mp2 ON mp2.id = jd.ms_poliklinik_id
            WHERE r."deletedAt" IS NULL AND r.id = '${registrasi_id}'
        `,
    s,
  );

  if (!dataRegistrasi || dataRegistrasi.length === 0) {
    throw {
      status: 404,
      message: "Registrasi tidak ditemukan",
      data: null,
    };
  }

  return dataRegistrasi[0];
}

class Controller {
  static request(req, res) {
    try {
      const org_id = process.env.SATU_SEHAT_ORGANIZATION_ID;
    } catch (error) {
      res.status(403).json({
        status: 403,
        message: "Gagal",
        data: {
          organization_id: null,
        },
      });
    }
  }

  static async syncEncounter(req, res) {
    const { registrasi_id } = req.body;

    try {
      const dataRegistrasi = await sq.query(
        `
                SELECT
                    r.id as registrasi_id,
                    r.no_kunjungan,
                    r.tgl_registrasi,
                    r.satu_sehat_id as satu_sehat_id_registrasi,
                    mjl.kode_jenis_layanan,
                    p.id as pasien_id,
                    p.nama_lengkap,
                    p.satu_sehat_id as satu_sehat_id_pasien,
                    md.id as ms_dokter_id,
                    md.nama_dokter,
                    md.satu_sehat_id as satu_sehat_id_dokter,
                    mp2.id as ms_poliklinik_id,
                    mp2.nama_poliklinik,
                    mp2.satu_sehat_id as satu_sehat_id_poliklinik
                FROM registrasi r
                JOIN pasien p ON p.id = r.pasien_id
                JOIN ms_jenis_layanan mjl ON mjl.id = r.ms_jenis_layanan_id
                LEFT JOIN ms_dokter md ON md.id = r.ms_dokter_id
                LEFT JOIN antrian_list al ON al.registrasi_id = r.id
                LEFT JOIN jadwal_dokter jd ON jd.id = al.jadwal_dokter_id
                LEFT JOIN ms_poliklinik mp2 ON mp2.id = jd.ms_poliklinik_id
                WHERE r."deletedAt" IS NULL AND r.id = '${registrasi_id}'
            `,
        s,
      );

      if (!dataRegistrasi || dataRegistrasi.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Registrasi tidak ditemukan",
          data: null,
        });
      }

      const data = dataRegistrasi[0];

      if (!data.satu_sehat_id_pasien) {
        return res.status(400).json({
          status: 400,
          message: "Pasien belum sync dengan satu sehat",
          data: null,
        });
      }

      if (!data.satu_sehat_id_dokter) {
        return res.status(400).json({
          status: 400,
          message: "Dokter belum sync dengan satu sehat",
          data: null,
        });
      }

      if (data.satu_sehat_id_registrasi) {
        return res.status(200).json({
          status: 200,
          message: "Encounter sudah tersedia",
          data: {
            id: data.satu_sehat_id_registrasi,
          },
        });
      }

      const result = await Service.syncEncounter(data, registrasi_id);

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync encounter dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync encounter:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync encounter",
        data: error.data || error,
      });
    }
  }

  static async syncSatuSehat(req, res) {
    const { registrasi_id, heart_rates = [] } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_pasien) {
        return res.status(400).json({
          status: 400,
          message: "Pasien belum sync dengan satu sehat",
          data: null,
        });
      }

      if (!data.satu_sehat_id_dokter) {
        return res.status(400).json({
          status: 400,
          message: "Dokter belum sync dengan satu sehat",
          data: null,
        });
      }

      let encounter_id = data.satu_sehat_id_registrasi;

      // Sync Encounter
      if (!encounter_id) {
        const encounter = await Service.syncEncounter(data, registrasi_id);
        encounter_id = encounter.id;
        data.satu_sehat_id_registrasi = encounter.id;
      }

      const results = {
        encounter_id: encounter_id,
        condition: null,
        observations: [],
        procedure: null,
        planning: null,
        clinicalImpression: null,
        diet: null,
        kontrol: null,
        alergiIntoleran: null,
      };

      // Sync Condition
      if (!data.satu_sehat_condition_id_registrasi) {
        try {
          const condition = await Service.syncCondition(
            data,
            registrasi_id,
            encounter_id,
          );
          results.condition = condition;
        } catch (error) {
          console.error("Error sync condition:", error);
        }
      }

      // Sync Observation (Heart Rate)
      if (!data.satu_sehat_observation_id_registrasi && heart_rates.length > 0) {
        try {
          for (let i = 0; i < heart_rates.length; i++) {
            const heart_rate = heart_rates[i];
            const observation = await Service.syncObservation(
              data,
              registrasi_id,
              encounter_id,
              heart_rate,
            );
            results.observations.push(observation);
          }
        } catch (error) {
          console.error("Error sync observation:", error);
        }
      }

      // Sync Procedure Rajal
      if (!data.satu_sehat_request_service_id) {
        try {
          const procedure = await Service.syncProcedureRajal(
            data,
            registrasi_id,
            encounter_id,
          );
          results.procedure = procedure;
        } catch (error) {
          console.error("Error sync procedure:", error);
        }
      }

      // Sync Planning Rajal
      if (!data.satu_sehat_tindak_lanjut_id) {
        try {
          const planning = await Service.syncPlanningRajal(
            data,
            registrasi_id,
            encounter_id,
          );
          results.planning = planning;
        } catch (error) {
          console.error("Error sync planning:", error);
        }
      }

      // Sync Clinical Impression Rajal
      if (!data.satu_sehat_clinical_impression_id) {
        try {
          const clinicalImpression = await Service.syncClinicalImpressionRajal(
            data,
            registrasi_id,
            encounter_id,
          );
          results.clinicalImpression = clinicalImpression;
        } catch (error) {
          console.error("Error sync clinical impression:", error);
        }
      }

      // Sync Diet Rajal
      if (!data.satu_sehat_diet_id) {
        try {
          const diet = await Service.syncDietRajal(
            data,
            registrasi_id,
            encounter_id,
          );
          results.diet = diet;
        } catch (error) {
          console.error("Error sync diet:", error);
        }
      }

      // Sync Kontrol Rajal
      if (!data.satu_sehat_kontrol_kembali_id) {
        try {
          const kontrol = await Service.syncKontrolRajal(
            data,
            registrasi_id,
            encounter_id,
          );
          results.kontrol = kontrol;
        } catch (error) {
          console.error("Error sync kontrol:", error);
        }
      }

      // Sync Alergi Intoleran Rajal
      if (!data.satu_sehat_alleri_intoleran_id) {
        try {
          const alergiIntoleran = await Service.syncAlergiIntoleranRajal(
            data,
            registrasi_id,
            encounter_id,
          );
          results.alergiIntoleran = alergiIntoleran;
        } catch (error) {
          console.error("Error sync alergi intoleran:", error);
        }
      }

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync data dengan Satu Sehat",
        data: results,
      });
    } catch (error) {
      console.error("Error sync satu sehat:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync dengan Satu Sehat",
        data: error.data || error,
      });
    }
  }

  static async syncCondition(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_condition_id_registrasi) {
        return res.status(200).json({
          status: 200,
          message: "Condition sudah tersedia",
          data: {
            id: data.satu_sehat_condition_id_registrasi,
          },
        });
      }

      const result = await Service.syncCondition(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync condition dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync condition:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync condition",
        data: error.data || error,
      });
    }
  }

  static async syncObservation(req, res) {
    const { registrasi_id, heart_rate } = req.body;

    try {
      if (!heart_rate || !heart_rate.date || !heart_rate.value) {
        return res.status(400).json({
          status: 400,
          message: "Heart rate data tidak lengkap (date dan value diperlukan)",
          data: null,
        });
      }

      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      const result = await Service.syncObservation(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
        heart_rate,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync observation dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync observation:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync observation",
        data: error.data || error,
      });
    }
  }

  static async syncProcedureRajal(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_request_service_id) {
        return res.status(200).json({
          status: 200,
          message: "Procedure sudah tersedia",
          data: {
            serviceRequestId: data.satu_sehat_request_service_id,
            procedureId: data.satu_sehat_procedure_id,
          },
        });
      }

      const result = await Service.syncProcedureRajal(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync procedure dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync procedure:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync procedure",
        data: error.data || error,
      });
    }
  }

  static async syncPlanningRajal(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_tindak_lanjut_id) {
        return res.status(200).json({
          status: 200,
          message: "Planning sudah tersedia",
          data: {
            id: data.satu_sehat_tindak_lanjut_id,
          },
        });
      }

      const result = await Service.syncPlanningRajal(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync planning dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync planning:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync planning",
        data: error.data || error,
      });
    }
  }

  static async syncClinicalImpressionRajal(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_clinical_impression_id) {
        return res.status(200).json({
          status: 200,
          message: "Clinical impression sudah tersedia",
          data: {
            id: data.satu_sehat_clinical_impression_id,
          },
        });
      }

      const result = await Service.syncClinicalImpressionRajal(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync clinical impression dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync clinical impression:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message:
          error.message || "Terjadi kesalahan saat sync clinical impression",
        data: error.data || error,
      });
    }
  }

  static async syncDietRajal(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_diet_id) {
        return res.status(200).json({
          status: 200,
          message: "Diet sudah tersedia",
          data: {
            id: data.satu_sehat_diet_id,
          },
        });
      }

      const result = await Service.syncDietRajal(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync diet dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync diet:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync diet",
        data: error.data || error,
      });
    }
  }

  static async syncKontrolRajal(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_kontrol_kembali_id) {
        return res.status(200).json({
          status: 200,
          message: "Kontrol sudah tersedia",
          data: {
            id: data.satu_sehat_kontrol_kembali_id,
          },
        });
      }

      const result = await Service.syncKontrolRajal(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync kontrol dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync kontrol:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Terjadi kesalahan saat sync kontrol",
        data: error.data || error,
      });
    }
  }

  static async syncAlergiIntoleranRajal(req, res) {
    const { registrasi_id } = req.body;

    try {
      const data = await getDataRegistrasi(registrasi_id);

      if (!data.satu_sehat_id_registrasi) {
        return res.status(400).json({
          status: 400,
          message: "Encounter belum sync, sync encounter terlebih dahulu",
          data: null,
        });
      }

      if (data.satu_sehat_alleri_intoleran_id) {
        return res.status(200).json({
          status: 200,
          message: "Alergi intoleran sudah tersedia",
          data: {
            id: data.satu_sehat_alleri_intoleran_id,
          },
        });
      }

      const result = await Service.syncAlergiIntoleranRajal(
        data,
        registrasi_id,
        data.satu_sehat_id_registrasi,
      );

      return res.status(200).json({
        status: 200,
        message: "Berhasil sync alergi intoleran dengan Satu Sehat",
        data: result,
      });
    } catch (error) {
      console.error("Error sync alergi intoleran:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message:
          error.message || "Terjadi kesalahan saat sync alergi intoleran",
        data: error.data || error,
      });
    }
  }
}

module.exports = Controller;
