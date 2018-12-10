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

app.get('/location', getLocation);

app.get('/weather', getWeather);


//Handlers
function getLocation(request, response){
  return searchToLatLong(request.query.data)
    .then(locationData => {
      response.send(locationData); //Promise: when superagent makes a promise to the frontend
    });
 
}

function getWeather(request, response){
  return searchForWeather(request.query)
    .then(weatherData => {
      response.send(weatherData);
    });
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
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(geoData => {
      const location = new Location(geoData.body.results[0]);
      return location;
    })
    .catch(err => console.log('superagent error%%%%%%%%%%%%', err));
}

function searchForWeather(query){
  const url = `https://api.darksky.net/forecast/${query}&key=${process.env.WEATHER_API_KEY}/${query.latitude},${query.longitude}`;
  
  return superagent.get(url)
    .then(weatherData => {
      const weather = new Weather(weatherData.body);
      console.log(weatherData.body);
      return weather;
    })
    .catch(err => console.log('weather errrrrrrrorrrrrrrrrr', err));
  // let dailyForecast = [];
  // weatherData.daily.data.forEach(weather => dailyForecast.push(new Weather(weather)));
  // return dailyForecast;
}

//Give error message if incorrect
app.get('/*', function(request, response){
  response.status(404).send('you are in the wrong place');
});

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`${PORT}`);
});
