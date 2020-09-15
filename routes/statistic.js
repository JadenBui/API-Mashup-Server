const express = require("express");
const router = express.Router();
const axios = require("axios");
const stringNormalizer = require("./helpers/stringNormalizer");
/* GET home page. */
router.get("/:countryName/:province", async (req, res, next) => {
  const { countryName, province } = req.params;
  const from = new Date();
  from.setDate(new Date().getDate() - 8);
  const to = new Date();
  to.setDate(new Date().getDate() - 1);
  try {
    const response = await axios.get(
      `https://api.covid19api.com/country/${stringNormalizer(
        countryName,
        true
      )}?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    const statisticArray = response.data;
    const result =
      statisticArray[0].Province !== ""
        ? response.data.filter((stat) =>
            province.toLowerCase().includes(stat.Province.toLowerCase())
          )
        : statisticArray;

    if (result.length === 0) {
      return res.status(404).json({
        error: false,
        data: {},
        message: "There is no data for the requested location",
      });
    }
    const { Confirmed, Deaths, Recovered, Active } = result.slice(-1)[0];

    res
      .status(200)
      .json({ error: false, data: { Confirmed, Deaths, Recovered, Active } });
  } catch (error) {
    res.status(404).json({ error: true, message: error.message });
  }
});

module.exports = router;
