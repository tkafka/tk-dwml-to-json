// Core modules
var fs = require('fs');
var path = require('path');

// Libraries
var _ = require('underscore');
var expect = require('expect.js');

// Application Code
var dwmlParser = require('../dwml-parser');


describe('DWML Parser', function () {
  var parsedData;
  var expectedTimeLayoutKeys = ['k-p12h-n7-3', 'k-p12h-n7-2', 'k-p12h-n7-1'];

  beforeEach(function () {
    var testXmlFile = path.resolve(__dirname, './dwml.xml');
    var xmlString = fs.readFileSync(testXmlFile, 'utf8');

    parsedData = dwmlParser.parse(xmlString);
  });

  describe('#parse', function () {

    it('parses locations', function () {

      // There should be 2 points based on the test file
      expect(_.values(parsedData)).to.have.length(2);

      // Each point should have a longitude and a latitude
      _.each(parsedData, function (data, locationKey) {
        expect(['point1', 'point2']).to.contain(locationKey);
        expect(data.location).to.have.key('longitude');
        expect(data.location).to.have.key('latitude');
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

    it('parses weather', function () {
      // Make sure we're testing a real iterable
      expect(_.values(parsedData)).to.have.length(2);

      _.each(parsedData, function (data) {
        expect(expectedTimeLayoutKeys).to.contain(data['weather']['time-layout']);
        expect(data['weather'].values).to.have.length(7);

        _.each(data['weather'].values, function (value) {
          expect(value['start-time']).to.not.be.empty();
          expect(value['end-time']).to.not.be.empty();
          expect(value['value']).to.not.be.empty();

          expect(value['value']).to.have.property('summary');
          expect(value['value']).to.have.property('coverage');
          expect(value['value']).to.have.property('intensity');
          expect(value['value']).to.have.property('weather_type');
          expect(value['value']).to.have.property('qualifier');
        })
      });
    });

  });
});
