import _ from "underscore";
import { slugify } from "./utils.js";

const parameterParser = {
	/**
	 * @param {Object} timeLayouts - { layoutKey : Array<layoutObject> }
	 * @param {Object} parameterDataSet - essentially a <parameter> tag in a DWML tree, represented as JSON
	 * @param {import('../dwml-parser.js').DwmlParserOptions} [options={}] - optional config object with parsing options
	 * @returns {Object}
	 */
	parse: function (timeLayouts, parameterDataSet, options = {}) {
		// Normalize options with defaults
		options.skipPropertiesWithNonMatchingEntryCount =
			options.skipPropertiesWithNonMatchingEntryCount ?? false;
		options.skippedAttributes = options.skippedAttributes ?? [];

		const locationKey = this._getLocationKey(parameterDataSet);
		const parameters = parameterDataSet.children;

		const results = {};
		results[locationKey] = this._parseParameters(
			parameters,
			timeLayouts,
			options,
		);
		return results;
	},

	_getLocationKey: (parameterDataSet) => {
		if (!parameterDataSet?.attributes?.["applicable-location"]) {
			throw new Error(
				`DWML parameters is missing child "attributes" (which must contain an "applicable-location"): ${JSON.stringify(parameterDataSet)}`,
			);
		}
		return parameterDataSet.attributes["applicable-location"];
	},

	_parseParameters: function (parameters, timeLayouts, options = {}) {
		const skipPropertiesWithNonMatchingEntryCount =
			options.skipPropertiesWithNonMatchingEntryCount;
		const skippedAttributes = options.skippedAttributes;

		return _.reduce(
			parameters,
			function (memo, dataSet) {
				const typeSlug = slugify(dataSet.attributes.type);

				let key = dataSet.name;
				if (typeof typeSlug === "string" && typeSlug.length > 0) {
					key = `${dataSet.name}-${typeSlug}`;
				}

				const layoutKey = dataSet.attributes["time-layout"];
				if (layoutKey && !skippedAttributes.includes(key)) {
					/// only if there's some layout
					const matchingTimeFrames = timeLayouts[layoutKey];

					/*
          var valueChildNames = ["value", "weather-conditions"];
          var childrenValueCount = dataSet.children.reduce((acc, child) => {
            if (valueChildNames.includes(child.name)) {
              return acc + 1;
            } else {
              return acc;
            }
          }, 0);
          */

					// we need to ignore name children, as they only specify data serie name
					const childrenNonNameCount = dataSet.children.reduce((acc, child) => {
						if (child.name !== "name") {
							return acc + 1;
						}
						return acc;
					}, 0);

					if (matchingTimeFrames.length === childrenNonNameCount) {
						// save the matching properties
						const values = this._formatValuesWithTimeLayouts(
							dataSet.children,
							matchingTimeFrames,
						);

						/// add key to memo
						memo[key] = memo[key] ?? {};

						// Filter out any attributes that should be skipped
						const filteredAttributes = {};
						for (const [attrKey, attrValue] of Object.entries(
							dataSet.attributes,
						)) {
							if (!skippedAttributes.includes(attrKey)) {
								filteredAttributes[attrKey] = attrValue;
							}
						}

						/**
						 * Mixin the attributes and the values that we've created to make this a much more consumable data structure,
						 * while preserving most of the dwml language baked into the DWML xml tags
						 */
						_.extend(memo[key], filteredAttributes, { values: values });
					} else {
						if (skipPropertiesWithNonMatchingEntryCount) {
							// silently skipping the empty properties with missing data
						} else {
							// Default behavior: throw error on obvious mismatch
							throw new Error(
								`The number of time frames in the time layout ${layoutKey} (${matchingTimeFrames.length}) does not match the number of dataSet children value entries (${childrenNonNameCount}): ${JSON.stringify(dataSet)}`,
							);
						}
					}
				} // if layoutKey

				return memo;
			},
			{},
			this,
		);
	},

	/**
    Change this

      children: [
        { name: 'name', attributes: {}, children: [], content: '12 Hourly Probability of Precipitation' },
        { name: 'value', attributes: {}, children: [], content: '1' },
        { name: 'value', attributes: {}, children: [], content: '6' },
        { name: 'value', attributes: {}, children: [], content: '6' },
        { name: 'value', attributes: {}, children: [], content: '2' },
        ...
      ]

    into this:

      [
        { 'start-time': [startTime], 'end-time': [endTime], value: '1'},
        { 'start-time': [startTime], 'end-time': [endTime], value: '6'},
        { 'start-time': [startTime], 'end-time': [endTime], value: '6'},
        { 'start-time': [startTime], 'end-time': [endTime], value: '2'},
        ...
      ]
  */
	_formatValuesWithTimeLayouts: (values, timeFrames) => {
		let i = 0;
		let timeFrameCounter = 0;
		const results = [];
		let currentTimeFrame;
		let currentValue;
		let hasChildren;
		let weather_condition;

		while (i < values.length) {
			currentValue = values[i];

			currentTimeFrame = timeFrames[timeFrameCounter];
			if (currentValue.name === "value") {
				currentTimeFrame = timeFrames[timeFrameCounter];
				results.push(
					_.extend({}, currentTimeFrame, { value: currentValue.content }),
				);
				timeFrameCounter++;
			}
			if (currentValue.name === "weather-conditions") {
				currentTimeFrame = timeFrames[timeFrameCounter];
				hasChildren = currentValue.children && currentValue.children.length > 0;

				weather_condition = {
					summary: currentValue.attributes["weather-summary"],
					coverage: hasChildren
						? currentValue.children[0].attributes.coverage
						: null,
					intensity: hasChildren
						? currentValue.children[0].attributes.intensity
						: null,
					weather_type: hasChildren
						? currentValue.children[0].attributes["weather-type"]
						: null,
					qualifier: hasChildren
						? currentValue.children[0].attributes.qualifier
						: null,
				};

				results.push(
					_.extend({}, currentTimeFrame, { value: weather_condition }),
				);
				timeFrameCounter++;
			}

			i++;
		}

		return results;
	},
};

export default parameterParser;
