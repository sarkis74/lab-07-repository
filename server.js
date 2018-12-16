'use strict';

//Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//Load env vars
require('dotenv').config();

const PORT = process.env.PORT || 3000;

//app
const app = express();

app.use(cors());

//Routes;

app.get('/location', getLocation)

app.get('/weather', getWeather)

app.get('/yelp', getRestaurant)

app.get('/movies', getMovies)

//Global Variables
let weatherArr = [];
let restaurantArr = [];
let moviesArray = [];
const regex = /\w+\s\w+|\w{3,},/;

////////////////////////////////////////////Location//////////////////////////////////////////////
//Handler
function getLocation(request, response){
  return searchToLatLong(request.query.data).then(locationData => {
    response.send(locationData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
}

//Constructor 
function Location(location){
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
  this.short_name = location.address_components[0].short_name;
}

//Search for Resources
function searchToLatLong(query){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
 
  return superagent.get(url)
  .then(geoData => {
  const location = new Location(geoData.body.results[0]);
  return location;
  }) 
  .catch(err => err);
}

////////////////////////////////////////////Weather//////////////////////////////////////////////
//Handler
function getWeather(request, response){
  return searchForWeather(request.query.data).then(weatherData => {
    response.send(weatherData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
}

//Constructor
function Weather(weather) {
  this.forecast = weather.summary;
  this.time = new Date(weather.time * 1000).toDateString();
  
}

//Search for Resources
function searchForWeather(query){
  const url = `https://api.darksky.net/forecast/${process.env.WEATHERCODE_API}/${query.latitude},${query.longitude}`;
  return superagent.get(url)
  .then(weatherData => {
  weatherArr = weatherData.body.daily.data.map(weather => new Weather(weather));
  return weatherArr;
  }) 
  .catch(err => err);
  
}

////////////////////////////////////////////Restaurants//////////////////////////////////////////////
//Handler
function getRestaurant(request, response){
  return searchForRestaurant(request.query.data).then(restaurantData => {
    response.send(restaurantData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
}

//Constructor
function Restaurant(restaurant) {
  this.name = restaurant.name;
  this.image_url = restaurant.image_url;
  this.price = restaurant.price;
  this.rating = restaurant.rating;
  this.url = restaurant.url;
  
  restaurantArr.push(this);
}

searchForRestaurant()
//Search for Resources
function searchForRestaurant(query){
  if(query !== undefined) //Makes sure the search is not empty so as to not break code
  query = JSON.stringify(query).match(regex);
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${query}`;
  return superagent.get(url)
  .set('Authorization',
  `Bearer ${process.env.RESTAURANTCODE_API}`)
  .then(restaurantData => {
   restaurantArr = restaurantData.body.businesses.map(restaurant => new Restaurant
  (restaurant));
   return restaurantArr;
 
  }) 
  .catch(err => err);

}

////////////////////////////////////////////Movies//////////////////////////////////////////////
//Handler
function getMovies(request, response){

  return searchForMovies(request.query.data).then(moviesData => {
    response.send(moviesData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
}

//Constructor
function Movies(movies) {
  this.title = movies.title;
  this.overview = movies.overview;
  this.average_votes = movies.vote_average;
  this.total_votes = movies.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w200_and_h300_bestv2/' + movies.poster_path;
  this.popularity = movies.popularity;
  this.released_on = movies.release_date;
  
}


function searchForMovies (query) {
  let citySplice = query.formatted_query.split(',');
  let URL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIESCODE_API}&query=${citySplice[0]}, ${citySplice[1]}`;
 
  return superagent.get(URL)
    .then( moviesData => {
      let movies = moviesData.body.results;//array of results
      // Sort movies by Popularity
      movies.sort( function (a,b) {
        if( a.popularity > b.popularity) return -1;
        if( b.popularity > a.popularity) return 1;
        return 0;
      });
      //If # of movies less than 20
      let numMovies = 20;
      if(movies.length < 20) numMovies = movies.length;
      //For Loop over first 20 movies
      for(let i = 0 ; i < numMovies ; i++) {
        //create movies objects and push into array.
        moviesArray.push(new Movies (movies[i]));
       
      }
   
      return moviesArray;
    });
  }

////////////////////////////////////////////DefaultMessages//////////////////////////////////////////////
//Give error message if incorrect
app.get('/*', function(request, response){
  response.status(404).send('you are in the wrong place');
})

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`app is up at port: ${PORT}.`)
})


