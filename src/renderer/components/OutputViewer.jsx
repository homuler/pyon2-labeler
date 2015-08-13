'use strict';

import React from 'react';
import {CanvasAction} from '../actions/CanvasActions';
import remote from 'remote';
var BrowserWindow = remote.require('browser-window'),
    dialog = remote.require('dialog'),
    fs = remote.require('fs');

export class OutputViewer extends React.Component {
   constructor(props) {
      super(props);
   }
   static propTypes = {
      format: React.PropTypes.string.isRequired,
      figures: React.PropTypes.array.isRequired,
      imgPath: React.PropTypes.string
   }
   static defaultProps = {
      format: 'json'
   }

   toXML(figure) {
      var json = this.toJSON(figure);
      return '<object>' + 
         '<name>' + json.label + '</name>' +
         '<bndbox>' +
         '<xmin>' + json.bndbox.xmin + '</xmin>' +
         '<xmax>' + json.bndbox.xmax + '</xmax>' +
         '<ymin>' + json.bndbox.ymin + '</ymin>' +
         '<ymax>' + json.bndbox.ymax + '</ymax>' +
         '</bndbox>' +
         '</object>';
   }

   toJSON(figure) {
      return {
         label: figure.label,
         boundingBox: {
            xmin: +figure.left.toFixed(0),
            xmax: +figure.left.toFixed(0) + (+figure.width.toFixed(0)),
            ymin: +figure.top.toFixed(0),
            ymax: +figure.top.toFixed(0) + (+figure.height.toFixed(0))
         }
      };
   }

   genJSONData() {
      return {
         objects: this.props.figures.map((f) => this.toJSON(f)),
         filepath: this.props.imgPath
      };
   }

   genXMLData() {
      var objects = this.props.figures.map((f) => this.toXML(f))
                     .reduce((acc, d) => { return acc + d; });
         
      return '<annotation>' +
         '<filename>' + this.props.imgPath + '</filename>' + 
         objects + 
         '</annotation>';
   }

   genData() {
      switch(this.props.format) {
         case 'json': 
            return JSON.stringify(this.genJSONData());
         case 'xml':
            return this.genXMLData();
         default:
            return JSON.stringify(this.genJSONData());
      }
   }

   render() {
      return (
         <div className='output-viewer'>
            <div className='output-viewer-header'>
               Viewer
            </div>
            <textarea
               value={this.genData()} 
               wrap='soft' 
               readOnly />
            <button onClick={this._onClickSave}>Save</button>
         </div>
      );
   }

   _onClickSave = (e) => {
      dialog.showSaveDialog(BrowserWindow.getFocusedWindow(),
            {},
            (filename) => {
               fs.writeFile(filename, this.genData());
            });      
   }
}
