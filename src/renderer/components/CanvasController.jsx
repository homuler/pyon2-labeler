'use strict';

import React from 'react';
import CanvasActions from '../actions/CanvasActions';
import {OutputFormatSelector} from './OutputFormatSelector';
import JSONListViewer from './JSONListViewer';

export class CanvasController extends React.Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    mode: 'Draw',
    modes: ['Draw', 'Edit']
  }

  static propTypes = {
    mode: React.PropTypes.string.isRequired,
    format: React.PropTypes.string.isRequired,
    guidewire: React.PropTypes.bool.isRequired,
    aspectFix: React.PropTypes.bool.isRequired,
    aspectRatio: React.PropTypes.object,
    imgList: React.PropTypes.array,
    figureIdx: React.PropTypes.number
  }

  renderModeSelector() {
    let options = this.props.modes.map((f, i) => {
      return (
        <option value={f} key={'canvas-mode-' + i}>{f}</option>
      );
    });
    return (
      <select className='canvas-mode-selector'
        defaultvalue={this.props.mode}
        onChange={this._onSwitchCanvasMode}>
        {options}
      </select>
    );
  }

  renderGuidewireCheck() {
    return (
      <div className='guidewire-ctrl'>
        <input className='guidewire-check' 
          type='checkbox' 
          name='guidewire-check'
          id='guidewire-check'
          onChange={this._onToggleGuideWire} 
          checked={this.props.guidewire} />
        <label htmlFor='guidewire-check' className='check-label'>Guidewire</label>
      </div>
    );
  }

  render() {
    return (
      <div className='canvas-controller'>
        <div className='controller-main'>
          <div className='canvas-mode-ctrl'>
             <div className='ctrl-label'>Canvas Mode</div>
             {this.renderModeSelector()}
          </div>
          <div className='canvas-misc-ctrl'>
            {this.renderGuidewireCheck()}
            <OutputFormatSelector format={this.props.format} />
            <div className='figure-aspect-ctrl'>
              <input name='aspect-fix-check'
                id='aspect-fix-check'
                type='checkbox'
                checked={this.props.aspectFix}
                onChange={this._onSwitchAspectFixMode} />
              <label className='check-label' htmlFor='aspect-fix-check'>Fix Aspect</label>
            </div>
            {this.props.aspectFix ?
              (
                <div className='figure-aspect-ratio-ctrl'>
                  <div className='ctrl-label'>Ratio</div>
                  <div className='figure-aspect-value'>
                    <input name='aspect-x'
                      type='number'
                      defaultValue={this.props.aspectRatio.x}
                      onChange={this._onChangeAspectRatio} />
                    <span>:</span>
                    <input name='aspect-y'
                      type='number'
                      defaultValue={this.props.aspectRatio.y}
                      onChange={this._onChangeAspectRatio} />
                  </div>
                </div>
               ) : []
             }
          </div>
          <div className='operation-ctrl'>
            <div className='ctrl-label'>Operation</div>
            <div className='btn-group'>
              <button className='reset-op' 
                onClick={this._onClickReset}>
                <span>Reset</span>
              </button>
              <button className='delete-op'
                onClick={this._onClickDelete}>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
        <div className='controller-sub-menu'>
          <JSONListViewer imgList={this.props.imgList} 
            figureIdx={this.props.figureIdx} />
        </div>
      </div>
    );
  }

  _onSwitchCanvasMode = (e) => {
    CanvasActions.switchCanvasMode({ mode: e.target.value });
  }

  _onSwitchAspectFixMode = (e) => {
    if (e.type === 'click') {
      CanvasActions.switchAspectFixMode();
    }
  }

  _onChangeAspectRatio = (e) => {
    let obj = null;
    if (e.type === 'click') {
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

  _onToggleGuideWire = (e) => {
    if (e.type === 'click') {
      CanvasActions.toggleGuideWire();
    }
  }

  _onFigureChange = (e, obj) => {
    this.props.onChange(e, obj);
  }

  _onClickReset = (e) => {
    CanvasActions.resetCanvas();
  }

  _onClickDelete = (e) => {
    CanvasActions.deleteFigure();
  }
}

