'use strict';

export function jsonToQueryString(obj) {
  if (obj === undefined) {
    return null;
  }
  let str = '';
  for (let attr in obj) {
    if ((typeof obj[attr]) === 'object') {
      if (obj[attr].length !== undefined) {
        str += '&' + encodeURIComponent(attr) + '=' +
          encodeURIComponent(arrayToString(obj[attr]));
      } else {
        throw new Error(
         'Invalid query obj: key = ' + attr +
         ', value = ' + JSON.stringify(obj[attr]));
      }
    } else {
      str += '&' + encodeURIComponent(attr) + '=' +
        encodeURIComponent(obj[attr]);
    }
  }
  return str.substring(1);

  function arrayToString(arr) {
    return arr.reduce((acc, x) => { return acc + ',' + x; });
  }
}

export function queryStringToJSON(str) {
  let obj = {};
  let arr = str.split('&').forEach((x) => {
    if (x.indexOf('=') >= 0) {
      let [k, v] = getKeyValue(x);
      obj[k] = v;
    }
  });
  return obj;

  function getKeyValue(str) {
    let [k, v] = str.split('=');
    return [k, parseValue(v)].map(decodeURIComponent);
  }

  function parseValue(str) {
    if (str.indexOf(',') >= 0) {
      return str.split(',').map((x) => parseValue(x));
    }
    if (isNaN(parseInt(str))) {
      return str;
    } else {
      return +str;
    }
  }
}
