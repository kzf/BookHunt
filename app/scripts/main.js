/* jshint devel:true */
$(function() {

var searchBtn = $("#search_btn");
var laddaBtn = Ladda.create(searchBtn[0]);
var searchInput = $("#search_input");
var bookshelf = $("#bookshelf");

var numBookColors = 14;
var numBookHeights = 6;

var currentOffset = 0;
var currentQuery;

var details = $("#detailsModal").modal({ show: false });

var showDetails = function(book) {
	details.find("#details_header").text(book.title);
	details.find("#details_author").text(
		(book.author_name?book.author_name:"No author found")
		 + ", " + 
		(book.publish_date?book.publish_date:"no date found"));
	if (typeof book.subject === 'string') {
		book.subject = [book.subject];
	}
	var subjects = details.find("#details_subjects").empty();
	book.subject.forEach(function(s) {
		subjects.append(
			$("<li class='btn btn-info btn-sm'>").append(
				$("<a href='#'>").text(s)
					.click(function () {
						console.log("searching subject ", s);
						searchBySubject(s);
					})
				)
			);
	});

	details.modal("show");
}

var populateBookshelf = function(books) {
	var lastTilted = false;
	bookshelf.empty();
	if (typeof books[0] === 'undefined') {
		console.log(books);
		books = [books];
	}
	books.forEach(function(book) {
		if (!book.subject) return;
		var b = $("<div>").addClass("book")
							.addClass("book-color-" + Math.floor(Math.random()*numBookColors))
							.addClass("book-height-" + Math.floor(Math.random()*numBookHeights))
							.tooltip({
								placement: "bottom",
								title: book.title
							})
							.click(function() {
								showDetails(book)
							});
		var h = $("<h2>").text(book.title);
		if (book.title.length > 18) {
			h.addClass("long-title");
		}
		if (book.title.length > 26) {
			h.text(book.title.substr(0,26) + "...");
		}
		console.log(book.title);
		console.log(book);
		b.append(h);
		if (Math.random() < 0.1 && !lastTilted) {
			b = $("<div>").addClass("book-tilted").append(b);
			lastTilted = true;
		} else {
			lastTilted = false;
		}
		bookshelf.append(b);
	});
};

var queryURL = function(q) {
	return "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'" + 
					encodeURI('http://openlibrary.org/search.json?q='+encodeURIComponent(q.replace(/\'/gi, ""))) +
					"'&format=json&callback=?";
};

var subjectsURL = function(s, offset) {
	return "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'" + 
					encodeURI('http://openlibrary.org/subjects/'+encodeURIComponent(s.toLowerCase())+'.json?limit=50'
						+(offset?'&offset='+offset:'')) +
					"'&format=json&callback=?";
};

var searchBySubject = function(s, offset) {
	var surl = subjectsURL(s, offset);
	searchInput.val(s);
	laddaBtn.start();
	details.modal("hide");
	$.getJSON(surl, function(r) {
		laddaBtn.stop();
		if (!r.query.results) {
			$("#errorModal").modal("show");
			return;
		}
		populateBookshelf(r.query.results.json.works);
	}).fail(function(a,b,c) {
		$("#errorModal").modal("show");
		l.stop();
	});
	currentOffset = offset;
	currentQuery = s;
}

searchBtn.click(function() {
	var q = searchInput.val();
	laddaBtn.start();
	var qurl = queryURL(q);
	//console.log(qurl);
	$.getJSON(qurl, function(r) {
		laddaBtn.stop();
		if (!r.query.results) {
			//Error
			$("#errorModal").modal("show");
			return;
		}
		populateBookshelf(r.query.results.json.docs);
	}).fail(function(a,b,c) {
		$("#errorModal").modal("show");
		laddaBtn.stop();
	});
});

searchInput.on("keyup", function(e) {
	if (e.keyCode === 13) {
		searchBtn.click();
	}
});


});