const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const client = require('../util/mail-client');
const { restart } = require('nodemon');

// Getting admin porfile
exports.getAdminProfile = async(req, res) => {
    // get comments number 
    const numberOfComments = await Comment.find().count();
    // get number of users from DB
    const numberOfUsers = await User.find().count() - 1;

    // get number of posts from DB
    const numberOfPosts = await Post.find().count();

    // get the most interaction post from DB
    const highPost = await Post.findOne().sort({commentsNo:-1});

    // get admin posts from DB
    const posts = await Post.find({userId:req.session.user}).sort({ postDate: 'desc' });
    res.render('admin/adminProfile', {
        pageTitle:'Dashboard',
        numberOfUsers: numberOfUsers,
        numberOfPosts: numberOfPosts,
        numberOfComments:numberOfComments,
        highestPost: highPost,
        posts: posts,
        isAuthed:req.session.isLoggedIn,
        user:req.user
    });
}

// Get all users
exports.getShowUsers = async(req, res) => {
    // fetch all users from DB
    const users = await User.find({admin:false});
    res.render('admin/showUsers', {users: users,
        pageTitle:'Users',
        isAuthed:req.session.isLoggedIn,
        user:req.user
    });
}

// Deleting user
exports.getDeleteUser = async(req, res , next) => {
    // Delete user's comments
    await Comment.deleteMany({userId:req.params.id});
    // Delete user's posts
    await Post.deleteMany({userId:req.params.id});
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/show-users');
}

// Get the page of sending email to user
exports.getSendEmail = (req, res, next) => {
    res.render('admin/send-email', {
        pageTitle:'Send Email',
        user:req.user,
        isAuthed:req.session.isLoggedIn,
        email:req.params.email
    });
}

// Sending email from admin to the user
exports.postSendEmail = (req, res, next) => {
    client.sendMail({
        to:req.body.email,
        from:'ahmedfawzy3351@gmail.com',
        subject:req.body.subject,
        html:`
                <h2>Email from blog admin</h2>
                <p>${req.body.message}</p>        
            `
    });
    req.flash('success', 'Email sent succussfully');
    res.redirect('/admin/show-users');
}

// pin post
exports.getPinPost = async(req, res, next) => {
    const post = await Post.findById(req.params.id)
    post.pinned = !post.pinned;
    await post.save()
    res.redirect('/');
}