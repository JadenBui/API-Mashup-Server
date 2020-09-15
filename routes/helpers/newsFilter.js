const newsFilter = (news, keyword) => {
  const filteredNews = news.filter((article, index, newsArray) => {
    return (
      index ===
      newsArray.findIndex((_article) => {
        return article[keyword] === _article[keyword];
      })
    );
  });
  return filteredNews;
};

module.exports = newsFilter;
