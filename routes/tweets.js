const express = require("express");
const router = express.Router();
const Twitter = require("twitter");
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
});

router.get("/", async (req, res) => {
  const { lat, lng } = req.query;
  client.get(
    `https://api.twitter.com/1.1/search/tweets.json?q=covid&lang=en&geocode=${lat},${lng},2km`,
    (error, tweets, response) => {
      if (error) {
        return res.status(400).json({ error: true, message: error });
      }
      const formattedResponse = tweets.statuses.map((tweet) => {
        return {
          id: tweet.id_str,
          time_stamp: tweet.created_at,
          content: tweet.text,
          hashtags: tweet.entities.hashtags[0]
            ? tweet.entities.hashtags[0].text
            : "covid",
          name: tweet.user.name,
          user_name: tweet.user.screen_name,
          user_image_url: tweet.user.profile_image_url_https,
        };
      });
      res.status(200).json({ error: false, data: formattedResponse });
    }
  );
});

module.exports = router;
