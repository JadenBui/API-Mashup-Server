const express = require("express");
const router = express.Router();
const axios = require("axios");
const geoCodeCheck = require("./helpers/geoCodeCheck");
const stringNormalizer = require("./helpers/stringNormalizer");
const returnArrayOfUniqueObjects = require("./helpers/returnArrayOfUniqueObjects");
const coordinatePadding = require("./helpers/coordinatePadding");

require("dotenv").config();

router.get("/:country/:city", async (req, res, next) => {
  const { keyword, lat, lng } = req.query;
  const { city, country } = req.params;
  if (!geoCodeCheck(lat, lng))
    return res.status(400).json({
      error: false,
      message: "latitude & longitude can only be number",
    });
  const formattedCity = encodeURI(
    keyword
      ? city.replace("City", "").toLowerCase() + " " + keyword
      : city.replace("City", "").toLowerCase()
  );
  const formattedCountry = encodeURI(stringNormalizer(country));
  try {
    const cityResponse = await axios.get(
      `https://api.unsplash.com/search/photos?query=${formattedCity}&per_page=200&client_id=${process.env.API_KEY_SPLASH}`
    );
    let dataArray = cityResponse.data.results;
    if (dataArray.length === 0) {
      const countryResponse = await axios.get(
        `https://api.unsplash.com/search/photos?query=${formattedCountry}&per_page=200&client_id=${process.env.API_KEY_SPLASH}`
      );
      dataArray = countryResponse.data.results;
    }
    if (dataArray.length === 0) {
      return res.status(404).json({
        error: false,
        data: [],
        message: "There is no data for the requested location",
      });
    }
    let photos;
    if (keyword) {
      photos = dataArray.slice(0, 10).filter((item) => {
        if (item.description && item.tags) {
          const tagArray = item.tags.filter((tag) =>
            tag.title.toLowerCase().includes(keyword)
          );
          return (
            item.description.toLowerCase().includes(keyword) ||
            tagArray.length !== 0
          );
        }
        return false;
      });
    } else {
      photos = dataArray.slice(0, 10);
    }
    const resultPhotos = photos.map((item) => {
      return {
        id: item.id,
        description: item.description,
        url: item.urls.thumb,
        userName: item.user.name,
        twitter: item.user.twitter_username,
        instagram: item.user.instagram_username,
        avatar: item.user.profile_image.medium,
      };
    });
    const promiseArray = resultPhotos.map((photo) => {
      return axios.get(
        `https://api.unsplash.com/photos/${photo.id}/?client_id=${process.env.API_KEY_SPLASH}`
      );
    });
    const resultArray = await Promise.all(promiseArray);
    const coordinatesArray = resultArray.map((item) => {
      return { ...item.data.location.position };
    });
    let data;
    const [uniqueCoordinateArray, hasNullValue] = returnArrayOfUniqueObjects(
      coordinatesArray
    );
    if (
      uniqueCoordinateArray.length !== coordinatesArray.length ||
      hasNullValue
    ) {
      data = coordinatesArray.map((coordinate, index) => {
        return {
          ...resultPhotos[index],
          ...coordinatePadding(coordinate, {
            latitude: lat,
            longitude: lng,
          }),
        };
      });
    } else {
      data = coordinatesArray.map((coordinate, index) => {
        return {
          ...resultPhotos[index],
          ...coordinate,
        };
      });
    }

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(404).json({ error: true, message: err.message });
  }
});

module.exports = router;
