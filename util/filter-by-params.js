function filterByParams(filters, params) {
  const paramNames = Object.keys(params);
  const paramValues = Object.values(params);
  const selectedFilters = filters.filter((filter, filterIdx) => {
    return paramNames.every((paramName, paramIdx) => {
      const paramValue = paramValues[paramIdx];
      const filterValue = filter[paramName];
      if (filterValue === '*') {
        return true;
      }
      const filterValueType = (typeof filterValue);
      const paramValueType = (typeof paramValue);
      if (filterValueType === 'undefined') {
        console.error(filter);
        throw new Error(
          `Param '${paramName}' not found in filter #${filterIdx}`);
      }
      if (filterValueType === 'object') {
        // object or array
        if (paramValueType === 'number') {
          let out = true;
          if (filterValue.lte) {
            out = out && (paramValue <= filterValue.lte);
          } else if (filterValue.lt) {
            out = out && (paramValue < filterValue.lt);
          }
          if (filterValue.gte) {
            out = out && (paramValue >= filterValue.gte);
          } else if (filterValue.gt) {
            out = out && (paramValue > filterValue.gt);
          }
          return out;
        } else {
          console.error(filter);
          throw new Error(
            `Param '${paramName}' type ${paramValueType} in filter #${filterIdx} for object filter not implemented.`);
        }
      }
      if (filterValueType === paramValueType) {
        return (filterValue === paramValue);
      }
    });
  });

  return selectedFilters;
}

module.exports = filterByParams;
