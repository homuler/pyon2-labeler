'use strict';

import {VirtualCanvas} from '../canvas/canvas-bag';
import React from 'react';
import CanvasActions from '../actions/CanvasActions';
import {CanvasController} from './CanvasController';
import {FigureEditor} from './FigureEditor';
import {OutputViewer} from './OutputViewer';
import {JSONListViewer} from './JSONListViewer';
import {canvasAppStore} from '../stores/CanvasAppStore';
import {Canvas} from './Canvas';

function getCanvasState() {
  return canvasAppStore.getCanvasState();
}

export class MainApp extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProp = {
    imgPath: null,
    figureInfo: null,
    figureIdx: null,
    imgList: null
  }

  static propTypes = {
    imgPath: React.PropTypes.string,
    figureInfo: React.PropTypes.array,
    figureIdx: React.PropTypes.number,
    imgList: React.PropTypes.array
  }

  state = getCanvasState()

  componentWillMount() {
    CanvasActions.selectCanvasImage({
      figureIdx: this.props.figureIdx,
      figureInfo: this.props.figureInfo
    });
  }

  componentDidMount() {
    canvasAppStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    canvasAppStore.removeChangeListener(this._onChange);
  }

  render() {
    let firstRender = this.state.canvas == null,
        defaultStroke = {
          color: {
            h: 0,
            s: 100,
            l: 50,
            a: 1.0
          },
          lineWidth: 2.0
        };
    return (
      <div className='container'>
        <div className='title-header'>
          <h1>Pyon2 Labeler</h1>
          <h2>-Labeling Tool for Machine Learning-</h2>
        </div>
        <CanvasController 
          mode={firstRender ? 'Draw' : this.state.canvas.state.mode}
          format={this.state.controller.format} 
          guidewire={firstRender ? true : this.state.canvas.settings.guide.on}
          aspectFix={firstRender ? false : this.state.canvas.settings.aspect.fix}
          aspectRatio={firstRender ? null : this.state.canvas.settings.aspect.ratio} 
          imgList={this.props.imgList}
          figureIdx={this.state.savedFigure.figureIdx} />
        <div className='canvas-editor'>
          <div className='canvas-state-viewer'>
            <FigureEditor
              label={firstRender || !this.state.canvas.state.currentFigure.figure ? '' 
                     : this.state.canvas.state.currentFigure.figure.label}
              figureSize={firstRender ? null 
                          : this.state.canvas.getRealFigureSize()} 
              stroke={firstRender ? defaultStroke : 
                       this.state.canvas.settings.stroke} 
              onColorChange={CanvasActions.colorPickerChange} />
            <OutputViewer format={this.state.controller.format} 
              figures={firstRender || !this.state.canvas.state.figures
                   ? []
                   : this.state.canvas.state.figures.map((f) => {
                     let realSize = this.state.canvas.toRealSize(f);

                     return Object.assign(realSize, {
                       color: f.color,
                       lineWidth: f.lineWidth,
                       label: f.label
                     });
                   })}
              imgPath={firstRender || !this.state.canvas.state.backgroundImage 
                   ? null 
                   : this.state.canvas.state.backgroundImage.src} />
          </div>
          <Canvas imgPath={this.props.imgPath}
            figureInfo={this.state.savedFigure.figureInfo ||
              this.props.figureInfo} />
        </div>
      </div>
    );
  }

  _onChange = (e) => {
    this.setState(getCanvasState()); 
  }
}
