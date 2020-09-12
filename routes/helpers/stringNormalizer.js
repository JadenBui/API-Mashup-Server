const stringNormalizer = (stringValue) => {
  const normalizedString = stringValue
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "");
  return normalizedString;
};

module.exports = stringNormalizer;
