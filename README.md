# weatherStack
Uses a local weather station website to grab the JSON elements needed to display the current day high and low as well as the precipitation chance and displays them on a local HTML page.

I wanted to understand how SQL servers work with JavaScript and HTML front-end applications.
I used node.js alongside pg to write to a PostgreSQL local server from the website's JSON file table then take that data from the table using express for a server endpoint and display it on an HTML page. 
Currently, I have the PostgreSQL server displaying to a basic HTML page but I want to be able to style it with CSS as well as add more functionality such as more days of the week or an hourly forecast which can be pulled from the same JSON file.
I also plan to make the application more robust as I am not sure how the webserver I'm pulling data from API's queries works day to day so I may have to change the fetchWeatherData() function.
