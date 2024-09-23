const apiKey = 'add9b7a39f348160056f89fd93c3f573';
let units = 'imperial'; // Default unit system: Imperial (°F)
let weatherData = null; // Store the weather data

function getWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                alert(`Error: ${data.message}`);
                return;
            }
            weatherData = data; // Store the weather data
            displayWeather();
        });
}

function displayWeather() {
    if (!weatherData) return;

    document.getElementById('initial-message').style.display = 'none';
    document.querySelector('.current-weather').style.display = 'block';
    document.querySelector('.hourly-forecast').style.display = 'flex';
    document.querySelector('.air-conditions').style.display = 'block';
    document.querySelector('.weekly-forecast').style.display = 'block';

    const currentTemp = Math.round(weatherData.list[0].main.temp);
    const currentCity = weatherData.city.name;

    document.getElementById('city-name').textContent = currentCity;
    document.getElementById('current-temp').textContent = `${currentTemp}°${units === 'imperial' ? 'F' : 'C'}`;
    document.getElementById('chance-of-rain').textContent = `Chance of rain: ${(weatherData.list[0].pop * 100).toFixed(0)}%`;
    document.getElementById('real-feel').textContent = `${Math.round(weatherData.list[0].main.feels_like)}°${units === 'imperial' ? 'F' : 'C'}`;
    document.getElementById('humidity').textContent = `${weatherData.list[0].main.humidity}%`;
    document.getElementById('rain-chance').textContent = `${(weatherData.list[0].pop * 100).toFixed(0)}%`;
    document.getElementById('uv-index').textContent = '3'; // Placeholder for UV index

    displayHourlyForecast();
    displayWeeklyForecast();
}

function displayHourlyForecast() {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        const forecast = weatherData.list[i];
        const time = moment(forecast.dt_txt).format('h A');
        const temp = Math.round(forecast.main.temp);
        const icon = getWeatherIcon(forecast.weather[0].main);

        const hourBox = document.createElement('div');
        hourBox.classList.add('hour-box');
        hourBox.innerHTML = `
            <p>${time}</p>
            <p>${icon}</p>
            <p>${temp}°${units === 'imperial' ? 'F' : 'C'}</p>
        `;
        hourlyForecastDiv.appendChild(hourBox);
    }
}

function displayWeeklyForecast() {
    const weeklyForecastDiv = document.getElementById('weekly-forecast');
    weeklyForecastDiv.innerHTML = '';

    const dailyForecasts = {};

    // Organize forecasts by date
    weatherData.list.forEach(forecast => {
        const date = forecast.dt_txt.split(' ')[0];
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                maxTemp: forecast.main.temp,
                minTemp: forecast.main.temp,
                weather: forecast.weather[0].main,
            };
        } else {
            dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, forecast.main.temp);
            dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, forecast.main.temp);
        }
    });

    // Display daily forecasts
    for (const [date, forecast] of Object.entries(dailyForecasts)) {
        const dayName = moment(date).format('dddd');
        const maxTemp = Math.round(forecast.maxTemp);
        const minTemp = Math.round(forecast.minTemp);
        const icon = getWeatherIcon(forecast.weather);

        const dayBox = document.createElement('div');
        dayBox.classList.add('day-box');
        dayBox.innerHTML = `
            <span class="day-name">${dayName}</span>
            <span class="day-icon">${icon}</span>
            <span class="day-temp">
                <span class="temp-column">
                    <span class="max-temp">${maxTemp}°${units === 'imperial' ? 'F' : 'C'}</span>
                    <span class="min-temp">${minTemp}°${units === 'imperial' ? 'F' : 'C'}</span>
                </span>
            </span>
        `;
        weeklyForecastDiv.appendChild(dayBox);
    }
}

function getWeatherIcon(weather) {
    const icons = {
        Clear: '☀️',
        Clouds: '☁️',
        Rain: '🌧️',
        Snow: '❄️',
        Thunderstorm: '⛈️',
        Drizzle: '🌦️',
    };

    return icons[weather] || '❓'; // Default question mark for unknown weather
}

function toggleTemperature() {
    units = units === 'imperial' ? 'metric' : 'imperial';
    if (weatherData) {
        getWeather(); // Fetch new data with updated units
    }
}