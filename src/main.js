'use strict';

import polyfill from 'babel/polyfill';
import app from 'app';
import BrowserWindow from 'browser-window';
import crashReporter from 'crash-reporter';
import * as menu from './browser/menu';
import * as loader from './browser/loader';
import constants from './common/constants';

let mainWindow = null;

if (process.env.NODE_ENV === 'develop') {
   crashReporter.start();
}

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') {
      app.quit();
   }
});

app.on('ready', () => {
   mainWindow = new BrowserWindow({ width: 800, height: 600 });

   mainWindow.loadUrl('file://' + __dirname + constants.url.ROOT);
   mainWindow.toggleDevTools();
   mainWindow.on('closed', () => {
      mainWindow = null;
   });
   menu.initMenu(mainWindow);
});

