require("dotenv").config();

const app = require("./server");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`WeatherNow running on port ${PORT}`);
});