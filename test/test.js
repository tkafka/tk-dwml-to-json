// Core modules
var fs = require("fs");
var path = require("path");

// Libraries
var _ = require("underscore");
var expect = require("expect.js");

// Application Code
var dwmlParser = require("../dwml-parser");

describe("DWML parser", function () {
  describe("MapClick.php", function () {
    it("parses MapClick data as of 2024-05-22", function () {
      const testXmlFile = path.resolve(__dirname, "./MapClick-2024-05-22.xml");
      const xmlString = fs.readFileSync(testXmlFile, "utf8");
      const parsedData = dwmlParser.parse(xmlString);
      console.log(parsedData);
    });
  });
  describe("dwml.xml", function () {
    let parsedData;
    const expectedTimeLayoutKeys = [
      "k-p12h-n7-3",
      "k-p12h-n7-2",
      "k-p12h-n7-1",
    ];

    beforeEach(function () {
      const testXmlFile = path.resolve(__dirname, "./dwml.xml");
      const xmlString = fs.readFileSync(testXmlFile, "utf8");

      parsedData = dwmlParser.parse(xmlString);
    });

    it("parses locations", function () {
      // There should be 2 points based on the test file
      expect(_.values(parsedData)).to.have.length(2);

      // Each point should have a longitude and a latitude
      _.each(parsedData, function (data, locationKey) {
        expect(["point1", "point2"]).to.contain(locationKey);
        expect(data.location).to.have.key("longitude");
        expect(data.location).to.have.key("latitude");
      });
    });

    it("parses precipitation parameter", function () {
      // Make sure we're testing a real iterable
      expect(_.values(parsedData)).to.have.length(2);

      _.each(parsedData, function (data) {
        expect(data["precipitation-liquid"].type).to.be("liquid");
        expect(data["precipitation-liquid"].units).to.be("inches");
        expect(expectedTimeLayoutKeys).to.contain(
          data["probability-of-precipitation-12-hour"]["time-layout"]
        );

        _.each(data["precipitation-liquid"].values, function (value) {
          expect(value["start-time"]).to.not.be.empty();
          expect(value["end-time"]).to.not.be.empty();
          expect(value["value"]).to.not.be.empty();
        });
      });
    });

    it("parses multiple types of temperature", function () {
      // Make sure we're testing a real iterable
      expect(_.values(parsedData)).to.have.length(2);

      _.each(parsedData, function (data) {
        expect(data["temperature-hourly"].type).to.be("hourly");
        expect(data["temperature-apparent"].type).to.be("apparent");
      });
    });

    it("parses probability-of-precipitation", function () {
      // Make sure we're testing a real iterable
      expect(_.values(parsedData)).to.have.length(2);

      _.each(parsedData, function (data) {
        expect(data["probability-of-precipitation-12-hour"].type).to.be(
          "12 hour"
        );
        expect(data["probability-of-precipitation-12-hour"].units).to.be(
          "percent"
        );
        expect(expectedTimeLayoutKeys).to.contain(
          data["probability-of-precipitation-12-hour"]["time-layout"]
        );

        _.each(
          data["probability-of-precipitation-12-hour"].values,
          function (value) {
            expect(value["start-time"]).to.not.be.empty();
            expect(value["end-time"]).to.not.be.empty();
            expect(value["value"]).to.not.be.empty();
          }
        );
      });
    });

    it("parses weather", function () {
      // Make sure we're testing a real iterable
      expect(_.values(parsedData)).to.have.length(2);

      _.each(parsedData, function (data) {
        expect(expectedTimeLayoutKeys).to.contain(
          data["weather"]["time-layout"]
        );
        expect(data["weather"].values).to.have.length(7);

        _.each(data["weather"].values, function (value) {
          expect(value["start-time"]).to.not.be.empty();
          expect(value["end-time"]).to.not.be.empty();
          expect(value["value"]).to.not.be.empty();

          expect(value["value"]).to.have.property("summary");
          expect(value["value"]).to.have.property("coverage");
          expect(value["value"]).to.have.property("intensity");
          expect(value["value"]).to.have.property("weather_type");
          expect(value["value"]).to.have.property("qualifier");
        });
      });
    });
  });

  describe("dwml-no-temp.xml", function () {
    var xmlString;

    before(function () {
      var testXmlFile = path.resolve(__dirname, "./dwml-no-temp.xml");
      xmlString = fs.readFileSync(testXmlFile, "utf8");
    });

    it("Parses correctly", function () {
      const parsedData = dwmlParser.parse(xmlString);
      logParsedData(parsedData);
      expect(parsedData).to.eql({
        point1: {
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
          location: {
            latitude: "38.99",
            longitude: "-77.01",
          },
        },
        point2: {
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
          location: {
            latitude: "37.78",
            longitude: "-122.42",
          },
        },
      });
    });
  });

  describe("graphical.weather.gov", function () {
    var xmlString;

    beforeEach(function () {
      var testXmlFile = path.resolve(
        __dirname,
        "./graphical.weather.gov-xml-SOAP_server-ndfdXMLclient.xml"
      );
      xmlString = fs.readFileSync(testXmlFile, "utf8");
    });

    it("parses the file without crashing", function () {
      const parsedData = dwmlParser.parse(xmlString);
      const point1 = parsedData["point1"];
      const keysAndValueCount = Object.keys(point1).reduce((acc, key) => {
        if (key === "location") {
          return acc;
        }
        const serie = point1[key];
        if (Array.isArray(serie.values)) {
          const firstStartTime = new Date(serie.values[0]["start-time"]);
          const lastStartTime = new Date(
            serie.values[serie.values.length - 1]["start-time"]
          );
          const extentHours = Math.floor(
            (lastStartTime.getTime() - firstStartTime.getTime()) /
              (60 * 60 * 1000)
          );
          const serieLength = serie.values.length;
          const typicalIntervalHours = extentHours / serieLength;

          // compute the intervals between series values start-time:

          const intervalsHours = serie.values
            .slice(0, -1)
            .map((value, index) => {
              const startTime = new Date(value["start-time"]).getTime();
              const nextStartTime = new Date(
                serie.values[index + 1]["start-time"]
              ).getTime();
              return (nextStartTime - startTime) / (60 * 60 * 1000);
            });

          acc[
            key
          ] = `${serieLength} values, ${extentHours} hours, avg 𝛥 ${typicalIntervalHours.toFixed(
            2
          )} hr. Intervals: ${intervalsHours
            .map((n) => `${n.toFixed(0)}`)
            .join(", ")}`; //  (${firstStartTime} to ${lastStartTime})
        } else {
          throw new Error(`Serie ${key} does not have a values array`);
          acc[key] = "skipped";
        }
        return acc;
      }, {});
      console.log({ keysAndValueCount });
      logParsedData(parsedData);
    });
  });

  function logParsedData(data) {
    console.log(JSON.stringify(data, null, 2));
  }
});
