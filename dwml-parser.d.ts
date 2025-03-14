/**
 * Type definitions for dwml-parser
 */

/**
 * Weather parameter value
 */
export interface WeatherValue {
	summary: string;
	coverage: string | null;
	intensity: string | null;
	weather_type: string | null;
	qualifier: string | null;
}

/**
 * Time range value with start and end times
 */
export interface TimeRangeValue {
	"start-time": string;
	"end-time": string;
	value: string | WeatherValue;
}

/**
 * Weather parameter like temperature, precipitation, etc.
 */
export interface WeatherParameter {
	type: string;
	units?: string;
	"time-layout": string;
	values: TimeRangeValue[];
}

/**
 * Location information
 */
export interface Location {
	latitude: string;
	longitude: string;
}

/**
 * Point data structure with separate location and values objects
 */
export interface PointData {
	location: Location;
	values: {
		[parameterName: string]: WeatherParameter;
	};
}

/**
 * Parse result object, keyed by location/point ID
 */
export interface ParseResult {
	[locationKey: string]: PointData;
}

/**
 * Options for DWML parser
 */
export interface DwmlParserOptions {
	/**
	 * Whether to skip properties with non-matching entry counts instead of throwing an error
	 * @default false
	 */
	skipPropertiesWithNonMatchingEntryCount?: boolean;

	/**
	 * Array of attribute names to exclude from the output
	 * @default []
	 */
	skippedAttributes?: string[];
}

/**
 * DWML Parser module
 */
declare const dwmlParser: {
	/**
	 * Parses DWML XML string into a JSON object that's easier to work with
	 *
	 * @param xmlString - Raw DWML document text
	 * @param options - Optional config object with parsing options
	 * @returns Parsed weather data organized by location point
	 * @throws Error if the XML is invalid or malformed
	 */
	parse(xmlString: string, options?: DwmlParserOptions): ParseResult;
};

export default dwmlParser;
