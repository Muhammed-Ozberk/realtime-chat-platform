//session control on project pages
const loggedIn = function (req, res, next) {

    if (req.isAuthenticated()) {
        req.user = req.user || req.session.passport.user;
        return next();
    }
    else {
        res.redirect('/login');
    }
}

//session control on login and registration pages
const notLoggedIn = function (req, res, next) {

    if (!req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/chats');
    }
}

module.exports = { loggedIn, notLoggedIn };
