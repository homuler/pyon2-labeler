'use strict';

import React from 'react';
import {VirtualCanvas} from '../canvas/canvas-bag';
import {CanvasActions} from '../actions/CanvasActions';

export class Canvas extends React.Component {
   constructor(props) {
      super(props);
   }

   static propTypes() {
      focusedFigure: React.PropTypes.object
   }

   componentDidMount() {
      var canvas = React.findDOMNode(this.refs.mainCanvas),
          virtualCanvas = new VirtualCanvas(canvas, CanvasActions);
      CanvasActions.initializeCanvas(virtualCanvas);
   }

   componentWillUnmount() {

   }
   render() {
      return (
         <div className='canvas-container'>
            <canvas ref='mainCanvas' width={1120} height={630}>
               Hello Canvas
            </canvas>
         </div>
         );
   }
}
