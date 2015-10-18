'use strict';

import React from 'react';
import CanvasAction from '../actions/CanvasActions';
import remote from 'remote';
let BrowserWindow = remote.require('browser-window'),
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

  getFilePath(url) {
    if (url === null || url === undefined) {
      return null;
    }
    return url.substring(url.indexOf('://') + 3);
  }

  toXML(figure) {
    let json = this.toJSON(figure);
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
      },
      color: figure.color,
      lineWidth: figure.lineWidth
    };
  }

  genJSONData() {
    return {
      objects: this.props.figures.map((f) => this.toJSON(f)),
      filepath: this.getFilePath(this.props.imgPath)
    };
  }

  genXMLData() {
    let objects = this.props.figures.map((f) => this.toXML(f))
                    .reduce((acc, d) => { return acc + d; });
         
    return '<annotation>' +
      '<filename>' + this.getFilePath(this.props.imgPath) + '</filename>' + 
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
        <div className='btn-group'>
          <button className='save-op'
            onClick={this._onClickSave}>Save</button>
          <button className='append-op'
            onClick={this._onClickAppend}>Append</button>
        </div>
      </div>
    );
  }

  _onClickSave = (e) => {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(),
      {}, 
      (filepath) => {
        try {
          switch (this.props.format) {
            case 'json': 
              this.writeJSON(filepath);
              break;
            case 'xml':
              this.writeXML(filepath);
              break;
            default:
              break;
          }
        } catch (e) {

        }
      });
  }

  _onClickAppend = (e) => {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(),
      {
        filters:
          [
            { name: 'Label Data', extensions: ['json', 'xml', 'txt'] }
          ]
      },
      (filepath) => {
        try {
          switch (this.props.format) {
            case 'json': 
              this.appendJSON(filepath);
              break;
            case 'xml':
              this.appendXML(filepath);
              break;
            default:
              break;
          }
        } catch (e) {
          console.log(e);
        }
      });
  }

  writeJSON(filepath) {
    fs.writeFile(filepath, "[" + this.genData() + "]");
  }

  appendJSON(filepath) {
    let labelData = this.genJSONData(),
        labelList = JSON.parse(fs.readFileSync(filepath)),
        newLabelList = [labelData];
          
    labelList.forEach((json) => {
      if (json.filepath && json.filepath !== labelData.filepath) {
        newLabelList.push(json);
      } 
    }, []);

    fs.writeFile(filepath, JSON.stringify(newLabelList));
  }
}
