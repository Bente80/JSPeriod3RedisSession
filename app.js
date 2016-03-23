var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var RedisStore = require('connect-redis')(session);
var redis = require("redis");

var client = redis.createClient(12834, 'pub-redis-12834.eu-central-1-1.1.ec2.redislabs.com', {no_ready_check: true});
client.auth('cph-ba98', function (err) {
  if (err){
    console.log(err);
  }
});
client.set("key1", "This is cool", redis.print);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'hasfkhsakfjdhsa',
  store: new RedisStore({
    host: "pub-redis-12834.eu-central-1-1.1.ec2.redislabs.com",
    port: 12834,
    client: client
  }),
  saveUninitialized: false,
  resave: false,
  cookie: {maxAge: 60*1000}
}));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//---- error handlers:
// development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
