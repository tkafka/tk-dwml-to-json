export function slugify(str) {
	if (typeof str === "string") {
		return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	}
	return str;
}
