const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId

async function authentication(req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        jwt.verify(token, 'mysecretkey', (err, decoded) => {
            if (err) {
                return res.status(401).send({ msg: err.message })
            }
            req.payload = decoded
            next()
        })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

async function authorization(req, res, next) {
    const userIdP = req.payload.userId
    const userId = req.body.myUserId
    if (!userId) {
        return res.status(400).send({ msg: "required userId" })
    }
    if (!objectId.isValid(userId)) {
        return res.status(400).send({ msg: `invalid objectId ${userId}` })
    }
    if (userId == userIdP) {
        next()
    }
    else {
        return res.status(403).send({ msg: "not authorized" })
    }
}

module.exports = { authentication, authorization }