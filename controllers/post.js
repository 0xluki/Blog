const moment = require('moment');

const Post = require('../models/post');
const Comment = require('../models/comment');


// Get the page for new post
exports.getNew = (req, res, next) => {
    res.render('posts/new', {
        post: new Post(),
        pageTitle: 'Add Post',
        isAuthed: req.session.isLoggedIn,
        user: req.user
    });
}

// Storing the new post and fetch the the page that contain the post
exports.postNew = async (req, res, next) => {
    const image = req.file;
    //check if admin
    if (!req.user.admin) {
        //time validation - 2posts per month
        let start = moment().startOf('month').toDate();
        let end = moment().endOf('month').toDate();
        // Fetching the number of posts of the current user
        const postsNo = await Post.find({ userId: req.session.user, postDate: { $gt: start, $lt: end } }).count();
        if (postsNo >= 2) {
            req.flash('info', 'You have only 2 posts per month.');
            return res.redirect('/');
        }
    }
    // Storing the new post data in Post
    let post = new Post({
        title: req.body.title,
        imageUrl: '/' + image.path,
        content: req.body.content,
        userId: req.session.user._id,
        commentsNo: 0,
        pinned:false,
        category:req.body.category
    })
    try {
        // Storing the new post in the DB
        post = await post.save();
        return res.redirect(`/posts/${post.slug}`);
      // Redirect to the index page if there is an error
    } catch (e) {
        req.flash('info', 'You have only 2 posts per month.');
        return res.redirect('/');
    }
}

// Get new post page
exports.getNewPost = async (req, res, next) => {
    // Fetch pinned posts from DB
    const pinned = await Post.find({ pinned: true }).sort({ postDate: 'desc' });
    // Fetch the new post from DB
    const post = await Post.findOne({ slug: req.params.slug }).populate('userId');
    // Fetch the comments of the post from DB
    const comments = await Comment.find({ postId: post.id }).populate('userId').sort({ commentDate: 'desc' });
    if (post == null) res.redirect('/');
    res.render('posts/show', {
        post: post,
        pageTitle: 'Show Post',
        isAuthed: req.session.isLoggedIn,
        user: req.user,
        pinned: pinned,
        comments: comments,
    });
}

// Deleting  post
exports.deletePost = async (req, res, next) => {
    // Delete the comments of the post from DB
    await Comment.deleteMany({ postId: req.params.id });
    // Delete the post from DB
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/');
}

// Get edit post page populated with the post data
exports.getEdit = async (req, res, next) => {
    // Fetch the post data from DB
    const post = await Post.findById(req.params.id);
    res.render('posts/edit', {
        post: post,
        pageTitle: 'Edit Post',
        isAuthed: req.session.isLoggedIn,
        user: req.user
    });
}

// Update post info and getting the post page
exports.putPost = async (req, res, next) => {
    image = req.file;
    // Fetch the post data from DB
    let post = await Post.findById(req.params.id);
    // Fetch the image of the post
    if (image) {
        post.imageUrl = '/' + image.path;
    }
    // Post data
    post.category = req.body.category;
    post.title = req.body.title;
    post.content = req.body.content;
    try {
        // Storing new data into the DB
        post = await post.save();
        res.redirect(`/posts/${post.slug}`);
    } catch (e) {
        // For the error reloding the same page with same data
        res.render('posts/edit', {
            post: post,
            pageTitle: 'Edit post',
            isAuthed: req.session.isLoggedIn,
            user: req.user
        });
    }
}

// Storing new comment into the DB and get the post page
exports.postComment = async (req, res) => {
    // Fetch the post from DB 
    let post = await Post.findById(req.body.postId);
    post.commentsNo += 1;
    let comment = new Comment({
        comment: req.body.comment,
        postId: req.body.postId,
        userId: req.session.user._id
    })
    try {
        // Storing the comment in the DB
        comment = await comment.save();
        post = await post.save()
        res.redirect(`/posts/${req.body.postSlug}`);
    } catch (e) {
        res.redirect(`/posts/${req.body.postSlug}`);
    }
}