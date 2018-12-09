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

// app.get('/weather', getWeather)


//Handlers
function getLocation(request, response){
  return searchToLatLong(request.query.data).then(locationData => {
    response.send(locationData); //Promise: when superagent makes a promise to the frontend
  })
  .catch(err => err);
 
}

// function getWeather(req, res){
//   const weatherData = searchForWeather(req.query.data);
//   res.send(weatherData);
// }

// //Constructor
// function Weather(weather) {
//   this.forecast = weather.summary;
//   this.time = new Date(weather.time * 1000).toDateString();
// }

function Location(location, response){
  this.formatted_query = location.formatted_address;
  console.log(this.formatted_query)
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

//Search for Resources
function searchToLatLong(query){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
 
  return superagent.get(url)
  .then(geoData => {
   
    console.log(geoData.body.results[0], 'GEODATA RESULTS')
  const location = new Location(geoData.body.results);
  console.log(location)
  return location;
  }) 
  .catch(err => err);
}

// function searchForWeather(query){
//   const weatherData = require('./data/darksky.json');
//   let dailyForecast = [];
//   weatherData.daily.data.map(weather => dailyForecast.push(new Weather(weather)));
//   return dailyForecast;
  
// }

//Give error message if incorrect
app.get('/*', function(req, res){
  // res.status(404).send('you are in the wrong place');
})

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`app is up at port: ${PORT}.`)
})