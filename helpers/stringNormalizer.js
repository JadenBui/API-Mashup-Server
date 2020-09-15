const stringNormalizer = (stringValue, leaveSpacing = false) => {
  const normalizedString = stringValue
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return leaveSpacing ? normalizedString : normalizedString.replace(/\s/g, "");
};

module.exports = stringNormalizer;
