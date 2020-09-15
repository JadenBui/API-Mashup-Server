const express = require("express");
const router = express.Router();
const axios = require("axios");
const stringNormalizer = require("../helpers/stringNormalizer");
const newsFilter = require("../helpers/newsFilter");

require("dotenv").config();

router.get("/:country/:province", async (req, res) => {
  try {
    const currentDate = new Date();
    const to = currentDate.toLocaleDateString().replace(/\//g, "-");
    currentDate.setDate(currentDate.getDate() - 1);
    const from = currentDate.toLocaleDateString().replace(/\//g, "-");
    const { country, province } = req.params;
    const formattedProvince = encodeURI(stringNormalizer(province, true));
    const formattedCountry = encodeURI(stringNormalizer(country, true));
    const provinceResponse = await axios({
      method: "get",
      header: "X-No-Cache=true",
      url: `https://newsapi.org/v2/everything?q=${formattedProvince}&from=${from}&to=${to}&pageSize=40&language=en&apiKey=${process.env.API_KEY_NEWS}`,
    });
    let articleArray = provinceResponse.data.articles;
    if (articleArray.length < 5) {
      const countryResponse = await axios({
        method: "get",
        header: "X-No-Cache=true",
        url: `https://newsapi.org/v2/everything?q=${formattedCountry}&from=${from}&to=${to}&pageSize=40&language=en&apiKey=${process.env.API_KEY_NEWS}`,
      });
      articleArray = countryResponse.data.articles;
    }
    if (articleArray.length === 0) {
      return res.status(404).json({
        error: false,
        data: [],
        message: "There is no data for the requested article",
      });
    }
    const filteredArticleArray = newsFilter(articleArray, "description");
    const data = filteredArticleArray.map((article) => {
      const date = new Date(article.publishedAt);
      const formattedDate = date.toDateString();
      return { ...article, publishedAt: formattedDate };
    });
    res.status(200).json({
      error: false,
      data,
    });
  } catch (error) {
    res.status(400).json({ error: true, message: error });
  }
});

module.exports = router;
