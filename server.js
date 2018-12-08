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


//Handlers
function getLocation(request, response){
  return searchToLatLong(request.query.data) //Lynnwood,WA
  .then(locationData => {
    response.send(locationData); //Promise: when superagent makes a promise to the frontend
  })
 
}

function getWeather(req, res){
  const weatherData = searchForWeather(req.query);
  res.send(weatherData);
}

//Constructor
function Weather(weather) {
  this.forecast = weather.summary;
  this.time = new Date(weather.time * 1000).toDateString();
}

function Location(location){
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

//Search for Resources
function searchToLatLong(query){
  return superagent.get(`https://maps.googleapis.com/api/geocode/json?address=$key=${process.env.GEOCODE_API_KEY}`)
  .then(geoData => {
  const location = new Location(geoData.results[0]);
  return location;
  }) 
  .catch(err => console.log(err));
}

function searchForWeather(query){
  const weatherData = require('./data/darksky.json');
  let dailyForecast = [];
  weatherData.daily.data.map(weather => dailyForecast.push(new Weather(weather)));
  return dailyForecast;
  
}

//Give error message if incorrect
app.get('/*', function(req, res){
  res.status(404).send('you are in the wrong place');
})

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`app is up at port: ${PORT}.`)
})