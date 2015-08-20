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

renderPage();

function renderPage() {
  let queryObj = util.queryStringToJSON(location.search.substring(1));
  console.log('query = ', queryObj);
  switch (queryObj.type) {
    case constants.query.IMAGE_TYPE:
      React.render(React.createElement(MainApp, { imgPath: queryObj.path }), 
              document.getElementById('main-app'));
      break;
    case constants.query.JSON_TYPE:
      let remote = require('remote'),
          fs = remote.require('fs'),
          jsonData = JSON.parse(fs.readFileSync(queryObj.path));
      if (jsonData.length && jsonData.length > 0) {
        let imgPath = jsonData[0].filepath,
            figureInfo = jsonData[0].objects,
            imgList = jsonData;
        console.log(imgPath, figureInfo, imgList);
        React.render(React.createElement(MainApp, { imgPath, figureInfo, imgList }),
                document.getElementById('main-app'));
      } else {
        let imgPath = jsonData.filepath,
            figureInfo = jsonData.objects;
        React.render(React.createElement(MainApp, { imgPath, figureInfo }), 
                document.getElementById('main-app'));
      }
      break;
    default:
      React.render(React.createElement(MainApp), 
              document.getElementById('main-app'));
      break;
  }
}
