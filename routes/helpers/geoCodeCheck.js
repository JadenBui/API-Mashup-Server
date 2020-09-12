const filterNumber = (coordinate) => coordinate.replace(/[-.]/g, "");

const geoCodeCheck = (lat, lng) => {
  const regex = RegExp(/^[0-9]*$/);
  if (regex.test(filterNumber(lat)) && regex.test(filterNumber(lng))) {
    return true;
  }
  return false;
};
module.exports = geoCodeCheck;
