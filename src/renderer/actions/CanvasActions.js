'use strict';

import {CanvasAppDispatcher} from '../dispatcher/CanvasAppDispatcher';
import {CanvasAppConstants} from '../constants/CanvasAppConstants';

class CanvasActions {
  static initializeCanvas(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.INITIALIZE_CANVAS,
      value: obj
    });
  }

  static resetCanvas(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.RESET_CANVAS,
      value: obj
    });
  }

  static selectCanvasImage(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.SELECT_CANVAS_IMAGE,
      value: obj
    });
  }

  static shouldUpdateCanvas(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.SHOULD_UPDATE_CANVAS,
      value: obj
    });
  }

  static loadImage(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.LOAD_IMAGE,
      value: obj
    });
  }

  static toggleGuideWire() {
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
  static changeFigureColor(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.CHANGE_FIGURE_COLOR,
      value: obj
    });
  }

  static colorPickerChange(e, obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.COLOR_PICKER_CHANGE,
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
  static changeLabel(obj) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.CHANGE_LABEL,
      value: obj
    });
  }

  static deleteFigure() {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.DELETE_FIGURE
    });
  }

  static moveImgListRight() {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.MOVE_IMGLIST_RIGHT
    });
  }

  static moveImgListLeft() {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.MOVE_IMGLIST_LEFT
    });
  }

  static mouseDownOnCanvas(event) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.MOUSE_DOWN_ON_CANVAS,
      value: event
    });
  }

  static mouseMoveOnCanvas(event) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.MOUSE_MOVE_ON_CANVAS,
      value: event
    });
  }

  static mouseUpOnCanvas(event) {
    CanvasAppDispatcher.dispatch({
      actionType: CanvasAppConstants.MOUSE_UP_ON_CANVAS,
      value: event
    });
  }
}

module.exports = CanvasActions;
