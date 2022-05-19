const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/signup', authController.getSignUp);

router.post('/signup', authController.postSignUp);

router.get('/signin', authController.getSignIn);

router.post('/signin', authController.postSignIn);

router.get('/confirm/:token',authController.getConfirmEmail);

router.get('/logout', authController.getLogOut);

router.get('/check-email',authController.getCheckEmail);

router.get('/invalid-link', authController.getInvalidLink);

router.get('/forgot-password', authController.getForgotPassword);

router.post('/forgot-password', authController.postForgotPassword);

router.get('/reset-password/:token', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

module.exports = router;
