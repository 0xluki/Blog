exports.isAuthed = (req, res, next) => {
    loginStatuts = req.session.isLoggedIn;
    if(!loginStatuts){
        req.flash('error', 'Login to your account first');
        return res.redirect('/signin');
    }
    next();
}

exports.isPremium = (req, res, next) => {
    if (req.user.plan === 'basic'){
        return res.redirect('/premium');
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    adminStatus = req.session.isAdmin;
    if(!adminStatus){
        return res.redirect('/');
    }
    next();
}

exports.isBasic = (req, res, next) => {
    if (req.user.plan === 'basic'){
        return next()
    }
    res.redirect('/')
}