/**
 * Allow any authenticated user.
 */
module.exports = function(req, res, ok) {

    var sessionUserMatchesId = req.session.User.id === req.param('id');
    var isAdmin = req.session.User.admin;

    if ( !(sessionUserMatchesId || isAdmin)) {
        
        var noRightError = [{
            name: 'noRights',
            message: 'You must be an admin.'
        }]

        req.session.flash = {
            err: noRightError
        }

        res.redirect('/session/new');
        return;
    }

    ok();
};