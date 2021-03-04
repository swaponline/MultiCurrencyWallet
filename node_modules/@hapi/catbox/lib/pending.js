'use strict';

const internals = {};


exports = module.exports = class {

    id = null;
    timeout = null;
    count = 1;
    rule = null;
    resolve = null;
    reject = null;

    constructor(id, rule) {

        this.id = id;
        this.rule = rule;

        this.promise = new Promise((resolve, reject) => {

            this.resolve = resolve;
            this.reject = reject;
        });
    }

    join() {

        ++this.count;
        return this.promise;
    }

    send(err, value, cached, report) {

        clearTimeout(this.timeout);

        if (err &&
            !cached) {

            this.reject(err);
            return;
        }

        if (!this.rule.getDecoratedValue) {
            this.resolve(value);
            return;
        }

        if (err) {
            report.error = err;
        }

        this.resolve({ value, cached, report });
    }

    setTimeout(fn, timeoutMs) {

        clearTimeout(this.timeout);
        this.timeout = setTimeout(fn, timeoutMs);
    }
};
