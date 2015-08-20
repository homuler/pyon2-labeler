'use strict';

import React from 'react';
import CanvasActions from '../actions/CanvasActions';

class JSONListViewer extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    imgList: React.PropTypes.array,
    figureIdx: React.PropTypes.number
  }

  render() {
    if (!this.props.imgList) {
      return null;
    }
    let idx = this.props.figureIdx,
        imgDivList = [idx-2, idx-1, idx, idx+1, idx+2].map((i) => {
          let img = this.props.imgList[i] ?
                      (<img src={this.props.imgList[i].filepath} />) :
                      (<img className={'placeholder'}/>);
          return (
            <div key={'screenshot-' + i} 
              className='screenshot'
              onClick={this.genClickImageListener(i)}>
              {img}
            </div>
          );
        });
    return (
      <div className='img-selector'>
        <div className='img-info'>
          <span>{this.props.figureIdx + 1}</span>
          <span> / </span>
          <span>{this.props.imgList ? this.props.imgList.length : 0}</span>
        </div>
        <div className='img-list'>
          {imgDivList}
        </div>
      </div>
    );
  }

  genClickImageListener(idx) {
     return (e) => {
       let jsonData = this.props.imgList[idx];
       if (jsonData !== undefined) {
         CanvasActions.selectCanvasImage({
           figureIdx: idx
         });
         console.log('reset canvas');
         CanvasActions.resetCanvas({
           imgPath: jsonData.filepath,
           figureInfo: jsonData.objects
         });
       }
     }
  }

  _onClickInc = (e) => {
    if (this.props.imgList[this.props.figureIdx + 1]) {
      CanvasActions.moveImgListRight();
    }
  }

  _onClickDec = (e) => {
    if (this.props.imgList[this.props.figureIdx - 1]) {
      CanvasActions.moveImgListLeft();
    }
  }
}

module.exports = JSONListViewer
