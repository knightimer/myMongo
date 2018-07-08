// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// var moment = require("moment");

// Scraping tools
var cheerio = require("cheerio");
var request = require("request");
var axios = require("axios");

// Require all models
var db = require("./models");

// Initialize Express
var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
// mongoose.Promise = Promise;
// mongoose.connect("mongodb://localhost/mongoscraper", {
//   useMongoClient: true
// });

// Routes
app.get("/scrape", function(req, res) {
  res.send();
});
  
  // First, we grab the body of the html with request
  axios.get("http://www.theguardian.com/us").then(function(response) {
   
  // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
    // Now, we grab every h2 within an article tag, and do the following:
    $(".fc-container_inner").each(function(i, element) {
      // Save an empty result object
      var result = {};
     
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children(".fc-container__body").children(".fc-slice-wrapper").children("ul").children("li").children(".fc-item").children(".fc-item__container").children("a").text();
      result.link = $(this).children(".fc-container__header").children("a").attr("href");
      result.desc = $(this).children(".fc-container__body").children(".fc-slice-wrapper").children("ul").children("li").children(".fc-item").children(".fc-item__container").children(".fc-item__content").children(".fc-item__standfirst").text();
      
                console.log(result);
                // Create a new Article using the `result` object built from scraping
                db.Article
                    .create(result)
                    .then(function(dbArticle) {
                        // If we were able to successfully scrape and save an Article, send a message to the client
                        res.redirect('/');
                    })
                    .catch(function(err) {
                        // If an error occurred, send it to the client
                        res.json(err);
                    });
            }); // close .each function
        }); // close axios
       
  
        // Grab every document in the Articles collection
        db.Article
            .remove({})
            .then(function(dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.redirect('/');
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
  
    app.get("/clear", function(req, res) {
      // Grab every document in the Articles collection
      db.Article
          .remove({})
          .then(function(dbArticle) {
              // If we were able to successfully find Articles, send them back to the client
              res.redirect('/');
          })
          .catch(function(err) {
              // If an error occurred, send it to the client
              res.json(err);

    // Route for getting all Articles from the db
    app.get("/articles", function(req, res) {
        // Grab every document in the Articles collection
        db.Article
            .find({})
            .then(function(dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article
            .findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function(dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function(req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note
            .create(req.body)
            .then(function(dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function(dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });
        
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
  
   
    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  
  db.Article
    .find({})
    .limit(10).exec({articleCreated:-1})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
 
  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating article to be saved
app.put("/saved/:id", function(req, res) {

  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting saved article
app.get("/saved", function(req, res) {

  db.Article
    .find({ isSaved: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for deleting/updating saved article
app.put("/delete/:id", function(req, res) {

  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/myMongo";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
    });
  });
});
