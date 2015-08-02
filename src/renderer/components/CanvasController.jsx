'use strict';

import React from 'react';
import {CanvasActions} from '../actions/CanvasActions';
import {FigureController} from './FigureController';
import {OutputFormatSelector} from './OutputFormatSelector';

export class CanvasController extends React.Component {
   constructor(props) {
      super(props);
   }
   static propTypes = {
      format: React.PropTypes.string.isRequired,
      figure: React.PropTypes.object.isRequired,
      figureAspectFix: React.PropTypes.bool.isRequired,
      figureAspectRatio: React.PropTypes.object,
      guidewire: React.PropTypes.bool.isRequired,
   }
   componentWillUpdate(nextProps, nextState) {

   }
   renderGuidewireCheck() {
      return (
         <div className='guidewire-ctrl'>
            <span>Guidewire</span>
            <input className='guidewire-check' 
               type='checkbox' 
               name='guidewire-check'
               onChange={this._onToggleGuideWire} 
               checked={this.props.guidewire} />
          </div>
       );
   }
   render() {
      return (
         <div className='canvas-controller'>
            <div className='controller-main'>
               <FigureController 
                  mode={this.props.mode}
                  figure={this.props.figure} 
                  aspectFix={this.props.figureAspectFix} 
                  aspectRatio={this.props.figureAspectRatio} />
               <div className='option-ctrl'>
                  {this.renderGuidewireCheck()}
                  <OutputFormatSelector format={this.props.format} />
               </div>
               <div className='operation-ctrl'>
                  <div className='eraser-op'>
                     <input type='button' value='Erase All' />
                  </div>
                  <div className='save-op'>
                     <input type='button' value='Save Label' />
                  </div>
                  <div className='back-op'>
                     <input type='button' 
                        value='Back' onClick={this._onClickBackButton} />
                  </div>
               </div>
            </div>
         </div>
      );
   }
   _onToggleGuideWire = (e) => {
      if (e.type === 'click') {
         CanvasActions.toggleGuideWire();
      }
   }
   _onFigureChange = (e, obj) => {
      this.props.onChange(e, obj);
   }
   _onClickBackButton = (e) => {
      CanvasActions.redoDrawing();
   }
}

