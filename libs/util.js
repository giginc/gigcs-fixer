
const spawn = require('child_process').spawn;

module.exports = {
    run: (command, args, options, done) => {
        if (typeof(options) === 'function') {
            done = options;
            options = {};
        }
        options = Object.assign({ stdio: 'inherit' }, options);
        const child = spawn(command, args, options);
        child.on('close', (code) => done(code > 0 ? 'error' : null));
    }
};