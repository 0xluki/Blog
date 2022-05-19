const express = require('express');

const authentication = require('../util/authentication')

const router = express.Router();

const userController = require('../controllers/user');

router.get('/premium', authentication.isAuthed, authentication.isBasic, userController.getPurchasePlan);

router.post('/premium', authentication.isAuthed, authentication.isBasic, userController.postPurchasePlan);

router.get('/change-password', authentication.isAuthed, userController.getChangePassword);

router.post('/change-password', authentication.isAuthed, userController.postChangePassword);

router.get('/user/:username', authentication.isAuthed, userController.getUser);
 
module.exports = router;