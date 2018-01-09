
const path = require('path');
const fs = require('fs-extra');
const async = require('async');
const request = require('superagent');
const util = require('./util');
const recursive = require('recursive-readdir');
const md5 = require('md5-file');
const crypto = require('crypto');
const pretty = require('pretty');
const colors = require('colors');
const beautify = require('js-beautify');

const COMPOSER_URL = 'https://getcomposer.org/composer.phar';
const COMPOSER_VENDOR = path.join(__dirname, '../vendor/bin/php-cs-fixer');
const COMPOSER_PATH = path.join(__dirname, '../res/bin/composer');
const LAST_UPDATE_CHECK_FILE = path.join(__dirname, '../.last_check');
const UPDATE_LIFE = 24 * 3600 * 7 * 1000; // 一週間

function fixPhp(target, done) {
    let last_check = 0;
    const now = Date.now();
    async.waterfall([
        (done) => fs.exists(path.join(__dirname, '../res/bin/composer'), exists => done(null, exists)),
        (exists, done) => {
            if (!exists) {
                console.log('composer not found, download from: ', COMPOSER_URL);
                return request.get(COMPOSER_URL).responseType('blob').end((err, res) => {
                    if (err) return done(err);
                    return fs.writeFile(COMPOSER_PATH, res.body, { mode: 0o766 }, done);
                });
            }
            return fs.ensureFile(LAST_UPDATE_CHECK_FILE, done);
        },
        (done) => {
            fs.readFile(LAST_UPDATE_CHECK_FILE, (err, buffer) => {
                if (err) return done(err);
                const content = buffer.toString();
                last_check = content ? parseInt(content) : 0;
                return done();
            })
        },
        (done) => {
            if (now - last_check < UPDATE_LIFE) return done();
            util.run(COMPOSER_PATH, ['self-update'], done);
        },
        (done) => {
            if (now - last_check < UPDATE_LIFE) return done();
            util.run(COMPOSER_PATH, ['install'], { cwd: path.join(__dirname, '../') }, err => {
                if (err) return done(err);
                return fs.writeFile(LAST_UPDATE_CHECK_FILE, now, done);
            });
        },
        (done) => {
            util.run('php', [COMPOSER_VENDOR, 'fix', target], done);
        }
    ], done)
}

function fixFrontLangs(target, filters, done) {
    recursive(target, (err, files) => {
        if (err) return done(err);
        async.series(files.filter(f => filters.indexOf(path.extname(f)) >= 0).map(file => done => {
            let content = null;
            async.parallel([
                (done) => fs.readFile(file, (err, buffer) => {
                    if (err) return done(err);
                    switch (path.extname(file)) {
                        case '.html':
                            content = pretty(buffer.toString(), { indent_size: 4 });
                            break;
                        case '.css':
                            content = beautify.css(buffer.toString());
                            break;
                        case '.js':
                            content = beautify(buffer.toString());
                            break;

                    }
                    return done(null, crypto.createHash('md5').update(content).digest('hex'));
                }),
                (done) => md5(file, done)
            ], (err, res) => {
                if (err) return done(err);
                if (res[0] === res[1]) return done();
                return fs.writeFile(file, content, err => {
                    if (err) return done(err);
                    console.log('FIX'.green, file);
                    done();
                });
            });
        }), done);
    });
}

module.exports = (lang, target, done) => {
    switch (lang) {
        case 'front':
            fixFrontLangs(target, ['.js', '.css', '.sass', '.scss', '.html'], done);
            break;
        case 'html':
            fixFrontLangs(target, ['.html', '.htm'], done);
            break;
        case 'css':
            fixFrontLangs(target, ['.css', '.sass', '.scss'], done);
            break;
        case 'js':
            fixFrontLangs(target, ['.js'], done);
            break;
        case 'php':
            fixPhp(target, done);
            break;
    }
};