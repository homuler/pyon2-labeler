'use strict';

import React from 'react';
import {CanvasAction} from '../actions/CanvasActions';

export class OutputViewer extends React.Component {
   constructor(props) {
      super(props);
   }
   static propTypes = {
      format: React.PropTypes.string.isRequired
   }
   static defaultProps = {
      format: 'json'
   }
   render() {
      return (
         <div className='output-viewer'>
            <div className='output-viewer-header'>
               Viewer
            </div>
            <input type='text' defaultValue='output' />
         </div>
      );
   }
}
