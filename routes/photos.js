const express = require("express");
const router = express.Router();
const axios = require("axios");
const random = require("seedrandom");
require("dotenv").config();

const paddingCordinates = (coordinate, defaultCoordinate) => {
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

router.get("/:city", async (req, res, next) => {
  const { keyword, lat, lng } = req.query;
  const { city } = req.params;
  const formattedCity = encodeURI(
    keyword
      ? city.replace("City", "").toLowerCase() + " " + keyword
      : city.replace("City", "").toLowerCase()
  );
  console.log(formattedCity);
  try {
    const response = await axios.get(
      `https://api.unsplash.com/search/photos?query=${formattedCity}&per_page=200&client_id=${process.env.API_KEY_SPLASH}`
    );
    const dataArray = response.data.results;
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
    const coordinatesArray = await Promise.all(promiseArray);
    const data = coordinatesArray.map((coordinate, index) => {
      return {
        ...resultPhotos[index],
        ...paddingCordinates(coordinate.data.location.position, {
          latitude: lat,
          longitude: lng,
        }),
      };
    });
    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(404).json({ error: true, message: err });
  }
});

router.get("/latlng/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  try {
    const response = await axios.get(
      `https://api.unsplash.com/photos/${photo_id}/?client_id=${process.env.API_KEY_SPLASH}`
    );
    const coordinates = response.data.location.position;
    res.status(200).json({ error: false, data: coordinates });
  } catch (err) {
    res.status(404).json({ error: true, message: err });
  }
});

module.exports = router;
