/* jshint devel:true */
$(function() {

var searchBtn = $("#search_btn");
var searchInput = $("#search_input");
var bookshelf = $("#bookshelf");

var bookColors = ["book-green", "book-umber", "book-blue", "book-springer"]


var populateBookshelf = function(books) {
	var lastTilted = false;
	books.forEach(function(book) {
		var b = $("<div>").addClass("book")
							.addClass(bookColors[Math.floor(Math.random()*4)]);
		var h = $("<h2>").text(book.title);
		b.append(h);
		if (Math.random() < 0.1 && !lastTilted) {
			b = $("<div>").addClass("book-tilted").append(b);
			lastTilted = true;
		}
		bookshelf.append(b);
	});
};

var queryURL = function(q) {
	console.log(q.replace(/\'/gi, ""));
	return "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'" + 
					encodeURI('http://openlibrary.org/search.json?q='+encodeURIComponent(q.replace(/\'/gi, ""))) +
					"'&format=json&callback=?";
};

searchBtn.click(function() {
	var l = Ladda.create(this);
	var q = searchInput.val();
	l.start();
	var qurl = queryURL(q);
	//console.log(qurl);
	$.getJSON(qurl, function(r) {
		populateBookshelf(r.query.results.json.docs);
		l.stop();
	})
});

searchInput.on("keyup", function(e) {
	if (e.keyCode === 13) {
		searchBtn.click();
	}
});


});