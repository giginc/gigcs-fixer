
const async = require('async');
const util = require('./util');

module.exports = (done) => {
    async.waterfall([
        (done) => {
            util.run('php', ['--version'], err => {
                if (err) console.log('PHP is not installed');
                else console.log('PHP installed');
                done();
            });
        },
    ], done)
};