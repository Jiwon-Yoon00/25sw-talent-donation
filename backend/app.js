const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const nunjucks = require('nunjucks');
const { sequelize } = require('./models');

dotenv.config();
require('./passport/localStrategy');

app.set('port', process.env.PORT || 8008);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(passport.initialize());
app.use(passport.session());    //req.session 객체에 passport 정보를 저장한다.

sequelize
    .sync({ force: false})
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });
    
const authRouter = require('./routes/auth');
const pageRouter = require('./routes/page');
const playRouter = require('./routes/play');
const userboardRouter = require('./routes/userboard');
app.use('/auth', authRouter);
app.use('/', pageRouter);
// app.use('/play', playRouter);
app.use('/api', userboardRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.json({ message: err.message });
});

module.exports = app;