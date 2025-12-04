const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const rad_hasil = require('../rad_hasil/model');
const ms_dokter = require('../ms_dokter/model');

const rad_expertise = sq.define('rad_expertise', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    rad_hasil_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: rad_hasil,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    radiolog_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: ms_dokter,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    temuan: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Detil temuan/kondisi yang ditemukan pada pemeriksaan'
    },
    kesimpulan: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Kesimpulan diagnosis atau interpretasi radiologi'
    },
    saran: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Saran tindakan lanjutan atau follow-up'
    },
    status_expertise: {
        type: DataTypes.ENUM('draft', 'final', 'revised', 'second_opinion'),
        defaultValue: 'draft',
        allowNull: false,
        // comment: 'Status dari laporan expertise'
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        // comment: 'Versi dari laporan expertise'
    },
    additional_findings: {
        type: DataTypes.JSON,
        allowNull: true,
        // comment: 'Temuan tambahan dalam format JSON'
    },
    measurements: {
        type: DataTypes.JSON,
        allowNull: true,
        // comment: 'Pengukuran penting dalam format JSON'
    },
    comparison_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Catatan perbandingan dengan pemeriksaan sebelumnya'
    },
    technique: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Teknik pemeriksaan yang digunakan'
    },
    clinical_correlation: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Korelasi dengan kondisi klinis pasien'
    },
    limitations: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Keterbatasan pemeriksaan'
    },
    urgency_level: {
        type: DataTypes.ENUM('routine', 'urgent', 'critical'),
        defaultValue: 'routine',
        allowNull: false,
        // comment: 'Tingkat urgensi laporan'
    },
    report_type: {
        type: DataTypes.ENUM('preliminary', 'final', 'addendum'),
        defaultValue: 'final',
        allowNull: false,
        // comment: 'Tipe laporan'
    },
    critical_findings: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        // comment: 'Apakah ada temuan kritis'
    },
    critical_findings_notified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        // comment: 'Apakah temuan kritis sudah dinotifikasikan'
    },
    peer_review_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'revision_required'),
        allowNull: true,
        // comment: 'Status peer review'
    },
    peer_reviewer_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: ms_dokter,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    peer_review_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        // comment: 'Catatan dari peer reviewer'
    },
    report_completion_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // comment: 'Waktu penyelesaian laporan dalam menit'
    },
    billing_status: {
        type: DataTypes.ENUM('unbilled', 'billed', 'paid'),
        defaultValue: 'unbilled',
        allowNull: false,
        // comment: 'Status penagihan'
    },
    primary_image: {
        type: DataTypes.STRING,
        allowNull: true,
        // comment: 'Path ke gambar utama/jenis pertama'
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        // comment: 'User yang membuat record'
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
        // comment: 'User yang terakhir mengupdate record'
    }
}, {
    paranoid: true,
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['rad_hasil_id']
        },
        {
            unique: false,
            fields: ['radiolog_id']
        },
        {
            unique: false,
            fields: ['status_expertise']
        },
        {
            unique: false,
            fields: ['report_type']
        },
        {
            unique: false,
            fields: ['critical_findings']
        },
        {
            unique: false,
            fields: ['urgency_level']
        },
        {
            unique: false,
            fields: ['createdAt']
        }
    ]
});

// Associations
rad_expertise.belongsTo(rad_hasil, { foreignKey: 'rad_hasil_id', as: 'rad_hasil' });
rad_hasil.hasMany(rad_expertise, { foreignKey: 'rad_hasil_id', as: 'expertises' });

rad_expertise.belongsTo(ms_dokter, { foreignKey: 'radiolog_id', as: 'radiolog' });
ms_dokter.hasMany(rad_expertise, { foreignKey: 'radiolog_id', as: 'rad_expertises' });

rad_expertise.belongsTo(ms_dokter, { foreignKey: 'peer_reviewer_id', as: 'peer_reviewer' });
ms_dokter.hasMany(rad_expertise, { foreignKey: 'peer_reviewer_id', as: 'peer_reviews' });

// Hooks untuk otomatisasi
rad_expertise.beforeCreate(async (expertise, options) => {
    // Set version otomatis berdasarkan expertise sebelumnya untuk rad_hasil_id yang sama
    const lastExpertise = await rad_expertise.findOne({
        where: { rad_hasil_id: expertise.rad_hasil_id },
        order: [['version', 'DESC']],
        paranoid: false
    });

    if (lastExpertise) {
        expertise.version = lastExpertise.version + 1;
    }

    // Set default report completion time jika belum ada
    if (!expertise.report_completion_time) {
        expertise.report_completion_time = 0;
    }
});

rad_expertise.beforeUpdate(async (expertise, options) => {
    // Log perubahan status
    if (expertise.changed('status_expertise') && expertise.status_expertise === 'final') {
        console.log(`Expertise ${expertise.id} marked as final by radiolog ${expertise.radiolog_id}`);
    }
});

module.exports = rad_expertise;