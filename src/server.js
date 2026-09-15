const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/weather", async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({
            error: "City is required"
        });
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

        const response = await fetch(url);

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