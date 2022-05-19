const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const client = require('../util/mail-client');

// Get sign up page
exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle:'sign up',
        errorMsg:req.flash('error'),
        isAuthed:req.session.isLoggedIn,
        user:req.user
    })
}

// Storing new user into DB
exports.postSignUp = (req, res, next) => {
    // new user data
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const gender = req.body.gender;
    const password = req.body.password;
    // Search for the same email and username in the DB
    User.findOne({$or:[{email:email},{username:username}]})
    .then(userInfo => {
        // Cehcking for the username and email
        if(userInfo){
            const msg = userInfo.username == username ? 'this username is already taken.' : 'this email is already being used.';
            req.flash('error', msg)
            return res.redirect('/signup');

        }
        crypto.randomBytes(32, (err,buffer) => {
            token = buffer.toString('hex');
            bcrypt.hash(password, 10)
            .then(hashedPassword => {
                // new user info
                const user = new User({
                    name:name,
                    email:email,
                    username:username,
                    plan:"basic",
                    gender:gender,
                    avatar:'/images/avatar/profile.png',
                    password:hashedPassword,
                    confirmationToken:token,
                    admin: false
                });
                // Saving new user
                return user.save()
            })
            .then(() => {
                // Sending confirmation
                client.sendMail({
                    from:'ahmedfawzy3351@gmail.com',
                    to:email,
                    subject:'Welcome to Blog! Confirm your Email',
                    html:`<h1>let's confirm your Email</h1>
                          <p>by clicking on this link you are confirming your email</p>
                          <a href="http://localhost:3000/confirm/${token}">Confirm</a>  
                        `
                    
                });
                res.redirect('/check-email');
            })
        })

    })
    .catch(err => {
        console.log(err);
    })
}

// Getting email confirmation page
exports.getConfirmEmail = (req, res, next) => {
    token = req.params.token;
    // Fetch confirmation from DB and confirming the email
    User.findOne({confirmationToken:token})
    .then(user => {
        if (!user){
            return res.redirect('/invalid-link');
        }
        user.confirmed = true;
        user.confirmationToken = undefined;
        return user.save()
        .then(() => {
            req.flash('success', 'You can now login');
            return res.redirect('/signin')
        })
    })
    .catch(err => {
        console.log(err);
    });

}

// Get check email page
exports.getCheckEmail = (req, res, next) => {
res.render('auth/check-email', {
    pageTitle:'check your email',
    isAuthed:req.session.isLoggedIn,
    user:req.user
})
}

// Get sign in page
exports.getSignIn = (req, res, next) => {
    res.render('auth/signin', {
        pageTitle:'Sign In',
        errorMsg:req.flash('error'),
        successMsg:req.flash('success'),
        isAuthed:req.session.isLoggedIn,
        user:req.user
    })
}

// Sign in 
exports.postSignIn = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // Check for the email and password
    User.findOne({email:email})
    .then(userInfo => {
        if(!userInfo){
            req.flash('error', 'Invalid email or password');
            return res.redirect('/signin');
        }
        if(!userInfo.confirmed){
            req.flash('error', 'Confirm your email to login');
            return res.redirect('/signin');
        }
        bcrypt.compare(password, userInfo.password)
        .then(doMatch => {
            if (!doMatch){
                req.flash('error', 'Invalid email or password');
                return res.redirect('/signin');
            }
            if (userInfo.email === 'admin@blog.com'){
                req.session.isAdmin = true;
            }
            req.session.isLoggedIn = true;
            req.session.user = userInfo;
            return req.session.save(() => {
                res.redirect('/')
            })
        })
    })
    .catch(err => {
        console.log(err);
    })
}

// Get invalid link confirmation page
exports.getInvalidLink = (req, res, next) => {
    res.render('auth/invalid-link',{
        pageTitle:"invalid Link",
        isAuthed:req.session.isLoggedIn,
        user:req.user
    });
}

// Log out
exports.getLogOut = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}

// Get forgot password page
exports.getForgotPassword = (req, res, next) => {
    res.render('auth/forgot-password', {
        pageTitle:'Forgot Password',
        isAuthed: req.session.isLoggedIn,
        user:req.user,
        errorMsg:req.flash('error')
    })
}

// Send email for forgot password
exports.postForgotPassword = (req, res, next) => {
    // Fetch user's email from DB
    User.findOne({email:req.body.email})
    .then (user => {
        // check for existing of the user
        if (!user){
            req.flash('error', 'This email doesn\'t exist');
            return res.redirect('/forgot-password');
        }
        crypto.randomBytes(32, (err, buffer) => {
            token = buffer.toString('hex');
            user.resetToken = token;
            //expires after 1 hour
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save()
            .then(() => {
                // Send email for resetting password
                client.sendMail({
                    to:req.body.email,
                    from:'ahmedfawzy3351@gmail.com',
                    subject:'Password reset request',
                    html:`
                    <h1>Password Reset</h1>
                    <p>If you requested a password reset, click the button below. If you didn't make this request, ignore this email. </p>
                    <a href="http://127.0.0.1:3000/reset-password/${token}">Reset</a>
                    
                    `
                });
                return res.redirect('/check-email');

            })

        })

    })
    .catch(err => {
        console.log(err);
    })
}

// Get reset password page
exports.getResetPassword = (req, res, next) => {
    User.findOne({resetToken:req.params.token, resetTokenExpiration:{$gt: Date.now()}})
    .then(user => {
        if (!user){
            return res.redirect('/invalid-link');
        }
    return res.render('auth/reset-password', {
        pageTitle:'Reset Password',
        isAuthed:req.session.isLoggedIn,
        userId:user._id.toString(),
        user:user
        })
    })
    .catch(err => {
        console.log(err);
    })
}

// Reset password
exports.postResetPassword = (req, res, next) => {
    const userId = req.body.userId;
    const password = req.body.password;
    User.findOne({_id:userId, resetTokenExpiration:{$gt: Date.now()}})
    .then(user => {
        if (!user){
            return res.redirect('/invalid-link');
        }
        bcrypt.hash(password, 10)
        .then(hashedPassword => {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            return user.save()
            .then(() => {
                req.flash('success', 'Password changed successfully. You can now login');
                return res.redirect('/signin');
            })

        })
    })
    .catch(err => {
        console.log(err);
    })
}