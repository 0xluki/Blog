const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog');
const authentication = require('../util/authentication');

router.get('/', blogController.getIndex);

router.get('/contact-us', authentication.isAuthed, authentication.isPremium, blogController.getContactUs);

router.get('/about', blogController.getAbout);

router.post('/contact-us', authentication.isAuthed, authentication.isPremium, blogController.postContactUs);

router.get('/category/:category', blogController.getCategory);

module.exports = router; 