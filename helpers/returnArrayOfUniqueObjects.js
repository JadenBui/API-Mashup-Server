let itemHaveNullValue = false;
const returnArrayOfUniqueObjects = (array, key, key1) => {
  return [
    array.filter((object, index, currentArray) => {
      if (object[key] === null || object[key1] === null)
        itemHaveNullValue = true;
      return (
        index ===
        currentArray.findIndex((item) => {
          return item[key] === object[key] && item[key1] === object[key1];
        })
      );
    }),
    itemHaveNullValue,
  ];
};

module.exports = returnArrayOfUniqueObjects;
