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

async function getUser(req, res) {
    try {
        const userName = req.params.username
        if (!isValid(userName)) {
            return res.status(400).send({ msg: "userName must be in string formate" })
        }
        const user = await userModel.findOne({ userName })
        if (!user) {
            return res.status(400).send({ msg: "user doesn't exists with the given userName" })
        }
        return res.status(200).send({ user })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

async function getUserFollowers(req, res) {
    try {
        const userName = req.params.username
        if (!isValid(userName)) {
            return res.status(400).send({ msg: "userName must be in string formate" })
        }
        const user = await userModel.findOne({ userName })
        if (!user) {
            return res.status(400).send({ msg: "user doesn't exists with the given userName" })
        }
        return res.status(200).send({ Followers: user.followers })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

async function getUserFollowing(req, res) {
    try {
        const userName = req.params.username
        if (!isValid(userName)) {
            return res.status(400).send({ msg: "userName must be in string formate" })
        }
        const user = await userModel.findOne({ userName })
        if (!user) {
            return res.status(400).send({ msg: "user doesn't exists with the given userName" })
        }
        return res.status(200).send({ Following: user.following })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

async function followTheUser(req, res) {
    try {
        const userName = req.params.username
        if (!isValid(userName)) {
            return res.status(400).send({ msg: "userName must be in string formate" })
        }
        const user = await userModel.findOne({ userName })
        if (!user) {
            return res.status(400).send({ msg: "user doesn't exists with the given userName" })
        }

        //finding the user to upadate the following list
        const userId = req.payload.userId
        const userData = await userModel.findById({ _id: userId.toString() })
        const followingList = userData.following
        followingList[userName] = user._id
        const updatedUser = await userModel.findByIdAndUpdate({ _id: userId }, { following: followingList }, { new: true })

        //finding the user to upadate the followers list
        const followersList = user.followers
        const name = userData.userName
        followersList[name] = userId
        await userModel.findOneAndUpdate({ userName }, { followers: followersList })
        return res.status(201).send({ updatedUser })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

async function unFollowTheUser(req, res) {
    try {
        const userName = req.params.username
        if (!isValid(userName)) {
            return res.status(400).send({ msg: "userName must be in string formate" })
        }
        const user = await userModel.findOne({ userName })
        if (!user) {
            return res.status(400).send({ msg: "user doesn't exists with the given userName" })
        }

        //finding the user to upadate the following list
        const userId = req.payload.userId
        const userData = await userModel.findById({ _id: userId })
        const following = userData.following
        if (!following.hasOwnProperty(userName)) {
            return res.status(400).send({ msg: "user doesn't exists with the given userName in the following list" })
        }
        delete following[userName]
        const updatedUser = await userModel.findByIdAndUpdate({ _id: userId }, { following: following }, { new: true })

        //finding the user to upadate the followers list
        const followersList = user.followers
        const name = userData.userName
        delete followersList[name]
        await userModel.findOneAndUpdate({ userName }, { followers: followersList })
        return res.status(201).send({ updatedUser })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

module.exports = { createUser, login, getUser, getUserFollowers, getUserFollowing, followTheUser, unFollowTheUser }