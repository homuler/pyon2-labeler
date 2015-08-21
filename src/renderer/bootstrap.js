'use strict';

import polyfill from 'babel/polyfill';
import React from 'react';
import {MainApp} from './components/MainApp';
import {VirtualCanvas} from './canvas/canvas-bag';
import * as util from '../common/util';
import constants from '../common/constants';

document.ondrop = (e) => { 
  e.preventDefault(); 
  return false;
};

document.ondragover = (e) => { 
  e.preventDefault(); 
  return false;
};

let mainApp = renderPage();

function renderPage() {
  let queryObj = util.queryStringToJSON(location.search.substring(1)),
      remote = require('remote'),
      fs = remote.require('fs');
  console.log('query = ', queryObj);
  switch (queryObj.type) {
    case constants.query.IMAGE_TYPE: {
      return React.render(React.createElement(MainApp, { imgPath: queryObj.path }), 
               document.getElementById('main-app'));
      break;
    }
    case constants.query.JSON_TYPE: {
      let jsonData = JSON.parse(fs.readFileSync(queryObj.path)),
          imgPath = jsonData.filepath,
          figureInfo = jsonData.objects;
      return React.render(React.createElement(MainApp, { imgPath, figureInfo }), 
               document.getElementById('main-app'));
      break;
    }
    case constants.query.JSON_ARRAY_TYPE: {
      let jsonData = JSON.parse(fs.readFileSync(queryObj.path)),
          figureIdx = +queryObj.index,
          imgPath = jsonData[figureIdx].filepath,
          figureInfo = jsonData[figureIdx].objects,
          imgList = jsonData;
      return React.render(React.createElement(MainApp, { imgPath, figureInfo, figureIdx, imgList }),
               document.getElementById('main-app'));
      break;
    }
    default:
      return React.render(React.createElement(MainApp), 
               document.getElementById('main-app'));
      break;
  }
}
