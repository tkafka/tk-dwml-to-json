/**
 * Type definitions for dwml-data-subtree-parser
 */

import type { DwmlParserOptions, ParseResult } from "./dwml-parser";

/**
 * XML data subtree object from xml-parser
 */
interface XmlNode {
	name: string;
	attributes: Record<string, string>;
	children: XmlNode[];
	content?: string;
}

/**
 * Time layout data structure
 */
interface TimeLayout {
	[timeLayoutKey: string]: {
		"start-time": string[];
		"end-time": string[];
	};
}

/**
 * Location data structure
 */
interface LocationData {
	[locationKey: string]: {
		latitude: string;
		longitude: string;
	};
}

/**
 * Parameter data structure
 */
interface ParameterData {
	[locationKey: string]: {
		[parameterName: string]: {
			type: string;
			units?: string;
			"time-layout": string;
			values: Array<{
				"start-time": string;
				"end-time": string;
				value:
					| string
					| {
							summary: string;
							coverage: string | null;
							intensity: string | null;
							weather_type: string | null;
							qualifier: string | null;
					  };
			}>;
		};
	};
}

/**
 * DWML data subtree parser module
 */
declare const dwmlDataSubtreeParser: {
	/**
	 * Parse DWML data subtree into structured data
	 *
	 * @param dwmlDataSubtree - The parsed XML data subtree
	 * @param options - Optional config object with parsing options
	 * @returns Parsed weather data organized by location point
	 */
	parse(dwmlDataSubtree: XmlNode, options?: DwmlParserOptions): ParseResult;

	/**
	 * Extract locations from data sets
	 *
	 * @param dataSets - Data sets to process
	 * @returns Location data
	 */
	_getLocations(dataSets: XmlNode[]): LocationData;

	/**
	 * Extract parameters from data sets
	 *
	 * @param dataSets - Data sets to process
	 * @param timeLayouts - Time layouts
	 * @param options - Optional configuration options
	 * @returns Parameter data
	 */
	_getParameters(
		dataSets: XmlNode[],
		timeLayouts: TimeLayout,
		options?: DwmlParserOptions,
	): ParameterData;

	/**
	 * Extract time layouts from data sets
	 *
	 * @param dataSets - Data sets to process
	 * @returns Time layouts
	 */
	_getTimeLayouts(dataSets: XmlNode[]): TimeLayout;

	/**
	 * Merge locations and parameters
	 *
	 * @param locations - Location data
	 * @param parameters - Parameter data
	 * @returns Merged data
	 */
	_mergeLocationsAndParameters(
		locations: LocationData,
		parameters: ParameterData,
	): ParseResult;

	/**
	 * Unwrap array of objects into a single object
	 *
	 * @param arrayOfObjects - Array of objects to unwrap
	 * @returns Unwrapped object
	 */
	_unwrap<T>(arrayOfObjects: Array<Record<string, T>>): Record<string, T>;
};

export default dwmlDataSubtreeParser;
