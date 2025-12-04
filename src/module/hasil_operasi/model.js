const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msDokter = require('../ms_dokter/model');
const msDiagnosa = require('../ms_diagnosa/model');

const HasilOperasi = sq.define('hasil_operasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    jadwal_operasi_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'jadwal_operasi',
            key: 'id'
        }
    },
    kategori: {
        type: DataTypes.STRING // Besar | Kecil
    },
    jenis_anasthesi: {
        type: DataTypes.STRING
    },
    operator_1_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    operator_2_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    operator_3_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    dokter_anastesi_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    dokter_anak_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    bidan_1_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    bidan_2_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    bidan_3_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    perawat_luar_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    instrumen_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    dokter_umum_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    pre_diagnosa_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDiagnosa,
            key: 'id'
        }
    },
    post_diagnosa_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDiagnosa,
            key: 'id'
        }
    },
    eksisi_ensisi: {
        type: DataTypes.ENUM('Eksisi', 'Ensisi')
    },
    pemeriksaan_pa: {
        type: DataTypes.ENUM('Ya', 'Tidak')
    },
    ast_operator_1_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    ast_operator_2_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    ast_operator_3_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    ast_anastesi_1_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    ast_anastesi_2_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    prw_resusitasi_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    onloop_1_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    onloop_2_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    onloop_3_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    onloop_4_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    onloop_5_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    dokter_pj_anak_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: msDokter,
            key: 'id'
        }
    },
    tanggal_selesai: {
        type: DataTypes.DATE
    },
    laporan_operasi: {
        type: DataTypes.TEXT
    },
    mapping_operasi: {
        type: DataTypes.JSONB
    }
}, {
    paranoid: true,
    freezeTableName: true
});

HasilOperasi.belongsTo(msDokter, { foreignKey: 'operator_1_id', as: 'operator1' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'operator_2_id', as: 'operator2' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'operator_3_id', as: 'operator3' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'dokter_anastesi_id', as: 'dokter_anastesi' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'dokter_anak_id', as: 'dokter_anak' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'bidan_1_id', as: 'bidan1' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'bidan_2_id', as: 'bidan2' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'bidan_3_id', as: 'bidan3' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'perawat_luar_id', as: 'perawat_luar' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'instrumen_id', as: 'instrumen' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'dokter_umum_id', as: 'dokter_umum' });
HasilOperasi.belongsTo(msDiagnosa, { foreignKey: 'pre_diagnosa_id', as: 'pre_diagnosa' });
HasilOperasi.belongsTo(msDiagnosa, { foreignKey: 'post_diagnosa_id', as: 'post_diagnosa' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'ast_operator_1_id', as: 'ast_operator1' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'ast_operator_2_id', as: 'ast_operator2' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'ast_operator_3_id', as: 'ast_operator3' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'ast_anastesi_1_id', as: 'ast_anastesi1' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'ast_anastesi_2_id', as: 'ast_anastesi2' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'prw_resusitasi_id', as: 'prw_resusitasi' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'onloop_1_id', as: 'onloop1' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'onloop_2_id', as: 'onloop2' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'onloop_3_id', as: 'onloop3' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'onloop_4_id', as: 'onloop4' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'onloop_5_id', as: 'onloop5' });
HasilOperasi.belongsTo(msDokter, { foreignKey: 'dokter_pj_anak_id', as: 'dokterpjanakid' });

module.exports = HasilOperasi;
