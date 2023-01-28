const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { isValid, isValidEmail, checkPassword } = require('../validations')


async function createUser(req, res) {
    try {
        const data = req.body
        const { email, password } = data
        const keys = ["userName", "email", "password"]
        for (let key of keys) {
            if (!data[key]) {
                return res.status(400).send({ msg: `required ${key}` })
            }
        }
        for (let key of keys) {
            if (!isValid(data[key])) {
                return res.status(400).send({ msg: `${key} must be in string formate` })
            }
        }

        if (!isValidEmail(email)) {
            return res.status(400).send({
                msg:
                    "format is invalid"
            });
        }

        if (!checkPassword(password)) {
            return res.status(400).send({
                msg:
                    "password should contain at least (1 lowercase, uppercase ,numeric alphabetical character and at least one special character and also The string must be  between 8 characters to 16 characters)"
            });
        }
        const uniqueKeys = ["userName", "email"]
        for (let key of uniqueKeys) {
            let condition;
            if (key === 'userName') {
                condition = {
                    userName: data[key]
                }
            }
            else {
                condition = {
                    email: data[key]
                }
            }
            const user = await userModel.findOne(condition)
            if (user) {
                return res.status(400).send({
                    msg:
                        `${key} is already exists`
                });
            }
        }
        const hashPassword = await bcrypt.hash(password, 10);
        data.password = hashPassword
        const createdUser = await userModel.create(data)
        return res.status(201).send(createdUser)
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

async function login(req, res) {
    try {
        const credentials = req.body
        const user = await userModel.findOne({ email: credentials.email })
        if (!user) {
            return res.status(400).send({ msg: "user doesn't exists with the given email" })
        }
        else {
            const match = await bcrypt.compare(credentials.password, user.password)
            if (match) {
                const token = jwt.sign({
                    userId: user._id
                }, "mysecretkey")
                return res.status(201).send({ token })
            }
            else {
                return res.status(201).send({ msg: "incorrect Password" })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

module.exports = { createUser, login }