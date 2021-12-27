//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const mongodb = require("mongodb");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

//initialisation of the session package.
app.use(session({
    secret: "code is the love of my life.",
    resave: false,
    saveUinitialized: false,
    cookie: {
        maxAge: 60 * 1000 * 60 * 3
    },

}));


//initialisation of passport.

app.use(passport.initialize());
app.use(passport.session());



//mongoose setup is below.
mongoose.connect("mongodb://localhost:27017/userDB",
    err => {
        if (err) throw err;
        console.log('connected to MongoDB')
    });


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


//initialization of passport-local mongoose.
userSchema.plugin(passportLocalMongoose)
const User = new mongoose.model("User", userSchema);
const secret = process.env.SECRET;
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Definition of the routes is below.
app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});


app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login")
    }

})

app.post("/register", function (req, res) {
    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            });
        }
    });
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.passport
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    })
});
app.get("/logout", function () {
    req.logout();
    res.redirect("/");
});

app.listen("3000", function () {
    console.log("Server is started on port 3000");
});