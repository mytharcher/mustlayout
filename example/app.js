var express = require('express');
var mustlayout = require('../');



var app = express();

mustlayout.engine(app, {
	engine: require('hogan-express'),
	ext: '.tpl',
	views: 'views',
	layouts: 'views/layouts',
	partials: 'views/partials',
	cache: 'views/cache'
});

// test for variable `locals`
app.locals.year = 2014;

app.get('/', function (req, res, next) {
	res.render('index', {
		title: 'My Index'
	});
});

app.get('/about', function (req, res, next) {
	res.render('about', {
		mobile: '1894453273',
		address: 'Street Shangdi 10#, District Haidian, Beijing'
	});
});

app.get('/deep', function (req, res, next) {
	res.render('others/deep', {
		list: [
			'mustache',
			'hogan',
			'handlebars'
		]
	});
});

app.listen(6868, function () {
	console.log('MustLayout example server started.');
});
