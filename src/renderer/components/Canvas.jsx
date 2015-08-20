'use strict';

import React from 'react';
import {VirtualCanvas} from '../canvas/canvas-bag';
import {CanvasActions} from '../actions/CanvasActions';

export class Canvas extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProp = {
    imgPath: null,
    figureInfo: null
  }

  static propTypes = {
    imgPath: React.PropTypes.string,
    figureInfo: React.PropTypes.array
  }

  componentDidMount() {
    let canvas = React.findDOMNode(this.refs.mainCanvas),
        virtualCanvas = new VirtualCanvas(canvas, CanvasActions, 
                this.props.imgPath, this.props.figureInfo);
    CanvasActions.initializeCanvas(virtualCanvas);
  }

  componentWillUnmount() {

  }
  render() {
    return (
      <div className='canvas-container'>
        <canvas ref='mainCanvas' width={1120} height={630}
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}>
          Hello Canvas
        </canvas>
      </div>
    );
  }

  onDragOver = (e) => {
    e.preventDefault();
  }
   
  onDragLeave = (e) => {
    e.preventDefault();
  }

  onDragEnd = (e) => {
    e.preventDefault();
  }

  onDrop = (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      CanvasActions.loadImage({ path: e.dataTransfer.files[0].path });
    }
  }

  onMouseDown = (e) => {
    CanvasActions.mouseDownOnCanvas(e);
  }

  onMouseMove = (e) => {
    CanvasActions.mouseMoveOnCanvas(e);
  }

  onMouseUp = (e) => {
    CanvasActions.mouseUpOnCanvas(e);
  }
}
