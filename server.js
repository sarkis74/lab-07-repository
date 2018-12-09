'use strict';

//Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');


//Load env vars
require('dotenv').config();

const PORT = process.env.PORT || 3000;
console.log(PORT)

//app
const app = express();

app.use(cors());

//Routes;

app.get('/location', getLocation)

app.get('/weather', getWeather)


//Handlers
function getLocation(request, response){
  return searchToLatLong(request.query.data).then(locationData => {
    response.send(locationData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
}
 
function Location(location){
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
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

function getWeather(request, response){
  return searchForWeather(request.query.data).then(weatherData => {
    response.send(weatherData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
}

//Constructor
function Weather(weather) {
  this.forecast = weather.summary;
  this.time = weather.time;
  
}

function searchForWeather(query){
  const url = `https://api.darksky.net/forecast/${process.env.WEATHERCODE_API}/${query.latitude},${query.longitude}`;
  console.log(url)
  return superagent.get(url)
  .then(weatherData => {
  let weatherArr = weatherData.body.daily.data.map(weather => new Weather(weather));
  console.log(weatherArr)
  return weatherArr;
  }) 
  .catch(err => err);
  
}

//Give error message if incorrect
app.get('/*', function(req, res){
  res.status(404).send('you are in the wrong place');
})

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`app is up at port: ${PORT}.`)
})