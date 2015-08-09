'use strict';

import polyfill from 'babel/polyfill';
import React from 'react';
import {MainApp} from './components/MainApp';
import {VirtualCanvas} from './canvas/canvas-bag';

var hoge = React.render(React.createElement(MainApp), document.getElementById('main-app'));
