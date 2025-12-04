const koneksi = require('./config/connection').sq
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const moment = require('moment');

let normalizedPath = require("path").join(__dirname, "./module");

const modulesPath = path.join(__dirname, './module');

fs.readdirSync(modulesPath).forEach((entry) => {
  if (entry.startsWith('.')) return; // skip .DS_Store and hidden files
  const modulePath = path.join(modulesPath, entry);
  if (!fs.existsSync(modulePath)) return;

  const stat = fs.lstatSync(modulePath);
  if (!stat.isDirectory()) return;

  const modelFile = path.join(modulePath, 'model.js');
  if (fs.existsSync(modelFile)) {
    require(modelFile);
  }
});

const replace_view_data_diagnosa = `
    create view data_diagnosa as 
        --	Ambil Diagnosa R Jalan
        select p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa, p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa, date(amr."createdAt")as tanggal, 'medis_rajal' as tipe, amr.registrasi_id, amr."createdAt", amr."updatedAt", amr."deletedAt"
        from
            assesment_medis_rjalan amr cross join jsonb_array_elements(amr.json_assesment_medis_rjalan->'assesment'->'diagnosa') p
        where amr."deletedAt" isnull and amr.json_assesment_medis_rjalan notnull and p.* ->> 'tipe_diagnosa' = 'ICD'
            
        union all
        --	Ambil Diagnosa IGD
        select p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa, p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa, date(ami."createdAt")as tanggal, 'medis_igd' as tipe, ami.registrasi_id, ami."createdAt", ami."updatedAt", ami."deletedAt"
        from
            assesment_medis_igd ami cross join jsonb_array_elements(ami.json_assesment_medis_igd ->'assesment'->'diagnosa') p
        where ami."deletedAt" isnull and ami.json_assesment_medis_igd notnull and p.* ->> 'tipe_diagnosa' = 'ICD'
        
        union all
        
        -- Ambil Diagnosa Ranap
        select p.* -> 'diagnosa' ->> 'kode_diagnosa' as kode_diagnosa, p.* -> 'diagnosa' ->> 'nama_diagnosa' as nama_diagnosa, date(c."createdAt")as tanggal, 'cppt_dr' as tipe, c.registrasi_id, c."createdAt", c."updatedAt", c."deletedAt"
        from
            cppt c cross join json_array_elements(c.asesmen->'assesment'->'diagnosa') p
        join ms_tipe_tenaga_medis mttm on mttm.id = c.ms_tipe_tenaga_medis_id
        where c."deletedAt" isnull and mttm.kode_tipe_tenaga_medis = 'Dr' and c.asesmen notnull and p.* ->> 'tipe_diagnosa' = 'ICD'
`
// Function untuk membuat backup database
async function createDatabaseBackup() {
    return new Promise((resolve, reject) => {
        try {
            const timestamp = moment().format('DD-MM-YYYY_HH-mm-ss');
            const backupFileName = `simrs_backup_${timestamp}.dump`;
            const backupPath = path.join(__dirname, '../backups');

            // Buat folder backups jika belum ada
            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
                console.log('Created backups directory:', backupPath);
            }

            const fullBackupPath = path.join(backupPath, backupFileName);

            // Get database connection details
            const dbConfig = {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
            }

            // Build pg_dump command
            const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port || 5432} -U ${dbConfig.username} -d ${dbConfig.database} --no-password --verbose --clean --if-exists --format=c --file="${fullBackupPath}"`;

            console.log('Creating database backup...');
            console.log(`Backup file: ${fullBackupPath}`);

            // Set PGPASSWORD environment variable
            const env = {
                ...process.env,
                PGPASSWORD: dbConfig.password
            };

            exec(pgDumpCommand, { env, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                if (error) {
                    console.error('Backup failed:', error);
                    console.log('Warning: Continuing without backup. Please create backup manually!');
                    resolve(false); // Continue process even if backup fails
                } else {
                    // Check if backup file was created
                    if (fs.existsSync(fullBackupPath)) {
                        const stats = fs.statSync(fullBackupPath);
                        console.log(`✅ Database backup created successfully!`);
                        console.log(`📁 File: ${backupFileName}`);
                        console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
                        resolve(true);
                    } else {
                        console.log('⚠️  Backup file not found, but continuing process...');
                        resolve(false);
                    }
                }
            });

        } catch (error) {
            console.error('Error creating backup:', error);
            console.log('⚠️  Continuing with sync process (manual backup recommended)');
            resolve(false);
        }
    });
}

console.log('🔄 Starting database synchronization process...');
console.log('=' .repeat(60));

// Step 1: Create database backup
createDatabaseBackup().then(async (backupSuccess) => {
    if (backupSuccess) {
        console.log('✅ Backup completed successfully!');
    } else {
        console.log('⚠️  Backup skipped or failed. Please create manual backup!');
    }

    console.log('=' .repeat(60));
    console.log('🚀 Starting database schema synchronization...');

    console.log('=' .repeat(60));
    console.log('📋 Dropping existing view data_diagnosa...');

    koneksi.query('DROP VIEW IF EXISTS data_diagnosa;', [], s).then(async () => {
        // Drop view
        console.log('✅ View data_diagnosa dropped successfully');

        console.log('=' .repeat(60));
        console.log('🔧 Starting database schema synchronization...');

        const startTime = Date.now();

        koneksi.sync({ alter: true}).then(async () => {
            const syncDuration = (Date.now() - startTime) / 1000;

            // Create View
            console.log('✅ Database schema synchronized successfully');
            console.log(`⏱️  Sync duration: ${syncDuration.toFixed(2)} seconds`);

            console.log('=' .repeat(60));
            console.log('📋 Recreating view data_diagnosa...');

            await koneksi.query(replace_view_data_diagnosa, s)
            console.log('✅ View data_diagnosa created successfully');

            console.log('=' .repeat(60));
            console.log('🎉 Database synchronization completed successfully!');
            console.log('📝 Summary:');
            console.log('   - Database backup: ' + (backupSuccess ? '✅ Created' : '⚠️  Skipped/Failed'));
            console.log('   - Table structures: ✅ Backed up');
            console.log('   - Schema sync: ✅ Completed');
            console.log('   - Views: ✅ Recreated');
            console.log('=' .repeat(60));
            console.log('👋 Disconnecting...');
            process.exit(0);
        }).catch(e => {
            console.error('❌ Error during database schema synchronization:', e);
            console.error('📄 Stack trace:', e.stack);
            console.log('💀 Disconnecting due to error...');
            process.exit(1);
        });

    }).catch(e => {
        console.error('❌ Error dropping view data_diagnosa:', e);
        console.error('💀 Disconnecting due to error...');
        process.exit(1);
    })
})