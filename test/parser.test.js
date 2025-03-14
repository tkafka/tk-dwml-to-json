// Core modules
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Libraries
import _ from "underscore";
import { describe, it, expect, beforeEach, beforeAll } from "vitest";

// Application Code
import dwmlParser from "../dwml-parser.js";

// Helper to get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("DWML parser", () => {
	describe("MapClick.php", () => {
		it("parses MapClick data as of 2024-05-22", () => {
			const testXmlFile = path.resolve(__dirname, "./MapClick-2024-05-22.xml");
			const xmlString = fs.readFileSync(testXmlFile, "utf8");
			const parsedData = dwmlParser.parse(xmlString);
			console.log(parsedData);
		});
	});
	describe("dwml.xml", () => {
		let parsedData;
		const expectedTimeLayoutKeys = [
			"k-p12h-n7-3",
			"k-p12h-n7-2",
			"k-p12h-n7-1",
		];

		beforeEach(() => {
			const testXmlFile = path.resolve(__dirname, "./dwml.xml");
			const xmlString = fs.readFileSync(testXmlFile, "utf8");

			parsedData = dwmlParser.parse(xmlString);
		});

		it("parses locations", () => {
			// There should be 2 points based on the test file
			expect(_.values(parsedData)).toHaveLength(2);

			// Each point should have a longitude and a latitude
			_.each(parsedData, (data, locationKey) => {
				expect(["point1", "point2"]).toContain(locationKey);
				expect(data.location).toHaveProperty("longitude");
				expect(data.location).toHaveProperty("latitude");
			});
		});

		it("parses precipitation parameter", () => {
			// Make sure we're testing a real iterable
			expect(_.values(parsedData)).toHaveLength(2);

			_.each(parsedData, (data) => {
				expect(data.values["precipitation-liquid"].type).toBe("liquid");
				expect(data.values["precipitation-liquid"].units).toBe("inches");
				expect(expectedTimeLayoutKeys).toContain(
					data.values["probability-of-precipitation-12-hour"]["time-layout"],
				);

				_.each(data.values["precipitation-liquid"].values, (value) => {
					expect(value["start-time"]).not.toBe("");
					expect(value["end-time"]).not.toBe("");
					expect(value.value).not.toBe("");
				});
			});
		});

		it("parses multiple types of temperature", () => {
			// Make sure we're testing a real iterable
			expect(_.values(parsedData)).toHaveLength(2);

			_.each(parsedData, (data) => {
				expect(data.values["temperature-hourly"].type).toBe("hourly");
				expect(data.values["temperature-apparent"].type).toBe("apparent");
			});
		});

		it("parses probability-of-precipitation", () => {
			// Make sure we're testing a real iterable
			expect(_.values(parsedData)).toHaveLength(2);

			_.each(parsedData, (data) => {
				expect(data.values["probability-of-precipitation-12-hour"].type).toBe(
					"12 hour",
				);
				expect(data.values["probability-of-precipitation-12-hour"].units).toBe(
					"percent",
				);
				expect(expectedTimeLayoutKeys).toContain(
					data.values["probability-of-precipitation-12-hour"]["time-layout"],
				);

				_.each(
					data.values["probability-of-precipitation-12-hour"].values,
					(value) => {
						expect(value["start-time"]).not.toBe("");
						expect(value["end-time"]).not.toBe("");
						expect(value.value).not.toBe("");
					},
				);
			});
		});

		it("parses weather", () => {
			// Make sure we're testing a real iterable
			expect(_.values(parsedData)).toHaveLength(2);

			_.each(parsedData, (data) => {
				expect(expectedTimeLayoutKeys).toContain(
					data.values.weather["time-layout"],
				);
				expect(data.values.weather.values).toHaveLength(7);

				_.each(data.values.weather.values, (value) => {
					expect(value["start-time"]).not.toBe("");
					expect(value["end-time"]).not.toBe("");
					expect(value.value).not.toBe("");

					expect(value.value).toHaveProperty("summary");
					expect(value.value).toHaveProperty("coverage");
					expect(value.value).toHaveProperty("intensity");
					expect(value.value).toHaveProperty("weather_type");
					expect(value.value).toHaveProperty("qualifier");
				});
			});
		});
	});

	describe("dwml-no-temp.xml", () => {
		let xmlString;

		beforeAll(() => {
			const testXmlFile = path.resolve(__dirname, "./dwml-no-temp.xml");
			xmlString = fs.readFileSync(testXmlFile, "utf8");
		});

		it("Parses correctly", () => {
			const parsedData = dwmlParser.parse(xmlString);
			logParsedData(parsedData);
			expect(parsedData).toEqual({
				point1: {
					location: {
						latitude: "38.99",
						longitude: "-77.01",
					},
					values: {
						"precipitation-liquid": {
							type: "liquid",
							units: "inches",
							"time-layout": "k-p6h-n13-2",
							values: [
								{
									"start-time": "2015-06-27T14:00:00-04:00",
									"end-time": "2015-06-27T20:00:00-04:00",
									value: "0.35",
								},
								{
									"start-time": "2015-06-27T20:00:00-04:00",
									"end-time": "2015-06-28T02:00:00-04:00",
									value: "0.37",
								},
								{
									"start-time": "2015-06-28T02:00:00-04:00",
									"end-time": "2015-06-28T08:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T08:00:00-04:00",
									"end-time": "2015-06-28T14:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T14:00:00-04:00",
									"end-time": "2015-06-28T20:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T20:00:00-04:00",
									"end-time": "2015-06-29T02:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T02:00:00-04:00",
									"end-time": "2015-06-29T08:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T08:00:00-04:00",
									"end-time": "2015-06-29T14:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T14:00:00-04:00",
									"end-time": "2015-06-29T20:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T20:00:00-04:00",
									"end-time": "2015-06-30T02:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-30T02:00:00-04:00",
									"end-time": "2015-06-30T08:00:00-04:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-30T08:00:00-04:00",
									"end-time": "2015-06-30T14:00:00-04:00",
									value: "0.01",
								},
								{
									"start-time": "2015-06-30T14:00:00-04:00",
									"end-time": "2015-06-30T20:00:00-04:00",
									value: "0.13",
								},
							],
						},
						"probability-of-precipitation-12-hour": {
							type: "12 hour",
							units: "percent",
							"time-layout": "k-p12h-n7-1",
							values: [
								{
									"start-time": "2015-06-27T08:00:00-04:00",
									"end-time": "2015-06-27T20:00:00-04:00",
									value: "100",
								},
								{
									"start-time": "2015-06-27T20:00:00-04:00",
									"end-time": "2015-06-28T08:00:00-04:00",
									value: "88",
								},
								{
									"start-time": "2015-06-28T08:00:00-04:00",
									"end-time": "2015-06-28T20:00:00-04:00",
									value: "6",
								},
								{
									"start-time": "2015-06-28T20:00:00-04:00",
									"end-time": "2015-06-29T08:00:00-04:00",
									value: "6",
								},
								{
									"start-time": "2015-06-29T08:00:00-04:00",
									"end-time": "2015-06-29T20:00:00-04:00",
									value: "3",
								},
								{
									"start-time": "2015-06-29T20:00:00-04:00",
									"end-time": "2015-06-30T08:00:00-04:00",
									value: "15",
								},
								{
									"start-time": "2015-06-30T08:00:00-04:00",
									"end-time": "2015-06-30T20:00:00-04:00",
									value: "51",
								},
							],
						},
						weather: {
							"time-layout": "k-p12h-n7-1",
							values: [
								{
									"start-time": "2015-06-27T08:00:00-04:00",
									"end-time": "2015-06-27T20:00:00-04:00",
									value: {
										summary: "Mostly Sunny",
										coverage: null,
										intensity: null,
										weather_type: null,
										qualifier: null,
									},
								},
								{
									"start-time": "2015-06-27T20:00:00-04:00",
									"end-time": "2015-06-28T08:00:00-04:00",
									value: {
										summary: "Mostly Sunny",
										coverage: null,
										intensity: null,
										weather_type: null,
										qualifier: null,
									},
								},
								{
									"start-time": "2015-06-28T08:00:00-04:00",
									"end-time": "2015-06-28T20:00:00-04:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-28T20:00:00-04:00",
									"end-time": "2015-06-29T08:00:00-04:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-29T08:00:00-04:00",
									"end-time": "2015-06-29T20:00:00-04:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-29T20:00:00-04:00",
									"end-time": "2015-06-30T08:00:00-04:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-30T08:00:00-04:00",
									"end-time": "2015-06-30T20:00:00-04:00",
									value: {
										summary: "Slight Chance Rain Showers",
										coverage: "slight chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
							],
						},
					},
				},
				point2: {
					location: {
						latitude: "37.78",
						longitude: "-122.42",
					},
					values: {
						"precipitation-liquid": {
							type: "liquid",
							units: "inches",
							"time-layout": "k-p6h-n13-4",
							values: [
								{
									"start-time": "2015-06-27T11:00:00-07:00",
									"end-time": "2015-06-27T17:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-27T17:00:00-07:00",
									"end-time": "2015-06-27T23:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-27T23:00:00-07:00",
									"end-time": "2015-06-28T05:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T05:00:00-07:00",
									"end-time": "2015-06-28T11:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T11:00:00-07:00",
									"end-time": "2015-06-28T17:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T17:00:00-07:00",
									"end-time": "2015-06-28T23:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-28T23:00:00-07:00",
									"end-time": "2015-06-29T05:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T05:00:00-07:00",
									"end-time": "2015-06-29T11:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T11:00:00-07:00",
									"end-time": "2015-06-29T17:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T17:00:00-07:00",
									"end-time": "2015-06-29T23:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-29T23:00:00-07:00",
									"end-time": "2015-06-30T05:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-30T05:00:00-07:00",
									"end-time": "2015-06-30T11:00:00-07:00",
									value: "0.00",
								},
								{
									"start-time": "2015-06-30T11:00:00-07:00",
									"end-time": "2015-06-30T17:00:00-07:00",
									value: "0.00",
								},
							],
						},
						"probability-of-precipitation-12-hour": {
							type: "12 hour",
							units: "percent",
							"time-layout": "k-p12h-n7-3",
							values: [
								{
									"start-time": "2015-06-27T05:00:00-07:00",
									"end-time": "2015-06-27T17:00:00-07:00",
									value: "1",
								},
								{
									"start-time": "2015-06-27T17:00:00-07:00",
									"end-time": "2015-06-28T05:00:00-07:00",
									value: "6",
								},
								{
									"start-time": "2015-06-28T05:00:00-07:00",
									"end-time": "2015-06-28T17:00:00-07:00",
									value: "6",
								},
								{
									"start-time": "2015-06-28T17:00:00-07:00",
									"end-time": "2015-06-29T05:00:00-07:00",
									value: "2",
								},
								{
									"start-time": "2015-06-29T05:00:00-07:00",
									"end-time": "2015-06-29T17:00:00-07:00",
									value: "3",
								},
								{
									"start-time": "2015-06-29T17:00:00-07:00",
									"end-time": "2015-06-30T05:00:00-07:00",
									value: "0",
								},
								{
									"start-time": "2015-06-30T05:00:00-07:00",
									"end-time": "2015-06-30T17:00:00-07:00",
									value: "0",
								},
							],
						},
						weather: {
							"time-layout": "k-p12h-n7-3",
							values: [
								{
									"start-time": "2015-06-27T05:00:00-07:00",
									"end-time": "2015-06-27T17:00:00-07:00",
									value: {
										summary: "Mostly Sunny",
										coverage: null,
										intensity: null,
										weather_type: null,
										qualifier: null,
									},
								},
								{
									"start-time": "2015-06-27T17:00:00-07:00",
									"end-time": "2015-06-28T05:00:00-07:00",
									value: {
										summary: "Mostly Sunny",
										coverage: null,
										intensity: null,
										weather_type: null,
										qualifier: null,
									},
								},
								{
									"start-time": "2015-06-28T05:00:00-07:00",
									"end-time": "2015-06-28T17:00:00-07:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-28T17:00:00-07:00",
									"end-time": "2015-06-29T05:00:00-07:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-29T05:00:00-07:00",
									"end-time": "2015-06-29T17:00:00-07:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-29T17:00:00-07:00",
									"end-time": "2015-06-30T05:00:00-07:00",
									value: {
										summary: "Chance Rain Showers",
										coverage: "chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
								{
									"start-time": "2015-06-30T05:00:00-07:00",
									"end-time": "2015-06-30T17:00:00-07:00",
									value: {
										summary: "Slight Chance Rain Showers",
										coverage: "slight chance",
										intensity: "light",
										weather_type: "rain showers",
										qualifier: "none",
									},
								},
							],
						},
					},
				},
			});
		});
	});

	describe("dwml-broken.xml", () => {
		let xmlString;

		beforeAll(() => {
			// from https://forecast.weather.gov/MapClick.php?lat=34.0188&lon=-118.5097&FcstType=digitalDWML
			const testXmlFile = path.resolve(__dirname, "./dwml-broken.xml");
			xmlString = fs.readFileSync(testXmlFile, "utf8");
		});

		it("throws an error when parsing broken file without skip option", () => {
			// Should throw an error when parsing without skipPropertiesWithNonMatchingEntryCount option
			expect(() => {
				dwmlParser.parse(xmlString);
			}).toThrow(
				/number of time frames.*does not match the number of dataSet children/,
			);
		});

		it("Parses broken file", () => {
			// We should be able to parse the file without crashing
			const parsedData = dwmlParser.parse(xmlString, {
				skipPropertiesWithNonMatchingEntryCount: true,
			});

			// Verify the basic structure of the parsed data
			expect(parsedData).toBeDefined();
			expect(typeof parsedData).toBe("object");

			// There should be at least one point
			const point1 = parsedData.point1;
			expect(point1).toBeDefined();

			// The point should have a location
			expect(point1.location).toBeDefined();
			expect(point1.location.latitude).toBeDefined();
			expect(point1.location.longitude).toBeDefined();
			expect(point1.values["wind-speed-sustained"].values).toBeDefined();
			expect(
				point1.values["wind-speed-sustained"].values.length,
			).toBeGreaterThan(0);

			expect(point1.values["wind-speed-gust"].values).toBeDefined();
			expect(point1.values["wind-speed-gust"].values.length).toBeGreaterThan(0);
			expect(point1.values["direction-wind"].values).toBeDefined();
			expect(point1.values["direction-wind"].values.length).toBeGreaterThan(0);

			// Log the parsed data for verification
			logParsedData(parsedData);
		});

		it("Parses broken file and skips attributes", () => {
			// We should be able to parse the file without crashing
			const parsedData = dwmlParser.parse(xmlString, {
				skipPropertiesWithNonMatchingEntryCount: true,
				skippedAttributes: ["wind-speed-sustained"],
			});

			// Verify the basic structure of the parsed data
			expect(parsedData).toBeDefined();
			expect(typeof parsedData).toBe("object");

			// There should be at least one point
			const point1 = parsedData.point1;
			expect(point1).toBeDefined();

			// The point should have a location
			expect(point1.location).toBeDefined();
			expect(point1.location.latitude).toBeDefined();
			expect(point1.location.longitude).toBeDefined();

			// it's skipped, so it should be undefined
			expect(point1.values["wind-speed-sustained"]).toBeUndefined();

			expect(point1.values["wind-speed-gust"].values).toBeDefined();
			expect(point1.values["wind-speed-gust"].values.length).toBeGreaterThan(0);
			expect(point1.values["direction-wind"].values).toBeDefined();
			expect(point1.values["direction-wind"].values.length).toBeGreaterThan(0);

			// Log the parsed data for verification
			logParsedData(parsedData);
		});
	});

	function logParsedData(data) {
		console.log(JSON.stringify(data, null, 2));
	}
});
