'use strict';

import {CanvasAppDispatcher} from '../dispatcher/CanvasAppDispatcher';
import {CanvasAppConstants} from '../constants/CanvasAppConstants';

export class CanvasActions {
   static toggleGuideWire() {
      console.log('called toggleGuideWire action');
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.TOGGLE_GUIDEWIRE
      });
   }
   static redoDrawing() {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.REDO_DRAWING
      });
   }
   static switchAspectFixMode() {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.SWITCH_ASPECT_FIX_MODE
      });
   }
   static changeAspectRatio(obj) {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.CHANGE_ASPECT_RATIO,
         value: obj
      });
   }
   static changeColor(obj) {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.CHANGE_FIGURE_COLOR,
         value: obj
      });
   }
   static changeLineWidth(obj) {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.CHANGE_LINE_WIDTH,
         value: obj
      });
   }
   static switchCanvasMode(obj) {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.SWITCH_CANVAS_MODE,
         value: obj
      });
   }
   static changeFileFormat(obj) {
      CanvasAppDispatcher.dispatch({
         actionType: CanvasAppConstants.CHANGE_FILE_FORMAT,
         value: obj
      });
   }
}
