// app/routes.js
module.exports = function(app, passport, connection) {
	// =====================================
	// import package ======================
	// =====================================
	
	var path = require('path');
	var formidable = require('formidable');
	var fs = require('fs');
	var http = require('http');
	var crypto = require('crypto');
	const contractInstance = require('./deployContract.js');
	const web3 = require('./web3Client.js');
	var algorithm = 'sha256';
	var mkdirp = require('mkdirp');
	
	var multer = require('multer');
	var init_path = path.resolve(".")+'/uploads/';
	var resize = require('./resize');
	var convert = require('./convert');
	
	var upload = multer({ dest:  init_path});
	// var upload = multer({ dest: init_path });

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		// res.render('index.ejs'); // load the index.ejs file
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            // successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
			// console.log("hello");
			console.log('/profile/' + req.user.id);
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
			}
			var user_path = init_path + req.user.username + '/';
			console.log(user_path);
			// if user path not created then create the new one folder for a user
			mkdirp(user_path, function (err) {
				if (err) console.error(err)
				else console.log('user path not created --> create user path')
			});	
			// upload = multer({ dest: user_path });

			res.redirect('/profile/' + req.user.id);
			// res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/login', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile/:userId' , isLoggedIn, function(req, res) {
		// console.log(req.user);
		// console.log(req.params);
		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {

				console.log(result.length);
				if(result.length==0)
				{
					res.render('init_profile.ejs', {
				
						user : req.user // get the user
						//  out of session and pass to template
						
					});		
				}
				else {
					// console.log(result);
					res.render('profile.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}
			}
		});
	
	});
	
	// =====================================
	// UPLOAD PAGE =========================
	// =====================================
	app.get('/profile/:userId/upload', isLoggedIn, function(req, res) {
		// console.log("hello");

		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {
				console.log(result.length);
				if(result.length==0)
				{
					res.render('init_upload.ejs', {
				
						user : req.user // get the user
						//  out of session and pass to template
						
					});		
				}
				else {
					res.render('upload.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}	
			}
		});
		
	});

	// =====================================
	// VERIFY PAGE =========================
	// =====================================
	app.get('/profile/:userId/verify', isLoggedIn, function(req, res) {
		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {
				console.log(result.length);
				if(result.length==0)
				{
					res.render('init_verify.ejs', {
				
						user : req.user // get the user
						//  out of session and pass to template
						
					});		
				}
				else {
					res.render('verify.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}	
			}
		});
	});

	// =====================================
	// FILTER ==============================
	// =====================================
	app.post('/profile/:userId/filter', isLoggedIn, function (req,res) {
		console.log(req.body);
		var month = convert(req.body.month);
		var year = req.body.year;

		if(year) {
			if(month===''){
				var date_filter = year + '-%';
			}
			else {
				var date_filter = year + '-' + month + '-%';
			}
		}
		else {
			if(month===''){
				var date_filter = '%';
			}
			else {
				var date_filter = '%' + '-' + month + '-%';
			}
		}
		var file_name = req.body.file_name;
		console.log(date_filter);
		console.log(file_name);
		
		var sql = 	"SELECT * FROM file_index WHERE user_id = " + req.user.id + " AND created_at LIKE '" + date_filter + "'"
					+ " AND file_name LIKE '%" + file_name + "%'"; 
		console.log(sql)
		connection.query(sql, function(err, result) {

			if(err)	throw err;
			if(result.length) {
				
				res.render('profile.ejs', {
						
					user : result // get the user
					//  out of session and pass to template
					
				});

			}
			else {
				// var redirect_path = '/profile/' + req.user.id;
				// res.redirect(redirect_path);	// fix tmr
				res.render('filter_notfound.ejs', {
					user : req.user
				});
			}
		});

	});

	// =====================================
	// UPLOAD ==============================
	// =====================================
	app.post('/upload', upload.single('file'), isLoggedIn, function (req, res) {
		console.log(req.file);
		if(!req.file) res.redirect('/profile/' + req.user.id);
		else {

			var real_name = req.file.originalname;
			var file_path = init_path + req.user.username + '/' + req.file.originalname;
			// var file_path = '/uploads/' + req.file.originalname;
			console.log(file_path);
			
			var shasum = crypto.createHash(algorithm);
			fs.rename(req.file.path, file_path, function(err) {
				if (err) {
					console.log(err);
					res.send(500);
				} else {
					res.redirect('/profile/' + req.user.id);
					fs.readFile(file_path, function(err, data) {
						if (err) console.log(err);
						else {
							console.log('hello');
							shasum.update(data);
							var d = shasum.digest('hex');
							var user_id = req.user.id;
							console.log(user_id);
							var username = req.user.username;
							console.log(username);
							var file_name = real_name;
							console.log(file_name);
							var transaction_id = contractInstance.file_dgst(d, {from: web3.eth.accounts[0]});
							console.log(transaction_id);
							var blockNumber = web3.eth.getTransaction(transaction_id).blockNumber;
							console.log(blockNumber);
							var sql = 	'INSERT INTO file_index (user_id, username, file_name, transaction, blockNumber) VALUES (' 
							+ user_id + ',' + '"' + username + '"' + ',' + '"' + file_name + '"' + ',' + '"' + transaction_id + '"' 
							+ ',' + '"' + blockNumber + '"' +')';
							console.log(sql);
							connection.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record updated");
								
							});
						}
					});
					
				}
			});

		}
		
	});

	// =====================================
	// VERIFY ==============================
	// =====================================
	app.post('/verify', upload.single('file'), isLoggedIn, function (req, res) {
		console.log(req.file);
		if(!req.file) res.redirect('/profile/' + req.user.id);
		else {

			var shasum = crypto.createHash(algorithm);
			var file_name = req.file.originalname;
			var sql = 'SELECT transaction FROM file_index WHERE file_name = ? AND username = ?';
			var blockchain_hash_value = '';
			connection.query(sql, [file_name, req.user.username], function (err, result) {
				if (err) throw err;
				if (!result.length) {
					fs.unlinkSync(req.file.path);	//unlink the uncomplete text file output
					console.log('file not found')
					res.redirect('/not_found');
				}
				else {
			
					var transaction = result[0].transaction;
					console.log(transaction);
					var input = web3.eth.getTransaction(transaction).input;
					var temp_string = input.substr(138);
					var temp_string_length = temp_string.length;
					for (var i = 0; i<temp_string_length; i+=2) {
						var temp_hash = String.fromCharCode(parseInt(temp_string.substr(i, 2), 16));
						blockchain_hash_value += temp_hash;    
					}
					// console.log('Hash Value from Blockchain');
					// console.log(blockchain_hash_value);
					var temp_file = init_path + 'temp/' + req.file.originalname;
				
					fs.rename(req.file.path, temp_file, function(err) {
						if (err) {
							console.log(err);
							res.send(500);
						} else {
							fs.readFile(temp_file, function(err, data) {
								if (err) console.log(err);
								else {
									shasum.update(data);
									var d = shasum.digest('hex');
									console.log(blockchain_hash_value);
									console.log(d);
									fs.unlinkSync(temp_file);
									if(blockchain_hash_value == d) {
										res.redirect('/original');
										console.log('This file is the original');
									} else {
										res.redirect('/fake');
										console.log('This file is not the original');
									}
								}
							});
						}
					});
					
				}
			});

		}
	});	

	// =====================================
	// SHOW IMAGE ==========================
	// =====================================
	app.get('/uploads/:userName/:file', isLoggedIn, function(req, res){
		// console.log(req.params);
		var format = req.params.file;
		format = format.substring(format.length - 3, format.length); 
		// console.log(format);
		var file_path = init_path + req.params.userName + '/' + req.params.file;
		// res.end(resize(file_path, format, 100, 100));
		// res.type(`image/${format || 'png'}`);
		// resize(file_path, format, 100, 100).pipe(res);
		fs.readFile(file_path, function(err, data) {
			if (err) throw err;
			res.end(data);
		});
	});

	// =====================================
	// DOWNLOAD ============================
	// =====================================
	app.get('/profile/:userId/:file', isLoggedIn, function(req, res){ // this routes all types of file
		console.log(req.params);
		var file_name = req.params.file;
		var download_path = init_path + req.user.username + '/' + file_name;
		console.log(download_path);
		var shasum = crypto.createHash(algorithm);
		var sql = 'SELECT transaction FROM file_index WHERE file_name = ? AND username = ?';
		var blockchain_hash_value = '';
		var server_hash_value = '';
		connection.query(sql, [file_name, req.user.username], function (err, result) {
			if (err) throw err;
			var transaction = result[0].transaction;
			console.log(transaction);
			var input = web3.eth.getTransaction(transaction).input;
			var temp_string = input.substr(138);
			var temp_string_length = temp_string.length;
			for (var i = 0; i<temp_string_length; i+=2) {
				var temp_hash = String.fromCharCode(parseInt(temp_string.substr(i, 2), 16));
				blockchain_hash_value += temp_hash;    
			}
			console.log('Hash Value from Blockchain');
			console.log(blockchain_hash_value);
			
			fs.readFile(download_path, function(err, data) {
				if (err) console.log(err);
				else {
					shasum.update(data);
					server_hash_value = shasum.digest('hex');
					console.log('Hash Value from Server');
					console.log(server_hash_value);
					if (server_hash_value == blockchain_hash_value) {
						console.log('Both hash values are equal ==> Download success ');
						res.download(download_path, function(err){
							if (err) throw err;
							else {
								
							}
						});
					}
					else {
						res.redirect('/fail');
						console.log('Both hash values are not equal ==> Download fail');
					}
				}
				
			});
			
		});
	});

	// =====================================
	// ORIGINAL ============================
	// =====================================
	app.get('/original', isLoggedIn, function(req, res) {
		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {
				// console.log(result.length);
				if(result.length==0)
				{
					console.log('server bux');
				}
				else {
					res.render('original.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}	
			}
		});
	});

	// =====================================
	// FAKE ================================
	// =====================================
	app.get('/fake', isLoggedIn, function(req, res) {
		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {
				// console.log(result.length);
				if(result.length==0)
				{
					console.log('server bux');
				}
				else {
					res.render('fake.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}	
			}
		});
	});

	// =====================================
	// FILE NOT FOUND ======================
	// =====================================
	app.get('/not_found', isLoggedIn, function(req, res) {
		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {
				// console.log(result.length);
				if(result.length==0)
				{
					console.log('server bux');
				}
				else {
					res.render('not_found.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}	
			}
		});
	});

	// =====================================
	// DOWNLOAD FAIL =======================
	// =====================================
	app.get('/fail', isLoggedIn, function(req, res) {
		var sql = 'SELECT * FROM file_index WHERE user_id = ' + req.user.id;
		// console.log(sql); 
		connection.query(sql, function(err, result) {

			if(err){
				throw err;
			} else {
				// console.log(result.length);
				if(result.length==0)
				{
					console.log('server bux');
				}
				else {
					res.render('fail.ejs', {
					
						user : result // get the user
						//  out of session and pass to template
						
					});
				}	
			}
		});
	});

	
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	// =====================================
	// FIX FAVICON.ICO =====================
	// =====================================
	app.get('/favicon.ico', function(req, res) {
		res.status(204);
	});

	// =====================================
	// FIX APPLE.ICO =======================
	// =====================================
	app.get('/apple-touch-icon-precomposed.png', function(req, res) {
		res.status(204);
	});

	
};


// route middleware to make sure
function isLoggedIn(req, res, next) {
	
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
	return next();
	
	// if they aren't redirect them to the home page
	res.redirect('/');
}
