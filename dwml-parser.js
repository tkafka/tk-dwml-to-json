import parse from "xml-parser";
import _ from "underscore";
import dwmlDataSubtreeParser from "./dwml-data-subtree-parser.js";

const dwmlParser = {
	/**
	 * Parses dwml into a JSON object that's easier to grok
	 *
	 * @param xmlString {String} - raw DWML document text
	 * @return {Object}
	 */
	parse: function (xmlString) {
		const documentAsJson = parse(xmlString);
		return this._getDwmlObjectsFromTree(documentAsJson);
	},

	_getDwmlObjectsFromTree: function (documentAsJson) {
		const root = documentAsJson?.root;

		const isValid = this._isValidDWMLTree(root);

		if (isValid !== true) {
			throw new Error(isValid);
		}

		const dwmlDataSubtree = _.findWhere(root.children, { name: "data" });

		const results = {};
		_.extend(results, this._getDocumentData(dwmlDataSubtree));
		return results;
	},

	/**
	 * @param dwmlDataSubtree {Object} - The parsed XML data subtree
	 */
	_getDocumentData: (dwmlDataSubtree) => {
		return dwmlDataSubtreeParser.parse(dwmlDataSubtree);
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
