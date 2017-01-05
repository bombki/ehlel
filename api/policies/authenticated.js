/**
 * Allow any authenticated user.
 */
module.exports = function(req, res, ok) {

    // User is allowed, proceed to controller
    if (req.session.authenticated) {
        return ok();
    }

    // User is not allowed
    else {

        var requiredLoginError = [{
            name: 'requireLogin',
            message: 'You must be signed in.'
        }]
        
        req.session.flash = {
            err: requiredLoginError
        }

        res.redirect('/session/new');
        return;
    }
};