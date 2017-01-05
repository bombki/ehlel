/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

	new: function(req, res) {
		res.view();
	},

	create: function(req, res, next) {

		var userObj = {
			name: req.param('name'),
			title: req.param('title'),
			email: req.param('email'),
			password: req.param('password'),
			confirmation: req.param('confirmation')
		}

		User.create( userObj, function userCreated(err, user) {
			
			// If there is an error
			// if (err) return next(err)

			if(err)	{
				console.log(err);
				req.session.flash = {
					err: err
				}
				// if error redirect back to sign-up page
				return res.redirect('/user/new');
			}	 

			// After successfully creating the user
			// redirect to the show action
			
			req.session.authenticated = true;
			req.session.User = user;
			
			// Change status to online
			user.online = true;
			user.save(function(err, user) {

				if(err) return next(err);

				user.action=" signed-up and logged-in.";

				// Let other subscribed sockets know that the user was created.
				User.publishCreate(user);

				// After successfully creating the user
				res.redirect('/user/show/'+ user.id);
			});
		});
	},

	show: function(req, res, next) {

		User.findOne(req.param('id'), function foundUser(err, user) {

			if(err) return next(err);
			if(!user) return next();

			res.view({
				user: user
			});

		});
	},

	index: function(req, res, next) {

		User.find(function foundUsers(err, users) {
			
			if(err) return next(err);

			res.view({
				users: users
			});
		});
	},

	edit: function(req, res, next) {

		User.findOne(req.param('id'), function foundUser(err, user) {

			if(err) return next(err);
			if(!user) return next('User doesn\'t exist.');

			res.view({
				user: user
			});
		});
	},

	update: function(req, res, next) {

		if(req.session.User.admin) {
			var userObj = {
				name: req.param('name'),
				title: req.param('title'),
				email: req.param('email'),
				admin: req.param('admin')
			}
		} else {
			var userObj = {
				name: req.param('name'),
				title: req.param('title'),
				email: req.param('email')
			}
		}

		User.update(req.param('id'), userObj, function userUpdated(err) {

			if(err) {
				return res.redirect('/user/edit/'+ req.param('id'));
			}

			res.redirect('/user/show/'+ req.param('id'));
		});
	},

	destroy: function(req, res, next) {

		User.findOne(req.param('id'), function foundUser(err, user) {

			if(err) return next(err);
			if(!user) return next('User doesn\'t exist.');

			User.destroy(req.param('id'), function userDestroyed(err) {
				if(err) return next(err);

				User.publishUpdate(user.id, {
					name: user.name,
					action: ' has been destroyed.'
				});

				// Let other sockets know that the user instance was destroyted.
				User.publishDestroy(user.id);
			});

			res.redirect('/user');
		});
	},

	subscribe: function(req, res) {

		User.find(function foundUsers(err, users) {

			if(err) return next(err);

			// subscribe this socket to the User model classroom
			User.subscribe(req.socket);

			// subscribe this socket to the user instance rooms
			User.subscribe(req.socket, users);

			// This will avoid a warning from the socket for tryingto render
			// html over the socket.
			res.send(200);			
		});
	}
};
