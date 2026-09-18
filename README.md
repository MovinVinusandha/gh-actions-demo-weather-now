# 🌤️ WeatherNow — GitHub Actions CI/CD Demo

> A minimal **Node.js + Express** weather web app built to demonstrate a complete **GitHub Actions CI/CD pipeline** — from automated testing to deployment on **Azure App Service**.

---

## 📌 About

**WeatherNow** is a demo project that showcases a production-style CI/CD workflow using GitHub Actions. It fetches real-time weather data from the [OpenWeatherMap API](https://openweathermap.org/api) and displays it through a clean browser-based UI.

The primary purpose of this repository is to demonstrate:

- ✅ Continuous Integration (CI) — automated test runs on every push and pull request
- 🚀 Continuous Deployment (CD) — automatic deployment to Azure App Service after CI passes
- 🔐 Secure secrets management using GitHub Actions variables and Workload Identity Federation (WIF)

---

## 🧱 Tech Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Runtime     | Node.js 22                            |
| Framework   | Express 5                             |
| Frontend    | Vanilla HTML / CSS / JavaScript       |
| Testing     | Jest + Supertest                      |
| CI/CD       | GitHub Actions                        |
| Cloud       | Azure App Service                     |
| Weather API | OpenWeatherMap (Current Weather Data) |

---

## 🏗️ Project Structure

```
gh-actions-demo-weather-now/
├── .github/
│   └── workflows/
│       ├── ci.yaml          # CI: runs tests on push/PR to main
│       └── cd.yaml          # CD: deploys to Azure after CI passes
├── public/
│   ├── index.html           # Frontend UI
│   ├── script.js            # Client-side weather fetch logic
│   └── style.css            # Styles
├── src/
│   ├── server.js            # Express app & /api/weather endpoint
│   └── start.js             # App entry point
├── test/
│   └── server.test.js       # Jest + Supertest API tests
├── .env                     # Local environment variables (not committed)
├── .gitignore
└── package.json
```

---

## ⚙️ GitHub Actions Workflows

### CI — `ci.yaml`

Triggered on every **push** and **pull request** to `main`.

```
push / PR to main
       │
       ▼
  Checkout repo
       │
       ▼
  Setup Node.js 22
       │
       ▼
  npm ci
       │
       ▼
  npm test  ──► Jest + Supertest
```

### CD — `cd.yaml`

Triggered automatically when the **CI workflow completes successfully** on a push to `main`.

```
CI workflow succeeds (push to main)
       │
       ▼
  Checkout repo
       │
       ▼
  Setup Node.js 22
       │
       ▼
  Azure Login (Workload Identity Federation)
       │
       ▼
  Deploy to Azure App Service (WeatherNow)
```

> **Note:** The CD pipeline uses [Workload Identity Federation](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect) — no long-lived Azure credentials are stored as secrets.

---

## 🔑 Required GitHub Variables

For the CD workflow to deploy, set the following **repository variables** (not secrets) in your GitHub repo settings:

| Variable                | Description                        |
|-------------------------|------------------------------------|
| `AZURE_CLIENT_ID`       | Azure App Registration client ID   |
| `AZURE_TENANT_ID`       | Azure AD tenant ID                 |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID              |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 22+
- An [OpenWeatherMap API key](https://openweathermap.org/appid) (free tier works)

### Setup

```bash
# 1. Fork this repository and clone it to your local machine

# 2. Install dependencies
npm install

# 3. Create a .env file
echo "OPENWEATHER_API_KEY=your_api_key_here" > .env

# 4. Start the app
npm start
```

Visit `http://localhost:3000` in your browser.

---

## 🧪 Running Tests

```bash
npm test
```

Tests use **Jest** and **Supertest** to exercise the `/api/weather` endpoint, covering:

- Valid city lookups
- Missing/invalid city input validation
- City-not-found (404) handling
- Missing API key handling

---

## 🌐 API Endpoint

### `GET /api/weather?city={cityName}`

Returns current weather for the given city.

**Example response:**

```json
{
  "city": "London",
  "country": "GB",
  "temperature": 18,
  "feelsLike": 16,
  "description": "light rain",
  "humidity": 82,
  "windSpeed": 5.1,
  "icon": "10d"
}
```

**Error responses:**

| Status | Reason                              |
|--------|-------------------------------------|
| `400`  | City missing or contains invalid characters |
| `404`  | City not found in OpenWeatherMap    |
| `500`  | API key not configured              |
| `504`  | Weather service timed out           |
