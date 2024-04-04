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

      // Use JavaScript's Date object to get the current day of the week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayIndex = new Date().getDay(); // This gets the current day as an index (0-6)
      const currentDayName = days[currentDayIndex]; // This gets the current day's name in lowercase
      
      if (data.forecast[currentDayName]) {
        const todayForecast = data.forecast[currentDayName];
        const todayHigh = todayForecast.calendarDayTemperatureMax;
        const todayLow = todayForecast.calendarDayTemperatureMin;
        const todayPrecipChanceDay = todayForecast.day.precipChance;
        const todayPrecipChanceNight = todayForecast.night.precipChance;

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


async function insertForecastData(forecastData) {
    for (const item of forecastData) {
        const query = `
            INSERT INTO public.weather_data (day, high_temp, low_temp, precip_chance)
            VALUES ($1, $2, $3, $4)
        `;

        const values = [item.day, item.high_temp, item.low_temp, item.precipChance];

        try {
            await client.query(query, values);
            console.log(`Inserted data for ${item.day}`);
        } catch (err) {
            console.error(`Failed to insert data for ${item.day}:`, err);
        }
    }
}


async function displayWeatherData() {
    try {
        // Execute a SELECT query to retrieve all rows from the weather_data table
        const res = await client.query('SELECT * FROM public.weather_data ORDER BY id ASC;');

        console.log("ID | Day       | High Temp | Low Temp | Precip Chance");
        console.log("--------------------------------------------------");
        
        // Iterate over each row and log the details
        res.rows.forEach(row => {
            console.log(`${row.id}  | ${row.day.padEnd(10)} | ${row.high_temp.toString().padEnd(9)} | ${row.low_temp.toString().padEnd(8)} | ${row.precip_chance}%`);
        });
    } catch (err) {
        console.error('Failed to retrieve weather data:', err);
    } finally {
        client.end()
    }
}

//Sending to SQL Server
const { Client } = require('pg');

const client = new Client({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"password",
    database: "db" //info changed for GitHub Post even though its local
});

async function main() {
    try {
        await client.connect();

        const forecastData = await fetchWeatherData();
        await insertForecastData(forecastData);
        await displayWeatherData();
    } catch (error) {
        console.error('an error occured', error);
    } finally {
        await client.end();
    }
}

main();

//Made with NodeJS and pg