const User = require('../models/user');
const bcrypt = require('bcrypt');
const post = require('../models/post');

// Get the plan of the user
exports.getPurchasePlan = (req, res, next) => {
    res.render('user/purchase-plan',  {
        pageTitle: 'Go Premium',
        isAuthed: req.session.isLoggedIn,
        user: req.user
    })
}

// storing new plan for the user
exports.postPurchasePlan = (req, res, next) => {
    User.findById(req.session.user)
    .then(user => {
        user.plan = 'premium';
        return user.save()
    })
    .then(() => {
        res.redirect('/');
    })
    .catch(err => {
        console.log(err);
    });
}

// Get the page for changing password
exports.getChangePassword = (req, res, next) => {
    res.render('user/change-password', {pageTitle:'Change Password',
        isAuthed: req.session.isLoggedIn,
        user:req.user,
        errorMsg:req.flash('error')
    });
}

// Storing new password
exports.postChangePassword = (req, res, next) => {
    // Fetch the user from DB
    User.findById(req.session.user)
    .then(user => {
        // checking the old password
        bcrypt.compare(req.body.oldPassword, user.password)
        .then(doMatch => {
            if (!doMatch){
                req.flash('error', 'The Password you entered is Incorrect');
                return res.redirect('/change-password')
            }
            // update the password
            bcrypt.hash(req.body.newPassword, 10)
            .then(hashedPassword => {
                user.password = hashedPassword;
                return user.save()
                .then(() => {
                    req.flash('success', 'password changed successfully')
                    res.redirect('/profile/edit');
                })
            })
        })
    })
    .catch(err => {
        console.log(err);
    })
}

// Get user profile page
exports.getUser = async(req, res, next) => {
    // Fetch user from DB
    const user = await User.findOne({username:req.params.username});
    // Checking auth for the user
    if(user && user._id.toString() !== req.session.user._id.toString()){
        // Fetching user's posts from DB
        const posts = await post.find({userId:user._id});
        return res.render('user/view', {
            pageTitle: user.name,
            isAuthed: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin,
            posts: posts,
            showedUser:user,
            user: req.session.user,
            });
    }
    return res.redirect('/')
    
}