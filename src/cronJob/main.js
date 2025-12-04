const CronJob = require('cron').CronJob;
const Warlock = require('node-redis-warlock');
// const redis = require('redis').createClient();

const { createClient } = require("redis")
const client = createClient({ url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`, legacyMode: true });
client.connect().catch(console.error)

const warlock = new Warlock(client);
const async = require('async');

const jadwalDepresiasiController = require('../module/jadwal_depresiasi/controller')

function executeOnce (key, ttl, callback) {
    warlock.lock(key, ttl, function(err, unlock) {
        if (err) {
            // Something went wrong and we weren't able to set a lock
            return;
        }

        if (typeof unlock === 'function') {
            setTimeout(function() {
                callback(unlock);
            }, 1000);
        }
    });
}

function JobTasks (unlock) {
    async.parallel([
        jadwalDepresiasiController.cronJob,
        // etc...
    ],
    (err) => {
        if (err) {
            // logger.error(err);
            console.error(err)
        }

        unlock();
    });
}
/** Setiap akhir bulan sekali */
new CronJob({
    cronTime: '0 23 28-31 * *',
    // cronTime: '*/5 * * * *',
    onTick: function () {
        executeOnce('lock-JobTasks', 10000, JobTasks);
    },
    start: true,
    runOnInit: true,
    timeZone: 'asia/jakarta'
});