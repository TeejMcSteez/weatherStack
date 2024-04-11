const apiUrl = 'https://www.wsoctv.com/pf/api/v3/content/fetch/weather-api?query=%7B%22metCollectionAlias%22%3A%22met-forecast%22%2C%22website%22%3A%22cmg-tv-10030%22%2C%22zipCode%22%3A%2228202%22%7D&d=823&_website=cmg-tv-10030';

async function fetchWeatherData() {
    let forecastDataWSOC = [];
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }
      const data = await response.json();

      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayIndex = new Date().getDay(); // This gets the current day as an index (0-6)
      const currentDayName = days[currentDayIndex]; // This gets the current day's name in lowercase
      const tmmrwDayName = days[currentDayIndex + 1]

      //TODO: Edit days[currentDayIndex[0-6].toUpper()] 
      if (data.forecast[currentDayName]) {
        const todayForecast = data.forecast[currentDayName];
        const todayHigh = todayForecast.calendarDayTemperatureMax;
        const todayLow = todayForecast.calendarDayTemperatureMin;
        const todayPrecipChanceDay = todayForecast.day.precipChance;
        const todayPrecipChanceNight = todayForecast.night.precipChance;
        const todayPrecipChanceAvg = (todayPrecipChanceDay+todayPrecipChanceNight)/2;
        const currentTemp = data.current.temp;
        const weatherman = todayForecast.narrative;
        //accessing hourly index
        const currentHourPrecipChance = data.hourly[0].precipChance;
        const currentDayUppercase = data.hourly[0].dayOfWeek; //gets the current day in capital as before I was using JS's Date() object
        //ugly buffer to keep data access seperate (for now)
        const currentPrecipChance = currentHourPrecipChance;

        const tommrowForecast = data.forecast[tmmrwDayName];
        const tommrowHigh = tommrowForecast.calendarDayTemperatureMax;
        const tommrowLow = tommrowForecast.calendarDayTemperatureMin;
        const tommrowPrecipChanceDay = tommrowForecast.day.precipChance;
        const tommrowPrecipChanceNight = tommrowForecast.night.precipChance;
        const tommrowWeatherman = tommrowForecast.narrative;

        forecastDataWSOC.push({
            day: currentDayUppercase,
            high_temp: todayHigh,
            low_temp: todayLow,
            precipChance: todayPrecipChanceAvg,
            current_Temp: currentTemp,
            current_Precip_Chance: currentPrecipChance,
            weather_man: weatherman,
            //tommrow forecast
            tmmrw_highTemp: tommrowHigh,
            tmmrw_lowTemp: tommrowLow,
            tmmrw_precipChanceDay: tommrowPrecipChanceDay,
            tmmrw_precipChanceNight: tommrowPrecipChanceNight,
            tmmrw_weatherman: tommrowWeatherman
        })

      } else {
        console.log("Forecast data for the current day is not available.");
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error.message);
    }
    return forecastDataWSOC;
}

//Sending to SQL Server
const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = 3000;
//serving the html file through express
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); 
});

// API endpoint to get weather data
app.get('/weather-data', async (req, res) => {
    try {
        const client = new Client({
            host:"localhost",
            user:"postgres",
            port:5432,
            password:"password",
            database: "backend"
        });
        await client.connect();

        // Assuming fetchWeatherData fetches data and returns an array of forecast data
        const forecastDataWSOC = await fetchWeatherData();
        await client.end();

        res.json(forecastDataWSOC); // Send the weather data as JSON
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running view data on http://localhost:${PORT}`);
});