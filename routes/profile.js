const express = require('express');

const router = express.Router();

const profileController = require('../controllers/profile');

router.get('/', profileController.getProfile);

router.get('/edit', profileController.getEditProfile);

router.post('/edit', profileController.postEditProfile);

router.get('/change-email/:token', profileController.getChagneEmail);

module.exports = router;