var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session    = require('express-session');
//var mongoose = require("mongoose");
var dbConfig = require("./config/dbConfig");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware


// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/week18Populater");

//Configure Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(session({ secret: 'secret cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// Routes
var routes = require("./controllers/apiRoutes");
app.use(routes);
// A GET route for scraping the echoJS website


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
