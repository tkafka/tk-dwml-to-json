import _ from 'underscore';
import utilsParser from './utils.js';
import { DateTime } from 'luxon';

const timeLayoutParser = {
  /**
   * @param timeLayoutDataSet {JSON} - just console.log it to see what it looks like
   */
  parse: function (timeLayoutDataSet) {
    if (!timeLayoutDataSet.children) {
      throw new Error(
        "Missing children attribute of time layout tag: " +
          JSON.stringify(timeLayoutDataSet)
      );
    }

    var timeLayoutData = timeLayoutDataSet.children;

    var key = this._getKey(timeLayoutData);
    var results = {};
    results[key] = this._getTimeFrames(timeLayoutData);
    return results;
  },

  _getKey: function (timeLayoutData) {
    var keyObj = _.findWhere(timeLayoutData, { name: "layout-key" });
    if (!(keyObj && keyObj.content)) {
      throw new Error(
        "Time Layout is missing key: " + JSON.stringify(timeLayoutData)
      );
    }

    return keyObj.content;
  },

  /**
   * It's important that we loop through the start-valid-time and end-valid-time values in order.
   * That's the only way we know which start time belongs to which end time unless we want to
   * do a lot of time math.
   *
   * @param timeLayoutData {Object}
   * @private
   */
  _getTimeFrames: function (timeLayoutData) {
    var i = 0,
      timeframes = [],
      currentPair = null,
      lastInterval = null;

    while (i < timeLayoutData.length) {
      var currentLayoutTime = timeLayoutData[i] || {};

      if (currentLayoutTime.name === "start-valid-time") {
        // either a single record, or a start of a tuple
        if (currentPair) {
          // compute interval
          const currentPairStart = new Date(currentPair["start-time"]);
          const currentPairEnd = new Date(currentLayoutTime.content);
          lastInterval = currentPairEnd - currentPairStart;

          // close the previous and save
          currentPair["end-time"] = currentLayoutTime.content;
          timeframes.push(_.clone(currentPair));
          currentPair = null;
        }

        // start a new one
        currentPair = { "start-time": currentLayoutTime.content };
      }

      if (currentLayoutTime.name === "end-valid-time") {
        // compute interval
        const currentPairStart = new Date(currentPair["start-time"]);
        const currentPairEnd = new Date(currentLayoutTime.content);
        lastInterval = currentPairEnd - currentPairStart;

        // close the previous and save
        currentPair["end-time"] = currentLayoutTime.content;
        timeframes.push(_.clone(currentPair));
        currentPair = null;
      }
      i++;
    }

    if (currentPair) {
      // if we have open pair, close it
      // use Luxon to keep the timezones
      const currentPairStart = DateTime.fromISO(
        currentPair["start-time"],
        {
          setZone: true,
        }
      );
      const currentPairDuration = lastInterval || 1000 * 60 * 60; // default to 1hr interval
      const currentPairEnd = currentPairStart.plus({
        milliseconds: currentPairDuration,
      });

      /*
      // original with Date
      const currentPairStart = new Date(currentPair["start-time"]);
      const currentPairDuration = lastInterval || 1000 * 60 * 60; // default to 1hr interval
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
