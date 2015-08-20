'use strict';

import constants from '../common/constants';
import * as util from '../common/util';

export function loadPage(win, path, query) {
  let queryStr = util.jsonToQueryString(query);
  console.log(__dirname);
  if (queryStr === null) {
    win.loadUrl('file://' + __dirname + '/..' + path);
  } else {
    win.loadUrl('file://' + __dirname + '/..' + path + '?' + queryStr);
  }

  win.on('closed', () => {
    win = null;
  });
}

export function loadJSON(win, filepath) {
  let query = {
    type: constants.query.JSON_TYPE,
    path: filepath
  }
  loadPage(win, constants.url.ROOT, query);
}

export function loadImage(win, filepath) {
  let query = {
    type: constants.query.IMAGE_TYPE,
    path: filepath
  };
  loadPage(win, constants.url.ROOT, query);
}

