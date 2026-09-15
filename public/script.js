const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const weatherCard = document.getElementById("weatherCard");
const errorElement = document.getElementById("error");

const locationElement = document.getElementById("location");
const weatherIcon = document.getElementById("weatherIcon");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");

const feelsLikeElement = document.getElementById("feelsLike");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("windSpeed");

async function getWeather() {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city.");
        return;
    }

    errorElement.textContent = "";
    weatherCard.classList.add("hidden");

    try {

        const response = await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        locationElement.textContent =
            `${data.city}, ${data.country}`;

        temperatureElement.textContent =
            `${data.temperature}°C`;

        descriptionElement.textContent =
            data.description;

        feelsLikeElement.textContent =
            `${data.feelsLike}°C`;

        humidityElement.textContent =
            `${data.humidity}%`;

        windSpeedElement.textContent =
            `${data.windSpeed} m/s`;

        weatherIcon.src =
            `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

        weatherCard.classList.remove("hidden");

    } catch (error) {

        showError(error.message);
    }
}

function showError(message) {
    errorElement.textContent = message;
    weatherCard.classList.add("hidden");
}

searchButton.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {
        getWeather();
    }

});