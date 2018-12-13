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
  let weatherArr = weatherData.body.daily.data.map(weather => new Weather(weather));
  return weatherArr;
  }) 
  .catch(err => err);
  
}

////////////////////////////////////////////Restaurant//////////////////////////////////////////////
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
  
}

searchForRestaurant()
//Search for Resources
function searchForRestaurant(query){
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${query}`;
  return superagent.get(url)
  .set('Authorization',
  `Bearer ${process.env.RESTAURANTCODE_API}`)
  .then(restaurantData => {
   let restaurantArr = restaurantData.body.businesses.map(restaurant => new Restaurant(restaurant));
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

searchForMovies()
//Search for Resources
function searchForMovies(query){
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIESCODE_API}&query=${query.short_name}`;
  return superagent.get(url)
  .then(moviesData => {
   let moviesArr = moviesData.body.businesses.map(movies => new Movies(movies));
   return moviesArr;
 
  }) 
  .catch(err => err);
  
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


