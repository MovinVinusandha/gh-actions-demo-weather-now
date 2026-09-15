require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const FETCH_TIMEOUT_MS = 8000;
const MAX_CITY_LENGTH = 100;
// Letters (incl. accented), spaces, hyphens, apostrophes, commas, periods —
// covers "New York", "Saint-Étienne", "St. Paul", "O'Fallon".
const CITY_PATTERN = /^[\p{L}\s\-'.,]+$/u;

app.use(express.static("public"));

function validateCity(rawCity) {
    if (typeof rawCity !== "string") {
        return { error: "City is required" };
    }

    const city = rawCity.trim();

    if (!city) {
        return { error: "City is required" };
    }

    if (city.length > MAX_CITY_LENGTH) {
        return { error: "City name is too long" };
    }

    if (!CITY_PATTERN.test(city)) {
        return { error: "City name contains invalid characters" };
    }

    return { city };
}

async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

app.get("/api/weather", async (req, res) => {
    const { city, error: validationError } = validateCity(req.query.city);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "OpenWeather API key is not configured"
        });
    }

    try {
        const url =
            `https://api.openweathermap.org/data/2.5/weather` +
            `?q=${encodeURIComponent(city)}` +
            `&appid=${apiKey}` +
            `&units=metric`;

        const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({
                    error: "City not found"
                });
            }

            return res.status(response.status).json({
                error: "Failed to retrieve weather data"
            });
        }

        const data = await response.json();

        const weather = {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            icon: data.weather[0].icon
        };

        res.json(weather);

    } catch (error) {
        if (error.name === "AbortError") {
            console.error("OpenWeather request timed out:", city);

            return res.status(504).json({
                error: "Weather service took too long to respond"
            });
        }

        console.error(error);

        res.status(500).json({
            error: "Unable to connect to weather service"
        });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`WeatherNow running on port ${PORT}`);
    });
}

module.exports = app;