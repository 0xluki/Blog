const express = require('express');
const router = express.Router();

const postContorller = require('../controllers/post');
const authentication = require('../util/authentication');

router.get('/new', authentication.isAuthed, authentication.isPremium, postContorller.getNew);

router.get('/edit/:id', authentication.isAuthed, authentication.isAdmin, postContorller.getEdit);

router.get('/:slug', authentication.isAuthed, postContorller.getNewPost);

router.post('/', authentication.isAuthed, authentication.isPremium, postContorller.postNew);

router.put('/:id', authentication.isAuthed, authentication.isAdmin, postContorller.putPost)

router.delete('/:id', authentication.isAuthed, authentication.isAdmin, postContorller.deletePost);

router.post('/comment', postContorller.postComment);

module.exports = router;