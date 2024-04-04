//Works for JSON Files with section - forecast, into the day, and then the data
const apiUrl = 'https://www.wsoctv.com/pf/api/v3/content/fetch/weather-api?query=%7B%22metCollectionAlias%22%3A%22met-forecast%22%2C%22website%22%3A%22cmg-tv-10030%22%2C%22zipCode%22%3A%2228202%22%7D&d=823&_website=cmg-tv-10030';

async function fetchWeatherData() {
    let forecastData = [];
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }
      const data = await response.json();

      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayIndex = new Date().getDay(); // This gets the current day as an index (0-6)
      const currentDayName = days[currentDayIndex]; // This gets the current day's name in lowercase

      if (data.forecast[currentDayName]) {
        const todayForecast = data.forecast[currentDayName];
        const todayHigh = todayForecast.calendarDayTemperatureMax;
        const todayLow = todayForecast.calendarDayTemperatureMin;
        const todayPrecipChanceDay = todayForecast.day.precipChance;
        const todayPrecipChanceNight = todayForecast.night.precipChance; //implement avg %

        forecastData.push({
            day: currentDayName,
            high_temp: todayHigh,
            low_temp: todayLow,
            precipChance: todayPrecipChanceDay
        })

      } else {
        console.log("Forecast data for the current day is not available.");
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error.message);
    }
    return forecastData;
}

//Sending to SQL Server
const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//API endpoint to get weather data
app.get('/weather-data', async (req, res) => {
    try {
        const client = new Client({
            host:"localhost",
            user:"postgres",
            port:5432,
            password:"pass",
            database: "backend" //info changed for GitHub even though its local
        });
        await client.connect();

        // Assuming fetchWeatherData fetches data and returns an array of forecast data
        const forecastData = await fetchWeatherData();
        await client.end();

        res.json(forecastData); // Send the weather data as JSON
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
