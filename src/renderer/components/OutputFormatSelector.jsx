'use strict';

import React from 'react';
import {CanvasActions} from '../actions/CanvasActions';

export class OutputFormatSelector extends React.Component {
   constructor(props) {
      super(props);
   }
   static propTypes = {
      format: React.PropTypes.string.isRequired,
      formats: React.PropTypes.array
   }
   static defaultProps = {
      format: 'json',
      formats: ['json', 'xml', 'txt']
   }
   render() {
      console.log('OutputFormatSelector render');
      let options = this.props.formats.map((f, i) => {
         return (
            <option value={f} key={'format-' + i}>{f}</option>
         );
      });
      return (
         <div className='output-format-ctrl'>
            <span>Output Format</span>
            <select className='output-format-select' 
               defaultValue={this.props.format} 
               onChange={this._onChangeFileFormat}>
               {options}
            </select>
         </div>
      );
   }
   _onChangeFileFormat = (e) => {
      CanvasActions.changeFileFormat({ format: e.target.value });
   }
}
