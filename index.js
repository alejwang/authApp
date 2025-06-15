const express = require('express');
const app = express();

app.use(express.static(__dirname));

const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});


const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/MyDatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

const connectEnsureLogin = require('connect-ensure-login');

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login?info=' + info);
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/login', (req, res) => {
    res.sendFile('html/login.html', { root: __dirname })
});

app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.sendFile('html/index.html', { root: __dirname });
});

app.get('/private', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.sendFile('html/private.html', { root: __dirname });
});

app.get('/user', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.send({user: req.user})
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        res.sendFile('html/logout.html', { root: __dirname });
    });
});

UserDetails.register({ username: 'paul', active:false}, 'paul');
UserDetails.register({ username: 'joy', active:false}, 'joy');
UserDetails.register({ username: 'ray', active:false}, 'ray');
