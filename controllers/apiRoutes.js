var express = require("express");
var router = express.Router();
var axios = require("axios");
var cheerio = require("cheerio");
var dbConfig = require("../config/dbConfig");
// Require all models
var db = require("../models");
var passport = require("./authController");


router.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            var articles = {
                articles: dbArticle,
                user: req.user,
            }
            // If we were able to successfully find Articles, send them back to the client
            res.render("index2", articles);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });

});
router.get("/login", function(req,res){
    res.render("login");
});
router.get("/logout", function(req,res){
    req.logout();
    res.redirect('/login');
});
router.post("/login", passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });
router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.nytimes.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article .story-heading").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text().trim();
            result.link = $(this)
                .children("a")
                .attr("href");
            result.summary = $(this)
                .parent()
                .find("p.summary")
                .text().trim();
            result.storyID = $(this)
                .parent()
                .attr("data-story-id");
            result.comments = [];


            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", 
    function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("comments")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Comment.create({author: req.user.username, body: req.body.body})
        .then(function (dbComment) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { comments: dbComment._id } }, { new: true, upsert: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

module.exports = router;