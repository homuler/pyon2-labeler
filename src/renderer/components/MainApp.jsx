'use strict';

import {VirtualCanvas} from '../canvas/canvas-bag';
import React from 'react';
import {CanvasActions} from '../actions/CanvasActions';
import {CanvasController} from './CanvasController';
import {OutputViewer} from './OutputViewer';
import {canvasAppStore} from '../stores/CanvasAppStore';

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
      if (this.state.canvas == null) {
         canvasAppStore.setCanvasBag(new VirtualCanvas('pict-canvas'));
      }
      canvasAppStore.addChangeListener(this._onChange);
   }
   componentWillUnmount() {
      canvasAppStore.removeChangeListener(this._onChange);
   }
   render() {
      console.log('main render');
      var firstRender = this.state.canvas == null,
          defaultFigure = {
             type: 'rect',
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
               mode={this.state.controller.mode}
               format={this.state.controller.format} 
               figure={firstRender ? defaultFigure : this.state.canvas.state.currentFigure} 
               guidewire={firstRender ? true : this.state.canvas.settings.guide.on}
               figureAspectFix={firstRender ? false : this.state.canvas.settings.aspect.fix}
               figureAspectRatio={firstRender ? null : this.state.canvas.settings.aspect.ratio} />
            <canvas id='pict-canvas' width='1120' height='630'></canvas>
            <OutputViewer format={this.state.controller.format} />
         </div>
      );
   }
   _onChange = (e) => {
      this.setState(getCanvasState()); 
      console.log('change', this.state);
   }
}
