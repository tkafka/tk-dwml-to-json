import _ from "underscore";
import { DateTime } from "luxon";

/**
 * @typedef {Object} TimeLayoutData
 * @property {string} name
 * @property {string} [content]
 * @property {Array<TimeLayoutData>} [children]
 */

const timeLayoutParser = {
	/**
	 * @param {Object} timeLayoutDataSet - just console.log it to see what it looks like
	 * @returns {Object} Parsed time layout data
	 */
	parse: function (timeLayoutDataSet) {
		if (!timeLayoutDataSet.children) {
			throw new Error(
				`Missing children attribute of time layout tag: ${JSON.stringify(timeLayoutDataSet)}`,
			);
		}

		const timeLayoutData = timeLayoutDataSet.children;

		const key = this._getKey(timeLayoutData);
		const results = {};
		results[key] = this._getTimeFrames(timeLayoutData);
		return results;
	},

	_getKey: (timeLayoutData) => {
		const keyObj = _.findWhere(timeLayoutData, { name: "layout-key" });
		if (!keyObj?.content) {
			throw new Error(
				`Time Layout is missing key: ${JSON.stringify(timeLayoutData)}`,
			);
		}

		return keyObj.content;
	},

	/**
	 * It's important that we loop through the start-valid-time and end-valid-time values in order.
	 * That's the only way we know which start time belongs to which end time unless we want to
	 * do a lot of time math.
	 *
	 * @param {Array<TimeLayoutData>} timeLayoutData
	 * @private
	 * @returns {Array<Object>} Array of timeframes
	 */
	_getTimeFrames: (timeLayoutData) => {
		let i = 0;
		const timeframes = [];
		let currentPair = null;
		let lastInterval = null;

		while (i < timeLayoutData.length) {
			const currentLayoutTime = timeLayoutData[i] ?? {};
			const content = currentLayoutTime.content ?? "";

			if (currentLayoutTime.name === "start-valid-time") {
				// either a single record, or a start of a tuple
				if (currentPair) {
					// compute interval
					const currentPairStart = new Date(currentPair["start-time"]);
					const currentPairEnd = new Date(content);
					lastInterval = Number(currentPairEnd) - Number(currentPairStart);

					// close the previous and save
					currentPair["end-time"] = content;
					timeframes.push(_.clone(currentPair));
					currentPair = null;
				}

				// start a new one
				if (content) {
					currentPair = { "start-time": content };
				}
			}

			if (currentLayoutTime.name === "end-valid-time" && currentPair) {
				// compute interval
				const currentPairStart = new Date(currentPair["start-time"]);
				const currentPairEnd = new Date(content);
				lastInterval = Number(currentPairEnd) - Number(currentPairStart);

				// close the previous and save
				currentPair["end-time"] = content;
				timeframes.push(_.clone(currentPair));
				currentPair = null;
			}
			i++;
		}

		if (currentPair) {
			// if we have open pair, close it
			// use Luxon to keep the timezones
			const currentPairStart = DateTime.fromISO(currentPair["start-time"], {
				setZone: true,
			});
			const currentPairDuration = lastInterval ?? 1000 * 60 * 60; // default to 1hr interval
			const currentPairEnd = currentPairStart.plus({
				milliseconds: currentPairDuration,
			});

			/*
      // original with Date
      const currentPairStart = new Date(currentPair["start-time"]);
      const currentPairDuration = lastInterval ?? 1000 * 60 * 60; // default to 1hr interval
      const currentPairEnd = new Date(
        currentPairStart.getTime() + currentPairDuration
      );
      */

			// close the previous and save
			currentPair["end-time"] = currentPairEnd.toISO();
			timeframes.push(_.clone(currentPair));
			currentPair = null;
		}

		return timeframes;
	},
};

export default timeLayoutParser;
