/**
 * Allow any authenticated user.
 */
module.exports = function(req, res, ok) {

    // User is allowed, proceed to controller
    if (req.session.User && req.session.User.admin) {
        return ok();
    }

    // User is not allowed
    else {

        var requiredAdminError = [{
            name: 'requiredAdminError',
            message: 'You must be an admin.'
        }]
        
        req.session.flash = {
            err: requiredAdminError
        }

        res.redirect('/session/new');
        return;
    }
};