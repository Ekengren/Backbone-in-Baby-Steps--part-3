/**
 * Module dependencies.
 */

var application_root = __dirname,
    express = require("express"), //Web framework
    path = require("path"), //Utilities for dealing with file paths
    mongoose = require('mongoose'); //MongoDB integration


//Create server
//var app = module.exports = express.createServer();
var app = express.createServer();

//Connect to database
mongoose.connect('mongodb://localhost/library_database');

// Configure server
app.configure(function () {
    app.use(express.bodyParser()); //parses request body and populates req.body
    app.use(express.methodOverride()); //checks req.body for HTTP method overrides
    app.use(app.router); //perform route lookup based on url and HTTP method
    app.use(express.static(path.join(application_root, "public"))); //Where to serve static content
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true })); //Show all errors in development
});

/*
 app.configure('development', function () {
 app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
 });

 app.configure('production', function () {
 app.use(express.errorHandler());
 });
 */


//Schemas
var Keywords = new mongoose.Schema({
    keyword: String
});

var Book = new mongoose.Schema({
    title:String,
    author:String,
    releaseDate:Date,
    keywords: [Keywords]
});


//Models
var BookModel = mongoose.model('Book', Book);

// Routes
app.get('/api', function (req, res) {
    res.send('Library API is running');
});

app.get('/api/books', function (req, res) {
    console.log('Fetching all books');
    return BookModel.find(function (err, books) {
        if (!err) {
            return res.send(books);
        } else {
            return console.log(err);
        }
    });
});

app.get('/api/books/:id', function(req, res){
    console.log('Fetching book with id ' + req.params.id);
    return BookModel.findById(req.params.id, function(err, book){
        if(!err){
            return res.send(book);
        } else {
            return console.log(err);
        }
    });
});

app.post('/api/books', function (req, res) {
    console.log('Adding new book ' + req.body.title);
    var book = new BookModel({
        title:req.body.title,
        author:req.body.author,
        releaseDate:req.body.releaseDate !== 'Unknown' ? req.body.releaseDate : (new Date()).getTime(),
        keywords: req.body.keywords
    });
    book.save(function (err) {
        if (!err) {
            return console.log('created');
        } else {
            return console.log(err);
        }
    });
    return res.send(book);
});


/**/

app.put('/api/books/:id', function(req, res){
    console.log('Updating book ' + req.body.title);
    return BookModel.findById(req.params.id, function(err, book){
        book.title = req.body.title;
        book.author = req.body.author;
        book.releaseDate = req.body.releaseDate;
        book.keywords = req.body.keywords;
        return book.save(function(err){
            if(!err){
                console.log('book updated');
            } else {
                console.log(err);
            }
            return res.send(book);
        });
    });
});

app.delete('/api/books/:id', function(req, res){
    console.log('Deleting book with id: ' + req.params.id);
    return BookModel.findById(req.params.id, function(err, book){
        return book.remove(function(err){
            if(!err){
                console.log('Book removed');
                return res.send('');
            } else {
                console.log(err);
            }
        });
    });
});

//Start server
app.listen(4711, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
