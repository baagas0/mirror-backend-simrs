const rad_hasil = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const moment = require('moment');

class Controller{
    static async register(req,res){
        const{hasil,queue,rad_test_id,penunjang_id,rad_regis_id,tanggal_pemeriksaan,keterangan_rad_hasil,kesan,saran}=req.body

        try {
            let data= await rad_hasil.create({id:uuid_v4(),hasil,keterangan_rad_hasil,kesan,saran,rad_regis_id,rad_test_id,penunjang_id,queue,tanggal_pemeriksaan,created_by:req.dataUsers.id,created_name:req.dataUsers.username  })
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req,res){
        const{id,rad_regis_id,rad_test_id,penunjang_id,queue,tanggal_pemeriksaan,hasil,keterangan_rad_hasil,kesan,saran}=req.body

        let file_tambahan = ''
        if (req.body && req.body.file_tambahan && req.body.file_tambahan.filename) file_tambahan = req.body.file_tambahan.filename

        try {
            await rad_hasil.update({keterangan_rad_hasil,kesan,saran,hasil,rad_regis_id,rad_test_id,penunjang_id,queue,tanggal_pemeriksaan, file_tambahan,updated_by:req.dataUsers.id,updated_name:req.dataUsers.username},{where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async detailsById(req,res){
        const{id}=req.body
        try {
            let data = await sq.query(`
                SELECT
                    rh.id as rad_hasil_id,
                    rh.*,
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
                    d.nama_dokter,
                    -- Get latest expertise data
                    (SELECT json_agg(
                        json_build_object(
                            'id', re.id,
                            'temuan', re.temuan,
                            'kesimpulan', re.kesimpulan,
                            'saran', re.saran,
                            'status_expertise', re.status_expertise,
                            'version', re.version,
                            'urgency_level', re.urgency_level,
                            'report_type', re.report_type,
                            'critical_findings', re.critical_findings,
                            'report_completion_time', re.report_completion_time,
                            'radiolog_id', re.radiolog_id,
                            'nama_radiolog', rad.nama_dokter,
                            'createdAt', re."createdAt",
                            'updatedAt', re."updatedAt"
                        )
                    ) FROM rad_expertise re
                    LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
                    WHERE re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL) as expertises
                FROM rad_hasil rh
                JOIN rad_regis rr ON rr.id=rh.rad_regis_id
                JOIN rad_test rt ON rt.id=rh.rad_test_id
                JOIN penunjang pp ON pp.id=rh.penunjang_id
                LEFT JOIN registrasi r ON r.id=rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id=rr.ms_dokter_id
                WHERE rh."deletedAt" IS NULL AND rh.id='${id}'
            `,s)

            data = data.map((x) => {
              const dateObject = moment(x.tanggal_pemeriksaan);
              const formattedDate = dateObject.format('YYYY-MM-DD');
              return {
                ...x,
                tanggal_pemeriksaan: formattedDate,
                // Parse expertises if exists
                expertises: x.expertises || []
              }
            })
            res.status(200).json({ status: 200, message: "sukses",data })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async delete(req,res){
        const{id}=req.body
        try {
            await rad_hasil.update({deleted_by:req.dataUsers.id,deleted_name:req.dataUsers.username},{where:{id}})
            await rad_hasil.destroy({where:{id}})
            res.status(200).json({ status: 200, message: "sukses" })
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async list(req, res) {
        const{halaman,jumlah,id,rad_regis_id,rad_test_id,penunjang_id,tanggal_pemeriksaan_awal,tanggal_pemeriksaan_akhir,registrasi_id}=req.body
        let isi = ''
        let offset=''
        let pagination=''
  
        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }
  
        try {
  
          if(id){
            isi+= ` and rh.id = '${id}' `
          }
          if(tanggal_pemeriksaan_awal){
            isi+= ` and date(rh."tanggal_pemeriksaan") >= date('${tanggal_pemeriksaan_awal}') `
          }
          if(tanggal_pemeriksaan_akhir){
            isi+= ` and date(rh."tanggal_pemeriksaan") <= date('${tanggal_pemeriksaan_akhir}') `
          }
          if(rad_regis_id){
            isi+= ` and rr.id = '${rad_regis_id}' `
          }
          if(rad_test_id){
            isi+= ` and rt.id = '${rad_test_id}' `
          }
          if(penunjang_id){
            isi+= ` and p.id = '${penunjang_id}' `
          }
          if(registrasi_id){
            isi+=` and rr.registrasi_id='${registrasi_id}'`
          }
  
          let data = await sq.query(`select rh.id as rad_hasil_id,* 
            from rad_hasil rh 
            join rad_regis rr on rr.id=rh.rad_regis_id 
            left join registrasi r on r.id=rr.registrasi_id
            left join pasien ps on ps.id=r.pasien_id
            join rad_test rt on rt.id=rh.rad_test_id 
            join penunjang p on p.id=rh.penunjang_id 
            where rh."deletedAt" is null ${isi} order by rh."queue" asc ${pagination}`,s)
  
          let jml = await sq.query(`select count(*) from rad_hasil rh join rad_regis rr on rr.id=rh.rad_regis_id join rad_test rt on rt.id=rh.rad_test_id join penunjang p on p.id=rh.penunjang_id where rh."deletedAt" is null ${isi}`,s)
          
          // console.log(req)
          data = data.map((x) => {
            const dateObject = moment(x.tanggal_pemeriksaan);

            const formattedDate = dateObject.format('YYYY-MM-DD H:mm:s');
            return {
              ...x,
              tanggal_pemeriksaan: formattedDate
            }
          })
          res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
          
        } catch (error) {
          console.log(req.body);
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error });
        }

      }

    // Get rad_hasil dengan expertise untuk radiology dashboard
    static async listWithExpertise(req, res) {
        const{halaman,jumlah,id,rad_regis_id,rad_test_id,penunjang_id,tanggal_pemeriksaan_awal,tanggal_pemeriksaan_akhir,registrasi_id, status_expertise, radiolog_id} = req.body
        let isi = ''
        let offset=''
        let pagination=''

        if(halaman && jumlah){
          offset = (+halaman -1) * jumlah;
          pagination=`limit ${jumlah} offset ${offset}`
        }

        try {
          if(id){
            isi+= ` and rh.id = '${id}' `
          }
          if(tanggal_pemeriksaan_awal){
            isi+= ` and date(rh."tanggal_pemeriksaan") >= date('${tanggal_pemeriksaan_awal}') `
          }
          if(tanggal_pemeriksaan_akhir){
            isi+= ` and date(rh."tanggal_pemeriksaan") <= date('${tanggal_pemeriksaan_akhir}') `
          }
          if(rad_regis_id){
            isi+= ` and rr.id = '${rad_regis_id}' `
          }
          if(rad_test_id){
            isi+= ` and rt.id = '${rad_test_id}' `
          }
          if(penunjang_id){
            isi+= ` and p.id = '${penunjang_id}' `
          }
          if(registrasi_id){
            isi+=` and rr.registrasi_id='${registrasi_id}'`
          }
          // Filter by expertise status
          if(status_expertise){
            isi+= ` and re.status_expertise = '${status_expertise}'`
          }
          // Filter by radiolog
          if(radiolog_id){
            isi+= ` and re.radiolog_id = '${radiolog_id}'`
          }

          let data = await sq.query(`
            SELECT
                rh.id as rad_hasil_id,
                rh.*,
                rr.registrasi_id,
                rr.status as status_regis,
                rr.is_cito,
                rt.nama_rad_test,
                pp.nama_penunjang,
                p.no_rm,
                p.nama_lengkap,
                p.jenis_kelamin,
                d.nama_dokter as nama_dokter_pengirim,
                -- Get latest expertise
                re.id as expertise_id,
                re.temuan,
                re.kesimpulan,
                re.saran,
                re.status_expertise,
                re.version,
                re.urgency_level,
                re.report_type,
                re.critical_findings,
                re."createdAt" as expertise_created_at,
                rad.nama_dokter as nama_radiolog,
                rad.ms_specialist_id as spesialisasi_radiolog
            FROM rad_hasil rh
            JOIN rad_regis rr ON rr.id=rh.rad_regis_id
            JOIN rad_test rt ON rt.id=rh.rad_test_id
            JOIN penunjang pp ON pp.id=rh.penunjang_id
            LEFT JOIN registrasi r ON r.id=rr.registrasi_id
            LEFT JOIN pasien ps ON ps.id = r.pasien_id
            LEFT JOIN ms_dokter d ON d.id=rr.ms_dokter_id
            LEFT JOIN LATERAL (
                SELECT * FROM rad_expertise re2
                WHERE re2.rad_hasil_id = rh.id AND re2."deletedAt" IS NULL
                ORDER BY re2.version DESC
                LIMIT 1
            ) re ON true
            LEFT JOIN ms_dokter rad ON rad.id = re.radiolog_id
            WHERE rh."deletedAt" IS NULL ${isi}
            ORDER BY rh."queue" ASC, re."createdAt" DESC
            ${pagination}
          `,s)

          let jml = await sq.query(`
            SELECT COUNT(*)
            FROM rad_hasil rh
            JOIN rad_regis rr ON rr.id=rh.rad_regis_id
            LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id AND re."deletedAt" IS NULL
            WHERE rh."deletedAt" IS NULL ${isi}
          `,s)

          data = data.map((x) => {
            return {
              ...x,
              tanggal_pemeriksaan: x.tanggal_pemeriksaan ? moment(x.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss') : null,
              expertise_created_at: x.expertise_created_at ? moment(x.expertise_created_at).format('YYYY-MM-DD HH:mm:ss') : null,
              has_expertise: !!x.expertise_id
            }
          })

          res.status(200).json({
            status: 200,
            message: "sukses",
            data,
            count: jml[0].count,
            jumlah: parseInt(jumlah),
            halaman: parseInt(halaman)
          })

        } catch (error) {
          console.log(req.body);
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error.message });
        }
      }

    // Get rad_hasil by radiolog untuk dashboard radiolog
    static async getByRadiolog(req, res) {
        const { radiolog_id, status, page = 1, perPage = 10 } = req.body;

        let offset = (page - 1) * perPage;
        let statusFilter = '';

        if (status) {
            statusFilter = `AND re.status_expertise = '${status}'`;
        }

        try {
            let data = await sq.query(`
                SELECT
                    rh.id as rad_hasil_id,
                    rh.tanggal_pemeriksaan,
                    rh.queue,
                    rr.registrasi_id,
                    rr.is_cito,
                    rr.status as status_regis,
                    rt.nama_rad_test,
                    pp.nama_penunjang,
                    p.no_rm,
                    p.nama_lengkap,
                    p.jenis_kelamin,
                    p.tgl_lahir,
                    d.nama_dokter as nama_dokter_pengirim,
                    re.id as expertise_id,
                    re.temuan,
                    re.kesimpulan,
                    re.saran,
                    re.status_expertise,
                    re.version,
                    re.urgency_level,
                    re.report_type,
                    re.critical_findings,
                    re."createdAt" as expertise_created_at,
                    re."updatedAt" as expertise_updated_at
                FROM rad_hasil rh
                JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                JOIN rad_test rt ON rt.id = rh.rad_test_id
                JOIN penunjang pp ON pp.id = rh.penunjang_id
                LEFT JOIN registrasi r ON r.id = rr.registrasi_id
                LEFT JOIN pasien p ON p.id = r.pasien_id
                LEFT JOIN ms_dokter d ON d.id = rr.ms_dokter_id
                LEFT JOIN rad_expertise re ON re.rad_hasil_id = rh.id
                    AND re.radiolog_id = '${radiolog_id}'
                    AND re."deletedAt" IS NULL
                WHERE rh."deletedAt" IS NULL
                    AND rr."deletedAt" IS NULL
                ORDER BY
                    CASE
                        WHEN rr.is_cito = true THEN 1
                        ELSE 2
                    END,
                    rh.tanggal_pemeriksaan DESC,
                    rh.queue ASC
                LIMIT ${perPage} OFFSET ${offset}
            `, s);

            let countData = await sq.query(`
                SELECT COUNT(*) as total
                FROM rad_hasil rh
                JOIN rad_regis rr ON rr.id = rh.rad_regis_id
                WHERE rh."deletedAt" IS NULL
                    AND rr."deletedAt" IS NULL
            `, s);

            data = data.map((x) => {
                return {
                    ...x,
                    tanggal_pemeriksaan: x.tanggal_pemeriksaan ? moment(x.tanggal_pemeriksaan).format('YYYY-MM-DD HH:mm:ss') : null,
                    expertise_created_at: x.expertise_created_at ? moment(x.expertise_created_at).format('YYYY-MM-DD HH:mm:ss') : null,
                    expertise_updated_at: x.expertise_updated_at ? moment(x.expertise_updated_at).format('YYYY-MM-DD HH:mm:ss') : null,
                    has_expertise: !!x.expertise_id,
                    needs_attention: rr.is_cito || (x.expertise_id === null && rr.status >= 2)
                }
            });

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
}

module.exports = Controller