'use strict';

import React from 'react';
import {ColorPicker} from './ColorPicker';
import CanvasActions from '../actions/CanvasActions';

export class FigureEditor extends React.Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    mode: React.PropTypes.string.isRequired,
    modes: React.PropTypes.array.isRequired,
    label: React.PropTypes.string,
    stroke: React.PropTypes.object.isRequired,
    figureSize: React.PropTypes.object,
    onColorChange: React.PropTypes.func.isRequired
  }
  static defaultProps = {
    mode: 'Draw',
    modes: ['Draw', 'Edit']
  }
  render() {
    let lineStyle = {
      backgroundColor: 'rgba(' + this.props.stroke.color.r +
        ',' + this.props.stroke.color.g +
        ',' + this.props.stroke.color.b + 
        ',' + this.props.stroke.color.a + ')',
    };
    return (
      <div className='figure-editor'>
        <div className='figure-editor-main'>
          <div className='figure-label-editor'>
            <div className='ctrl-label'>Label Name</div>
            <input name='figure-label' placeholder='label' 
              type='text'
              value={this.props.label ? this.props.label : ''}
              onChange={this._onChangeLabel} />
          </div>
          <div className='figure-color-editor'>
            <ColorPicker width={500} height={500} 
              color={this.props.stroke.color}
              onChange={this.props.onColorChange} />
          </div>
          <div className='figure-line-width-editor'>
            <div className='ctrl-label'>Line Width</div>
            <input name='line-width' 
              type='number' 
              max='10.0' 
              min='0.5' 
              step='0.5' 
              value={this.props.stroke.lineWidth}
              onChange={this._onChangeLineWidth} />
          </div>
          <div className='figure-pos-viewer'>
            <div className='ctrl-label'>Figure Info</div>
            <div className='figure-pos-viewer-main'>
              <div className='figure-pos-value'>
                <div className='sub-ctrl-label'>Left</div>
                <div>
                  {this.props.figureSize ? 
                    this.props.figureSize.left.toFixed(0) : '-'}
                </div>
              </div>
              <div className='figure-pos-value'>
                <div className='sub-ctrl-label'>Top</div>
                <div>
                  {this.props.figureSize ? 
                    this.props.figureSize.top.toFixed(0) : '-'}
                </div>
              </div>
              <div className='figure-pos-value'>
                <div className='sub-ctrl-label'>Width</div>
                <div>
                  {this.props.figureSize ? 
                    this.props.figureSize.width.toFixed(0) : '-'}
                </div>
              </div>
              <div className='figure-pos-value'>
                <div className='sub-ctrl-label'>Height</div>
                <div>
                 {this.props.figureSize ? 
                   this.props.figureSize.height.toFixed(0) : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  _onChangeLabel = (e) => {
    CanvasActions.changeLabel({ label: e.target.value });
  }
  _onChangeLineWidth= (e) => {
    CanvasActions.changeLineWidth({ lineWidth: +e.target.value });
  }
}
