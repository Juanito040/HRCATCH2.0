const jwt = require('jsonwebtoken')

const checkToken = (req, res, next) => {
    if (!req.headers['authorization'] && !req.query.token) {
        return res.json({ err: 'token no incluido' });
    }

    const token = req.headers['authorization'] || req.query.token;

    let payload;
    try {
        payload = jwt.verify(token, 'aPPHusRT2024');
        req.user = payload;
    } catch {
        return res.json({ err: 'Token no valido' })
    }

    next();
}

module.exports = { checkToken }