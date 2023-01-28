const express = require('express');
const router = express.Router()

const { createUser, login, getUser, getUserFollowers, getUserFollowing, followTheUser, unFollowTheUser } = require('./controllers/userController');
const { authentication, authorization } = require('./middlewares/auth');


router.post('/users', createUser);
router.post('/login', login)
router.get('/users/:username', authentication, getUser)
router.get('/users/:username/followers', authentication, getUserFollowers)
router.get('/users/:username/following', authentication, getUserFollowing)
router.post('/users/:username/follow', authentication, authorization, followTheUser)
router.delete('/users/:username/follow', authentication, authorization, unFollowTheUser)

module.exports = router