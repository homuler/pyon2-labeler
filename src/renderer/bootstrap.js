'use strict';

import polyfill from 'babel/polyfill';
import React from 'react';
import {MainApp} from './components/MainApp';
import {VirtualCanvas} from './canvas/canvas-bag';

document.ondrop = (e) => { 
   e.preventDefault(); 
   return false;
};
document.ondragover = (e) => { 
   e.preventDefault(); 
   return false;
};
var hoge = React.render(React.createElement(MainApp), document.getElementById('main-app'));
