const jwt = require('jsonwebtoken');

exports.decodeToken = (req, res, next) => {
    try {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = decoded.userId;
        }
        if (req.body.userId) {
            next();
        } else {
            res.status(401).send({
                status: 401,
                message: 'Unauthorized access, please relogin',
                error
            })
        }
    } catch (error) {
        res.status(401).send({
            status: 401,
            message: 'Unauthorized access, please relogin',
            error
        })
    }
}

exports.decodeTokenForQuestions = (req, res, next) => {
    try {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = decoded.userId;
            req.body.isVerified = decoded.isVerified;
        }
        if (req.body.userId && req.body.isVerified) {
            next();
        } else {
            res.status(401).send({
                status: 401,
                message: 'Unauthorized access, please verify your email and relogin',
                error
            })
        }
    } catch (error) {
        res.status(401).send({
            status: 401,
            message: 'Unauthorized access, please relogin',
            error
        })
    }
}
