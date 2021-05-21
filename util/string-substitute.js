function getSubstitutions(params) {
  const substitutions = Object.keys(params).map((paramKey) => {
    const paramValue = params[paramKey];
    return [
      `\${${paramKey}}`,
      paramValue,
    ];
  });
  return substitutions;
}

function substitute(str, substitutions) {
  let out = str;
  substitutions.forEach(([subKey, subValue]) => {
    out = out.split(subKey).join(subValue);
  });
  return out;
}

module.exports = {
  getSubstitutions,
  substitute,
};