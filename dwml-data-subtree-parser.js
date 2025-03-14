import parse from "xml-parser";
import _ from "underscore";
import locationParser from "./dwml-data-parsers/location.js";
import parameterParser from "./dwml-data-parsers/parameter.js";
import timeLayoutParser from "./dwml-data-parsers/time-layout.js";

/**
 * The way I've chosen to parse DWML environmental data is to do the following:
 *   1. Parse out the time-layouts per time-layout-key
 *   2. Parse parameters, grouped by location-id, with time-layout data mixed in (as each param has a time-layout-key)
 *   3. Parse out the location metadata (grouped by location-id)
 *   4. Merge location metadata and parameters (given that they're both grouped by location-id)
 *
 * @typedef {Object} DwmlDataSubtreeParser
 * @property {function(Object, import('./dwml-parser.js').DwmlParserOptions=): Object} parse - Parse DWML data subtree
 * @property {function(Array): Object} _getLocations - Extract locations
 * @property {function(Array, Object, import('./dwml-parser.js').DwmlParserOptions=): Object} _getParameters - Extract parameters
 * @property {function(Array): Object} _getTimeLayouts - Extract time layouts
 * @property {function(Object, Object): Object} _mergeLocationsAndParameters - Merge locations and parameters
 * @property {function(Array): Object} _unwrap - Unwrap array of objects
 */

/**
 * @type {DwmlDataSubtreeParser}
 */
const dwmlDataSubtreeParser = {
	/**
	 * @param {Object} dwmlDataSubtree
	 * @param {import('./dwml-parser.js').DwmlParserOptions} [options={}] - optional config object with parsing options
	 * @returns {Object}
	 */
	parse: function (dwmlDataSubtree, options = {}) {
		// Add time data into parameters as we parse them
		const timeLayouts = this._getTimeLayouts(dwmlDataSubtree.children);
		const parameters = this._getParameters(
			dwmlDataSubtree.children,
			timeLayouts,
			options,
		);
		const locations = this._getLocations(dwmlDataSubtree.children);

		return this._mergeLocationsAndParameters(locations, parameters);
	},

	_getLocations: function (dataSets) {
		const locationDataSets = _.where(dataSets, { name: "location" });
		const locationsArray = _.map(
			locationDataSets,
			locationParser.parse.bind(locationParser),
		);
		return this._unwrap(locationsArray);
	},

	/**
	 * @param {Array} dataSets - data sets to process
	 * @param {Object} timeLayouts - time layouts
	 * @param {import('./dwml-parser.js').DwmlParserOptions} [options={}] - optional configuration options
	 * @returns {Object} - processed parameters
	 */
	_getParameters: function (dataSets, timeLayouts, options = {}) {
		const parameterDataSets = _.where(dataSets, { name: "parameters" });
		const parametersArray = _.map(parameterDataSets, (parameterDataSet) =>
			parameterParser.parse(timeLayouts, parameterDataSet, options),
		);
		return this._unwrap(parametersArray);
	},

	_getTimeLayouts: function (dataSets) {
		const timeLayoutDataSets = _.where(dataSets, { name: "time-layout" });
		const timeLayoutArray = _.map(
			timeLayoutDataSets,
			timeLayoutParser.parse.bind(timeLayoutParser),
		);
		return this._unwrap(timeLayoutArray);
	},

	_mergeLocationsAndParameters: (locations, parameters) => {
		return _.reduce(
			locations,
			(memo, location, locationKey) => {
				memo[locationKey] = {
					location: location,
					values: parameters[locationKey],
				};
				return memo;
			},
			{},
		);
	},

	/**
	 * @param {Array} arrayOfObjects - eg: [ { point1: {}, point2: {} } ]
	 * @return {Object} - eg: { point1: {}, point2: {} }
	 */
	_unwrap: (arrayOfObjects) => {
		return _.reduce(
			arrayOfObjects,
			(memo, object) => {
				return _.extend(memo, object);
			},
			{},
		);
	},
};

export default dwmlDataSubtreeParser;
