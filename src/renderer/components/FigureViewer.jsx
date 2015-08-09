'use strict';

import React from 'react';
import {CanvasActions} from '../actions/CanvasActions';

export class FigureViewer extends React.Component {
   constructor(props) {
      super(props);
   }
   static propTypes = {
      mode: React.PropTypes.string.isRequired,
      modes: React.PropTypes.array.isRequired,
      stroke: React.PropTypes.object.isRequired,
      aspectFix: React.PropTypes.bool.isRequired,
      aspectRatio: React.PropTypes.object
   }
   static defaultProps = {
      mode: 'Draw',
      modes: ['Draw', 'Edit']
   }
   renderModeSelector() {
      let options = this.props.modes.map((f, i) => {
         return (
            <option value={f} key={'canvas-mode-' + i}>{f}</option>
         );
      });
      return (
         <div className='canvas-mode-ctrl'>
            <select className='canvas-mode-selector' 
               defaultvalue={this.props.mode}
               onChange={this._onSwitchCanvasMode}>
               {options}
            </select>
         </div>
      );
   }
   render() {
      return (
         <div className='figure-ctrl'>
            <div className='figure-ctrl-header'>
               <span>Mode Select</span>
               {this.renderModeSelector()}
               Draw Controller
            </div>
            <div className='figure-ctrl-main'>
               <div className='figure-label-ctrl'>
                  <input name='figure-label' placeholder='label' 
                     onChange={this._onChangeLabel} />
               </div>
               <div className='figure-color-ctrl'>
                  <span>Color</span>
                  <div className='figure-color-r-ctrl'>
                     <label htmlFor='r-color'>Red</label>
                     <input name='r-color' 
                        type='number' 
                        max='255' 
                        min='0' 
                        value={this.props.stroke.color.r} 
                        onChange={this._onChangeColor} />
                  </div>
                  <div className='figure-color-g-ctrl'>
                     <label htmlFor='g-color'>Green</label>
                     <input name='g-color' 
                        type='number' 
                        max='255' 
                        min='0' 
                        value={this.props.stroke.color.g} 
                        onChange={this._onChangeColor} />
                  </div>
                  <div className='figure-color-b-ctrl'>
                     <label htmlFor='b-color'>Blue</label>
                     <input name='b-color' 
                        type='number' 
                        max='255' 
                        min='0' 
                        value={this.props.stroke.color.b} 
                        onChange={this._onChangeColor} />
                  </div>
                  <div className='figure-color-a-ctrl'>
                     <label htmlFor='a-color'>Alpha</label>
                     <input name='a-color' 
                        type='number' 
                        max='1.0' 
                        min='0.0' 
                        step='0.05' 
                        value={this.props.stroke.color.a} 
                        onChange={this._onChangeColor} />
                  </div>
               </div>
               <div className='figure-line-width-ctrl'>
                  <label htmlFor='line-width'>Line Width</label>
                  <input name='line-width' 
                     type='number' 
                     max='10.0' 
                     min='0.5' 
                     step='0.5' 
                     value={this.props.stroke.lineWidth}
                     onChange={this._onChangeLineWidth} />
               </div>
               <div className='figure-aspect-ctrl'>
                  <label htmlFor='aspect-fix-check'>Aspect Ratio Fix</label>
                  <input name='aspect-fix-check' 
                     type='checkbox' 
                     checked={this.props.aspectFix} 
                     onChange={this._onSwitchAspectFixMode} />
                  {this.props.aspectFix ?
                     (
                        <div>
                           <span>Aspect Ratio</span>
                           <div>
                              <input name='aspect-x' 
                                 type='number' 
                                 defaultValue={this.props.aspectRatio.x} 
                                 onChange={this._onChangeAspectRatio}/>
                              :
                              <input name='aspect-y' 
                                 type='number' 
                                 defaultValue={this.props.aspectRatio.y} 
                                 onChange={this._onChangeAspectRatio} />
                           </div>
                        </div>
                     ) : []
                  }
               </div>
            </div>
         </div>
      );
   }
   _onSwitchCanvasMode = (e) => {
      CanvasActions.switchCanvasMode({ mode: e.target.value });
   }
   _onChangeLabel = (e) => {
      CanvasActions.changeLabel({ label: e.target.value });
   }
   _onChangeColor = (e) => {
      var obj = {
         r: this.props.stroke.color.r,
         g: this.props.stroke.color.g,
         b: this.props.stroke.color.b,
         a: this.props.stroke.color.a
      };
      switch (e.target.name) {
         case 'r-color': 
            obj.r = +e.target.value;
            break;
         case 'g-color': 
            obj.g = +e.target.value;
            break;
         case 'b-color': 
            obj.b = +e.target.value;
            break;
         case 'a-color': 
            obj.a = +e.target.value;
            break;
         default: 
            break;
      }
      CanvasActions.changeFigureColor(obj);
   }
   _onChangeLineWidth= (e) => {
      CanvasActions.changeLineWidth({ lineWidth: +e.target.value });
   }
   _onSwitchAspectFixMode = (e) => {
      if (e.type === 'click') {
         CanvasActions.switchAspectFixMode();
      } 
   }
   _onChangeAspectRatio = (e) => {
      var obj = null;
      if (e.type === 'input') {
         switch (e.target.name) {
            case 'aspect-x': 
               obj = { 
                  x: +e.target.value,
                  y: this.props.aspectRatio.y 
               };
               break;
            case 'aspect-y': 
               obj = { 
                  x: this.props.aspectRatio.x,
                  y: +e.target.value 
               };
               break;
            default: 
               break;
         }
         CanvasActions.changeAspectRatio(obj);
      }
   }
}
