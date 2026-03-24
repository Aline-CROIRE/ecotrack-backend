const sanitize = require('mongo-sanitize');

const sanitizeRequest = (req, res, next) => {
    // 1. Sanitize Body
    if (req.body) {
        req.body = sanitize(req.body);
    }

    // 2. Sanitize Params
    if (req.params) {
        req.params = sanitize(req.params);
    }

    // 3. Sanitize Query (The tricky part)
    // Instead of overwriting req.query, we clean the keys inside it
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            req.query[key] = sanitize(req.query[key]);
        });
    }

    next();
};

module.exports = sanitizeRequest;