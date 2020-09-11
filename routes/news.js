const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.get("/:query", async (req, res) => {
  try {
    const currentDate = new Date();
    const to = currentDate.toLocaleDateString().replace(/\//g, "-");
    currentDate.setDate(currentDate.getDate() - 1);
    const from = currentDate.toLocaleDateString().replace(/\//g, "-");
    const { query } = req.params;
    const formattedQuery = encodeURI(query);
    console.log(formattedQuery);
    const response = await axios({
      method: "get",
      header: "X-No-Cache=true",
      url: `https://newsapi.org/v2/everything?q=${formattedQuery}&from=${from}&to=${to}&pageSize=40&language=en&apiKey=${process.env.API_KEY_NEWS}`,
    });
    const articleArray = response.data.articles;
    const data = articleArray.map((article) => {
      const date = new Date(article.publishedAt);
      const formattedDate = date.toDateString();
      return { ...article, publishedAt: formattedDate };
    });
    res.status(200).json({
      error: false,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: true, message: error });
  }
});

module.exports = router;
