exports.slugify = function (str) {
  if (typeof str === "string") {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  } else {
    return str;
  }
};
