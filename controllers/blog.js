const Post = require('../models/post');

const client = require('../util/mail-client');

// Get the index page (Home page)
exports.getIndex = async(req, res, next) => {
    // Fetch the pinned posts from DB and sort desc by the time
    const pinned = await Post.find({pinned:true}).sort({ postDate: 'desc' });
    // Fetch all posts from DB and sort desc by the time
    const posts = await Post.find().sort({ postDate: 'desc' });

    res.render('blog/index', {
        pageTitle:'Home Page',
        isAuthed:req.session.isLoggedIn,
        isAdmin:req.session.isAdmin,
        posts:posts,
        pinned:pinned,
        user:req.user,
        info:req.flash('info')
        }
    );
}

// Get the contact us page
exports.getContactUs = (req, res, next) => {
    res.render('blog/contact-us', {
        pageTitle:'Contact Us',
        isAuthed:req.session.isLoggedIn,
        user:req.user,
        successMsg:req.flash('success')
        }
    );
}

// Sending email to the admin from the premium user
exports.postContactUs = (req, res, next) => {
    client.sendMail({
        to:'ahmedfawzy2251@gmail.com',
        from:'ahmedfawzy3351@gmail.com',
        subject:req.body.subject,
        html:`
                <h1>Message from ${req.body.name} </h1>
                <h3>${req.body.email}</h3>
                <p>${req.body.message}</p>
            `
    })
    req.flash('success', 'Message Sent Successfully');
    res.redirect('/contact-us');
}

// Get about page
exports.getAbout = (req, res, next) => {
    res.render('blog/about', {
        pageTitle:'About',
        isAuthed:req.session.isLoggedIn,
        user:req.user
        }
    );
}

// Get the category page which contain all posts of the same category
exports.getCategory = async(req, res, next) => {
    // Fetch pinned posts from DB
    const pinned = await Post.find({pinned:true}).sort({ postDate: 'desc' });
    // Fetch all posts that belong to the choosen category from DB
    const posts = await Post.find({category:req.params.category}).sort({ postDate: 'desc' });
    res.render('blog/category', {
        pageTitle:req.params.category,
        isAuthed:req.session.isLoggedIn,
        isAdmin:req.session.isAdmin,
        posts:posts,
        pinned:pinned,
        user:req.user,
        info:req.flash('info')
        }
    );
}