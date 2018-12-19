let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let jwt = require('jsonwebtoken');
let expressValidator = require('express-validator');

let userRouter = require('./routes/user-route');
let sellerRouter = require('./routes/seller-route');
let dishRouter = require('./routes/dish-route');
let adminRouter = require('./routes/admin-route');
let config = require('./config/conf');

let app = express();
// view engine setup
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,x-access-token, Content-Type, Accept");
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(expressValidator());
// app.use((req, res, next)=>{
//     let token = req.body.token || req.query.token || req.headers['x-access-token'];
//     token = "";
//
//     if(token) {
//         jwt.verify(token, app.get('superSecret'), (err, decoded)=> {
//             if(err) {
//                 return res.json({ success : false, message : "Failed to authenticate token." });
//             }
//             else {
//                 req.decoded = decoded;
//                 next();
//             }
//         });
//     }
//     else {
//         return res.status(403).send({
//             success: false,
//             message: 'No token provided.'
//         });
//     }
// });

app.use('/dishathon',express.static(path.join(__dirname, 'public')));
app.use('/dishathon/frontend',express.static(path.join(__dirname, 'frontend')));

app.use('/dishathon/user', userRouter);
app.use('/dishathon/seller', sellerRouter);
app.use('/dishathon/dish-admin', dishRouter);
app.use('/dishathon/admin', adminRouter);

app.set('superSecret', config.secret);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
