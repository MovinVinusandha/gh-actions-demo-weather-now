"use strict";

const searchForm      = document.getElementById("searchForm");
const cityInput       = document.getElementById("cityInput");
const searchButton    = document.getElementById("searchButton");

const weatherCard     = document.getElementById("weatherCard");
const statusEl        = document.getElementById("status");

const locationEl      = document.getElementById("location");
const weatherIcon     = document.getElementById("weatherIcon");
const temperatureEl   = document.getElementById("temperature");
const descriptionEl   = document.getElementById("description");

const feelsLikeEl     = document.getElementById("feelsLike");
const humidityEl      = document.getElementById("humidity");
const windSpeedEl     = document.getElementById("windSpeed");

const CITY_PATTERN    = /^[\p{L}\s\-'.,]+$/u;
const MAX_CITY_LENGTH = 100;

let activeRequest = null;

/* ─── Validation ─────────────────────────────────────────────── */
function validateCity(rawCity) {
    const city = rawCity.trim();

    if (!city) {
        return { error: "Please enter a city name." };
    }

    if (city.length > MAX_CITY_LENGTH) {
        return { error: "City name is too long." };
    }

    if (!CITY_PATTERN.test(city)) {
        return { error: "City name can only contain letters, spaces, hyphens, and apostrophes." };
    }

    return { city };
}

/* ─── UI Helpers ─────────────────────────────────────────────── */
function setStatus(message, tone) {
    statusEl.textContent = message || "";

    if (tone) {
        statusEl.dataset.tone = tone;
    } else {
        delete statusEl.dataset.tone;
    }
}

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    const btnText = searchButton.querySelector(".btn-text");
    if (btnText) {
        btnText.textContent = isLoading ? "Searching…" : "Search";
    }
}

/* ─── Fetch Weather ──────────────────────────────────────────── */
async function getWeather(event) {
    event.preventDefault();

    const { city, error: validationError } = validateCity(cityInput.value);

    if (validationError) {
        setStatus(validationError, "error");
        weatherCard.classList.add("hidden");
        return;
    }

    // Cancel any in-flight request so responses can't arrive out of order.
    if (activeRequest) {
        activeRequest.abort();
    }

    const controller = new AbortController();
    activeRequest = controller;

    setLoading(true);
    setStatus("Fetching weather data…");
    weatherCard.classList.add("hidden");

    try {
        const response = await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`,
            { signal: controller.signal }
        );

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("Received an unexpected response from the server.");
        }

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        renderWeather(data);
        setStatus("");

    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        if (error instanceof TypeError) {
            // fetch() throws TypeError for network-level failures (offline, DNS, etc).
            setStatus("Can't reach the server. Check your connection and try again.", "error");
        } else {
            setStatus(error.message, "error");
        }

        weatherCard.classList.add("hidden");

    } finally {
        if (activeRequest === controller) {
            setLoading(false);
            activeRequest = null;
        }
    }
}

/* ─── Render Weather ─────────────────────────────────────────── */
function renderWeather(data) {
    locationEl.textContent     = `${data.city}, ${data.country}`;
    temperatureEl.textContent  = `${data.temperature}°C`;
    descriptionEl.textContent  = data.description;

    feelsLikeEl.textContent    = `${data.feelsLike}°C`;
    humidityEl.textContent     = `${data.humidity}%`;
    windSpeedEl.textContent    = `${data.windSpeed} m/s`;

    weatherIcon.src            = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    weatherIcon.alt            = data.description;

    // Remove and re-add to re-trigger the CSS reveal animation
    weatherCard.classList.remove("hidden");
    void weatherCard.offsetWidth; // force reflow
    weatherCard.classList.remove("hidden");
}

/* ─── Events ─────────────────────────────────────────────────── */
searchForm.addEventListener("submit", getWeather);

// Allow pressing Enter in the input
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
});