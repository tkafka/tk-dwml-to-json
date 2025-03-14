import parse from "xml-parser";
import _ from "underscore";
import dwmlDataSubtreeParser from "./dwml-data-subtree-parser.js";

/**
 * @typedef {Object} DwmlParserOptions
 * @property {boolean} [skipPropertiesWithNonMatchingEntryCount=false] - Whether to skip properties with non-matching entry counts instead of throwing an error
 * @property {string[]} [skippedAttributes=[]] - Array of attribute names to exclude from the output
 */

const dwmlParser = {
	/**
	 * Parses dwml into a JSON object that's easier to grok
	 *
	 * @param xmlString {String} - raw DWML document text
	 * @param {DwmlParserOptions} [options={}] - optional config object with parsing options
	 * @return {Object}
	 */
	parse: function (xmlString, options = {}) {
		const documentAsJson = parse(xmlString);
		return this._getDwmlObjectsFromTree(documentAsJson, options);
	},

	/**
	 * @param {Object} documentAsJson - The parsed XML document as JSON
	 * @param {DwmlParserOptions} [options={}] - configuration options
	 * @returns {Object}
	 */
	_getDwmlObjectsFromTree: function (documentAsJson, options = {}) {
		const root = documentAsJson?.root;

		const isValid = this._isValidDWMLTree(root);

		if (isValid !== true) {
			throw new Error(isValid);
		}

		const dwmlDataSubtree = _.findWhere(root.children, { name: "data" });

		const results = {};
		_.extend(results, this._getDocumentData(dwmlDataSubtree, options));
		return results;
	},

	/**
	 * @param {Object} dwmlDataSubtree - The parsed XML data subtree
	 * @param {DwmlParserOptions} [options={}] - configuration options
	 * @returns {Object}
	 */
	_getDocumentData: (dwmlDataSubtree, options = {}) => {
		return dwmlDataSubtreeParser.parse(dwmlDataSubtree, options);
	},

	/**
	 * @param root {Object} - The parsed XML root object with name and children properties
	 */
	_isValidDWMLTree: (root) => {
		if (!root) {
			return "Cannot find document root";
		}

		if (root.name !== "dwml") {
			return 'Root element is supposed to be named "dwml"';
		}

		if (!root.children) {
			return "Cannot find DWML data [ie, the children element of the dwml tree]";
		}

		return true;
	},
};

export default dwmlParser;
