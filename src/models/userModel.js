const mongoose = require('mongoose')


const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        followers: {
            type: Object,
            default: {}
        },
        following: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("user", userSchema)