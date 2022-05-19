const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin');
const authentication = require('../util/authentication')

router.get('/', authentication.isAdmin, adminController.getAdminProfile);

router.get('/show-users', authentication.isAdmin, adminController.getShowUsers);

router.get('/delete-user/:id', authentication.isAdmin, adminController.getDeleteUser);

router.get('/send-email/:email', authentication.isAdmin, adminController.getSendEmail);

router.post('/send-email', authentication.isAdmin, adminController.postSendEmail);

router.get('/pin/:id', authentication.isAdmin, adminController.getPinPost);

module.exports = router;