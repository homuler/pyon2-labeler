'use strict';

import Menu from 'menu';
import * as loader from './loader';
import dialog from 'dialog';
import fs from 'fs';

function genTemplate(win) {
  let template = [
    {
      label: 'File',
      submenu: [
        { 
          label: 'Open Image', 
          accelerator: 'Ctrl+F', 
          click: function () {
            dialog.showOpenDialog(win, {
              title: 'Open Image File',
              defaultPath: '~/Pictures',
              filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'bmp'] }
              ],
              properties: ['openFile']
            },
            function(filepath) {
              loader.loadImage(win, filepath);
            });
          } 
        },
        { 
          label: 'Open JSON File', 
          accelerator: 'Ctrl+Alt+F', 
          click: function () {
            dialog.showOpenDialog(win, {
              title: 'Open JSON File',
              defaultPath: '~/Documents',
              filters: [
                { name: 'JSON', extensions: ['json'] }
              ],
              properties: ['openFile']
            },
            function(filepath) {
              loader.loadJSON(win, filepath);
            });
          } 
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { 
          label: 'Readme', 
          accelerator: 'Ctrl+H', 
          click: function() {} 
        }
      ]
    }
  ];
  return template;
}

export function initMenu(win) {
  let menu = Menu.buildFromTemplate(genTemplate(win));
  Menu.setApplicationMenu(menu);
}
