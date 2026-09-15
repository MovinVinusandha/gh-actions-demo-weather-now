const request = require("supertest");
const app = require("../src/server");

describe("WeatherNow API", () => {

    test("GET / should return the website", async () => {

        const response = await request(app)
            .get("/");

        expect(response.statusCode).toBe(200);

    });

    test("GET /api/weather without city should return 400", async () => {

        const response = await request(app)
            .get("/api/weather");

        expect(response.statusCode).toBe(400);

        expect(response.body.error)
            .toBe("City is required");

    });

});