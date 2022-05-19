// 404 Page
exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle:'Page Not Found',
        isAuthed:req.session.isLoggedIn,
        user:req.user
        }
    );
}