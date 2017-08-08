
// All the data from the JSON file
var data;
// Movie ratings by person
var ratings;
// A list of all the movies
var allMovies;
var img;


// Preload all the data
function preload() {
  data = loadJSON('ratings.json');
  
 
}

function setup() {
  createCanvas(720, 400);
 
  bimgs=data.bimg;
  img = createImg("http://th07.deviantart.net/fs70/PRE/i/2011/260/3/5/dash_hooray_by_rainbowcrab-d49xk0d.png");
  img.class("featurette-image img-responsive center-block");
  img.parent('#teste');
  
  img1=createImg("b2.jpg");
   img1.class("featurette-image img-responsive center-block");
  img1.parent("#teste"+2);
  
  img5=createImg("b2.jpg");
   img5.class("featurette-image img-responsive center-block");
  img5.parent("#teste"+5);

  // Get the bits out of the data we want
  ratings = data.ratings;
  allMovies = data.movies;
  allImgs=data.imgs;

  // This generates an interface for a user to rate some movies
  var dropdowns = [];
  for (var i = 0; i < allMovies.length; i++) {
    // Make a DIV for each movie
    var div = createDiv(allMovies[i] + ' ');
	
	
    div.style('padding','8px 16px');
	div.style('display','block');
	div.style('backgroundColor','#FFFFFF');
    div.parent("#interface"+i);
	
	 
    // Create a dropdown menu for each movie
    var dropdown = createSelect();
    dropdown.option('not seen');
    // 1 to 5 stars
    for (var stars = 1; stars < 6; stars++) {
      dropdown.option(stars);
    }
    dropdown.parent(div);
    // Connect the dropdown with the movie title
    dropdown.movie = allMovies[i];
    dropdowns.push(dropdown);
  }

//var div2=createDiv(disp);
//div.parent('#teste');
  // This is a submit button
  var submit = createButton('submit');
  submit.parent("#interface"+1);
  submit.style('margin','4px 40px');
  submit.style('padding','8px 16px');
  submit.style('display','block');
  submit.style('color','#ffffff');

  // When the button is clicked
  submit.mousePressed(function() {
    // Make a new user
    var user = {};
    // Attach all the ratings
    for (var i = 0; i < dropdowns.length; i++) {
      var value = dropdowns[i].value();
      if (value != 'not seen') {
        var movie = dropdowns[i].movie;
        // Make sure they are numbers!
        user[movie] = Number(value);
      }
    }
    // Put it in the data
    ratings['user'] = user;
    // Call the get Recommendations function!
    // We can use either "euclidean" distance or "pearson" score
    getRecommendations('user', euclidean);
  });
}

// A function to get recommendations
function getRecommendations(person, similarity) {

  // Clear the div
  select("#results").html('');

  // This will be the object to store recommendations
  var recommendations = {};

  // Let's get all the people in the database
  var people = Object.keys(ratings);

  // For every person
  for (var i = 0; i < people.length; i++) {
    var other = people[i];

    // Don't use yourself for a recommendation!
    if (other != person) {
      // Get the similarity score
      var sim = similarity(person, other);
      // If it's 0 or less ignore!
      if (sim <= 0) continue;
      // What movies did the other person rate?
      var movies = Object.keys(ratings[other]);
      for (var j = 0; j < movies.length; j++) {
        var movie = movies[j];
        // As long as I have not already rated the movie!
        if (!ratings[person][movie]) {
          // Have we not seen this movie before with someone else?
          if (recommendations[movie] == undefined) {
            recommendations[movie] = {
              total: 0,
              simSum: 0,
              ranking: 0
            }
          }
          // Add up the other persons rating weighted by similarity
          recommendations[movie].total += ratings[other][movie] * sim;
          // Add up all similarity scores
          recommendations[movie].simSum += sim;
        }
      }
    }
  }

  // Ok, now we can calculate the estimated star rating for each movie
  var movies = Object.keys(recommendations);
  for (var i = 0; i < movies.length; i++) {
    var movie = movies[i];
    // Total score divided by total similarity score
    recommendations[movie].ranking = recommendations[movie].total / recommendations[movie].simSum;
  }

  // Sore movies by ranking
  movies.sort(byRanking);
  function byRanking(a, b) {
    return recommendations[b].ranking - recommendations[a].ranking;
  }

  // Display everything in sorted order
  for (var i = 0; i < movies.length; i++) {
    var movie = movies[i];
    var stars = recommendations[movie].ranking;
    var rec = createP(movie + ' ' + nf(stars,1,1) + '⭐');
    rec.parent('#results');
  }
  
}

