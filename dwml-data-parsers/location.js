import _ from "underscore";

/**
 * @typedef {Object} LocationDataSet
 * @property {Array} children - Location attributes
 */

/**
 * @typedef {Object} LocationPoint
 * @property {string} latitude - Latitude coordinate
 * @property {string} longitude - Longitude coordinate
 */

const locationParser = {
	/**
	 * @param {LocationDataSet} locationDataSet - essentially a <location> tag in a DWML tree, represented as JSON
	 * @return {Object} - Object with location key and point data
	 */
	parse(locationDataSet) {
		if (!locationDataSet.children) {
			throw new Error(
				`Invalid location in dwml: ${JSON.stringify(locationDataSet)}`,
			);
		}

		const locationAttributes = locationDataSet.children;

		const results = {};
		const key = this._getLocationKey(locationAttributes);
		results[key] = this._getLocationPoint(locationAttributes);
		return results;
	},

	_getLocationKey(locationAttributes) {
		const keyObj = _.findWhere(locationAttributes, { name: "location-key" });
		if (!keyObj?.content) {
			throw new Error(
				`Location is missing key: ${JSON.stringify(locationAttributes)}`,
			);
		}

		return keyObj.content;
	},

	_getLocationPoint(locationAttributes) {
		const pointObj = _.findWhere(locationAttributes, { name: "point" });
		if (!pointObj?.attributes) {
			throw new Error(
				`Location is missing point: ${JSON.stringify(locationAttributes)}`,
			);
		}
		return pointObj.attributes;
	},
};

export default locationParser;
