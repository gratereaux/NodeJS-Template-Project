/*
 *  Project: Base project in Node.JS + Express.io
 *	Author : Jose Gratereaux
 */

var express 		= require('express.io'),
	redis 			= require('redis');
	swig 			= require('swig'),
	_				= require('underscore'),
	bodyParser 		= require('body-parser'),
	cookieParser 	= require('cookie-parser'),
	logger			= require('express-logger'),
	session 		= require('express-session');

var RedisStore = require('connect-redis')(session);

var server = express();
server.http().io();

//rendering views
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './app/views');
server.use(session({secret: '1234567890QWERTY'}));


//Configurando el server
server.use(bodyParser());
server.use(cookieParser());
server.use(logger({path: "./app/logs/logfile.txt"}));
server.use(express.static('./public')); //Static Archives


//Middlewares

var IsNotLoggedId = function(req, res, next){
	if(!req.session.user){
		res.redirect('/');
		return;
	}
	next();
};

var IsLoggedId = function(req, res, next){
	if(req.session.user){
		res.redirect('/app');
		return;
	}
	next();
};


//Global variables and arrays

var ListUsers = [];


//Web Pages

server.get('/', IsLoggedId, function(req, res){
	res.render('home');
});

server.get('/app', IsNotLoggedId, function(req, res){
	res.render('app', {
		user : req.session.user,
		listusers: ListUsers 
	});

});

server.post('/log-in', function(req, res){
	req.session.user = req.body.username;
	ListUsers.push(req.body.username);

	server.io.broadcast('log-in', {username: req.session.user});

	res.redirect('/app');
});

server.get('/log-out', function(req, res){
	ListUsers = _.without(ListUsers, req.session.user);

	server.io.broadcast('log-out', {username: req.session.user});

	req.session.destroy();
	res.redirect('/');
});


//Socket IO

server.io.route('hello?', function(req){

	req.io.emit('saludo', {
		message: 'ServerReady'
	});
});


//server port
server.listen(3000);