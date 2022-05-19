const crypto = require('crypto');

const client = require('../util/mail-client');

const Post = require('../models/post');
const User = require('../models/user');

// Getting the profile page
exports.getProfile = (req, res) => {
    // Fetch user data from DB
    User.findById(req.session.user._id)
        .then((user => {
            // Fetch user posts from DB
            Post.find({ userId: req.session.user })
                .then(posts => {
                    return res.render('profile/profile', {
                        pageTitle: 'Profile',
                        isAuthed: req.session.isLoggedIn,
                        isAdmin: req.session.isAdmin,
                        posts: posts,
                        user: user
                    });

                })
        }))

        .catch(err => {
            console.log(err);
        });
}

// Get edit profile page
exports.getEditProfile = (req, res) => {
    // Fetch user data from DB
    User.findById(req.session.user)
        .then(user => {
            res.render('profile/editProfile', {
                pageTitle: 'Edit Profile',
                isAuthed: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin,
                user: user,
                successMsg:req.flash('success')
            });
        })
}

// Update user info in the DB
exports.postEditProfile = async(req, res) => {
    const image = req.file;
    crypto.randomBytes(32, async(err, buffer) => {
        const token = buffer.toString('hex');
        // Fetch user data from DB
        const user = await User.findById(req.session.user);
        // Get the avatar of the user
        if (image) {
            user.avatar = '/' + image.path;
        }
        user.name = req.body.name;
        // Checking for a new username
        if(user.username !== req.body.username){
            // Search for the username in DB
            existingUser = await User.findOne({ username: req.body.username })
            // Checking if the username already exists
            if (existingUser) {
                req.flash('error', 'This username is taken');
                return res.redirect('/profile/edit');
            }
            user.username = req.body.username;
        }
        // Checking for a new email
        if (user.email !== req.body.email) {
            // Search for the email in DB
            existingUser = await User.findOne({ email: req.body.email })
            // Checking if the email already exists
            if (existingUser) {
                req.flash('error', 'This email already being used');
                return res.redirect('/profile/edit');
            }
            // Confirmation for the new email
            user.confirmationToken = token;
            user.changeEmail = req.body.email;
            client.sendMail({
                from: 'ahmedfawzy3351@gmail.com',
                to: req.body.email,
                subject: 'Email Change',
                html: `<h1>You requested to change your email</h1>
                          <p>by clicking on this link you are confirming your new email</p>
                          <a href="http://localhost:3000/profile/change-email/${token}">Confirm</a>  
                        `
            })
            req.flash('succes', 'Confiramtion Link Sent to your Email');
        }
        // Update the date in the DB
        await user.save();
        return res.redirect('/profile')
    })
}

// changing the email
exports.getChagneEmail = (req, res, next) => {
    // Fetch the email confirmation from DB
    User.findOne({ confirmationToken: req.params.token })
        .then(user => {
            if (!user) {
                return res.redirect('/invalid-link');
            }
            user.email = user.changeEmail;
            user.changeEmail = undefined;
            user.confirmationToken = undefined;
            // Storing the new email
            return user.save()
                .then(() => {
                    res.redirect('/profile');
                })
        })
        .catch(err => {
            console.log(err);
        })
}