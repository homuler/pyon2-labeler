'use strict';

import React from 'react';
import {CanvasPalette} from '../canvas/palette';
import {CanvasActions} from '../actions/CanvasActions';

export class ColorPicker extends React.Component {
   constructor(props) {
      super(props);
   }

   static propTypes = {
      color: React.PropTypes.object.isRequired,
      onChange: React.PropTypes.func.isRequired
   }

   static defaultProps = {
      color: {
         h: 0,
         s: 100,
         l: 50,
         a: 1.0
      }
   }

   componentDidMount() {
      this.palette = 
         new CanvasPalette(React.findDOMNode(this.refs.colorPicker), this.props.color);
   }

   render() {
      return (
         <div className='color-picker'>
            <div className='color-viewer'>
               <div className='ctrl-label'>Color</div>
               <div>
                  <div className='sub-ctrl-label'>Hue</div>
                  <div className='color-viewer-hue'>{this.props.color.h}</div>
               </div>
               <div>
                  <div className='sub-ctrl-label'>Saturation</div>
                  <div className='color-viewer-saturation'>{this.props.color.s}%</div>
               </div>
               <div>
                  <div className='sub-ctrl-label'>Lightness</div>
                  <div className='color-viewer-lightness'>{this.props.color.l}%</div>
               </div>
               <div>
                  <div className='sub-ctrl-label'>Alpha</div>
                  <div className='color-viewer-alpha'>{this.props.color.a}</div>
               </div>
            </div>
            <div className='color-picker-main'>
               <canvas 
                  ref='colorPicker'
                  width={this.props.width} 
                  height={this.props.height}
                  onClick={this._onCanvasClick}></canvas>
               <div className='color-la-ctrl'>
                  <div className='color-l-ctrl'>
                     <div className='sub-ctrl-label'>
                        Lightness
                     </div>
                     <input type='range' min='0' max='100' step='1' 
                        value={this.props.color.l}
                        onChange={this._onLightnessChange} />
                  </div>
                  <div className='color-a-ctrl'>
                     <div className='sub-ctrl-label'>
                        Alpha
                     </div>
                     <input type='range' min='0' max='1' step='0.1' 
                        value={this.props.color.a}
                        onChange={this._onAlphaChange} />
                  </div>
               </div>
            </div>
         </div>
            );
   }

   _onCanvasClick = (e) => {
      this.palette.selectColor(e);
      this.props.onChange(e, this.palette.getSelectedColor());
   }

   _onLightnessChange = (e) => {
      this.palette.selected.color.l = e.target.value;
      this.palette.drawHSLCircle(
            this.palette.selected.color.l, this.palette.selected.color.a);
      this.palette.saveDrawingSurface();
      this.palette.drawSelectPoint();
      this.props.onChange(e, this.palette.getSelectedColor());
   }

   _onAlphaChange = (e) => {
      this.palette.selected.color.a = e.target.value;
      this.palette.drawHSLCircle(
            this.palette.selected.color.l, this.palette.selected.color.a);
      this.palette.saveDrawingSurface();
      this.palette.drawSelectPoint();
      this.props.onChange(e, this.palette.getSelectedColor());
   }
}

