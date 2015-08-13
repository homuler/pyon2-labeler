'use strict';

import {VirtualCanvas} from '../canvas/canvas-bag';
import React from 'react';
import {CanvasActions} from '../actions/CanvasActions';
import {CanvasController} from './CanvasController';
import {FigureEditor} from './FigureEditor';
import {OutputViewer} from './OutputViewer';
import {canvasAppStore} from '../stores/CanvasAppStore';
import {Canvas} from './Canvas';

function getCanvasState() {
   return canvasAppStore.getCanvasState();
}

export class MainApp extends React.Component {
   constructor(props) {
      super(props);
   }
   static propTypes = {
      message: React.PropTypes.string,
   }
   static defaultProps = {
      message: 'Hello, Electron!',
   }
   state = getCanvasState()
   componentDidMount() {
      canvasAppStore.addChangeListener(this._onChange);
   }
   componentWillUnmount() {
      canvasAppStore.removeChangeListener(this._onChange);
   }
   render() {
      console.log('main render');
      var firstRender = this.state.canvas == null,
          defaultStroke = {
             color: {
                r: 230,
                g: 20,
                b: 30,
                a: 1.0
             },
             lineWidth: 2.0
          };
      return (
         <div className='container'>
            <div className='main'>
               <h1>{this.state.message}</h1>
            </div>
            <CanvasController 
               mode={firstRender ? 'Draw' : this.state.canvas.state.mode}
               format={this.state.controller.format} 
               guidewire={firstRender ? true : this.state.canvas.settings.guide.on}
               aspectFix={firstRender ? false : this.state.canvas.settings.aspect.fix}
               aspectRatio={firstRender ? null : this.state.canvas.settings.aspect.ratio} />
            <div className='canvas-editor'>
               <div className='canvas-state-viewer'>
                  <FigureEditor
                     label={firstRender || !this.state.canvas.state.currentFigure.figure ? '' 
                        : this.state.canvas.state.currentFigure.figure.label}
                     figureSize={firstRender ? null 
                        : this.state.canvas.getRealFigureSize()} 
                     stroke={firstRender ? defaultStroke : 
                        this.state.canvas.settings.stroke} />
                  <OutputViewer format={this.state.controller.format} 
                     figures={firstRender || !this.state.canvas.state.figures
                        ? []
                        : this.state.canvas.state.figures}
                     imgPath={firstRender || !this.state.canvas.state.backgroundImage 
                        ? null 
                        : this.state.canvas.state.backgroundImage.src} />
               </div>
               <Canvas />
            </div>
         </div>
      );
   }
   _onChange = (e) => {
      this.setState(getCanvasState()); 
      console.log('change', this.state);
   }
}
