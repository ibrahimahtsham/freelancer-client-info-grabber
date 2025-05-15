export default function flatten(obj, prefix = "") {
  let flat = {};
  for (const key in obj) {
    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(flat, flatten(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      flat[prefix ? `${prefix}.${key}` : key] = obj[key];
    }
  }
  return flat;
}
