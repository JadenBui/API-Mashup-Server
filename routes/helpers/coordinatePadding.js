const random = require("seedrandom");

const coordinatePadding = (coordinate, defaultCoordinate) => {
  let { latitude, longitude } = coordinate.latitude
    ? coordinate
    : defaultCoordinate;
  const rngLat = random();
  const rngLng = random();

  latitude =
    latitude.toString().slice(0, latitude.toString().length - 5) +
    `${Math.floor(rngLat() * 2000)}`;
  longitude =
    longitude.toString().slice(0, longitude.toString().length - 5) +
    `${Math.floor(rngLng() * 2000)}`;
  return { latitude, longitude };
};

module.exports = coordinatePadding;
