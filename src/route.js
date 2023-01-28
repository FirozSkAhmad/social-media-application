const express = require('express');
const router = express.Router()

const { createUser, login } = require('./controllers/userController');

// router.get('/get', function (req, res) {
//     res.send("Working fine")
// })

router.post('/createuser', createUser);
router.post('/login', login)

module.exports = router