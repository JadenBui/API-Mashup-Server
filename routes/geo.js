const express = require("express");
const router = express.Router();
const axios = require("axios");
const geoCodeCheck = require("../helpers/geoCodeCheck");
require("dotenv").config();

router.get("/address/:address", async (req, res, next) => {
  const { address } = req.params;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`
    );
    if (response.data.status !== "OK") {
      return res.status(400).json({
        error: false,
        data: {},
        message: "There is no data for the requested address",
      });
    }
    res.status(200).json({ error: false, data: response.data });
  } catch (error) {
    res.status(404).json({ error: true, message: error.message });
  }
});

router.get("/latlng", async (req, res, next) => {
  const { lat, lng } = req.query;
  if (!geoCodeCheck(lat, lng))
    return res.status(400).json({
      error: false,
      message: "latitude & longitude can only be number",
    });
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=false&key=${process.env.API_KEY}`
    );
    const countryInfoArray = response.data.results[1].address_components;
    if (countryInfoArray.length === 0) {
      return res.status(404).json({
        error: false,
        message: "There is no data for the requested Geo Code",
      });
    }
    const countryInfo = countryInfoArray
      .filter((add_com) => {
        const address_components_type = add_com.types[0];
        const types = ["administrative_area_level_1", "country", "locality"];
        return types.includes(address_components_type);
      })
      .map((value) => {
        const dictionary = {
          administrative_area_level_1: "province",
          country: "country",
          locality: "locality",
        };
        return { [dictionary[value.types[0]]]: value.long_name };
      });
    const resultObject = countryInfo.reduce((object, value) => {
      return { ...object, ...value };
    }, {});
    const { country, province = country, locality = country } = resultObject;

    res.status(200).json({
      error: false,
      data: { country, province, locality },
    });
  } catch (error) {
    res.status(404).json({ error: true, message: error.message });
  }
});

module.exports = router;
