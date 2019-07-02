const bodyParser = require("body-parser"),
	  expressSanitizer = require("express-sanitizer"),
	  methodOverride = require("method-override"),
	  mongoose   = require("mongoose"),
	  express    = require("express"),
	  app        = express();

// APP CONFIG
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //this line have to be after bodyParser
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {
	useNewUrlParser: true,
	useCreateIndex: true //Maybe we don't need this line??
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});

// Mongoose/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
// 	body: "HELLO THIS IS A BLOG POST"
// });

// RESTful ROUTES
app.get("/", function(req, res) {
	res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if(err) console.log("ERROR!!!");
		else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("new");
});

// CREATE ROUTE

app.post("/blogs", function(req, res) {
	//create route
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog) {
		if(err) res.render("new");
		else {
			//redirect to the index page
			res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) res.redirect("/blogs");
		else {
			res.render("show", {blog: foundBlog});
		}
	});
	//res.send("SHOW PAGE!!");
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) res.redirect("/blogs");
		else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if(err) res.redirect("/blogs");
		else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
	//res.send("update route");
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
	//res.send("YOU HAVE REACHED THE DELETE ROUTE!");
	//Destroy Blog
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if(err) res.redirect("/blogs");
		//Redirect somewhere
		else res.redirect("/blogs");
	});
	
});

app.listen(3000, () => {
	console.log('The Blog server has started');
});