'use strict';

import {CanvasAppDispatcher} from '../dispatcher/CanvasAppDispatcher';
import EventEmitter from 'events';
import {CanvasAppConstants} from '../constants/CanvasAppConstants';

const CHANGE_EVENT = 'change';

let _canvasBag = defaultCanvasBag();

function defaultCanvasBag() {
  return {
    controller: {
      format: 'json',
    },
    savedFigure: {
      figureInfo: null,
      figureIdx: -1
    },
    canvas: null
  };
}

function selectCanvasImage(obj) {
  if (obj.figureIdx !== undefined) {
    _canvasBag.savedFigure.figureIdx = obj.figureIdx;
  }
}

function resetCanvas(obj) {
  console.log('reset canvas', obj);
  if (obj) {
    _canvasBag.canvas.reset(obj.imgPath, obj.figureInfo);
  } else {
    _canvasBag.canvas.reset();
  }
}

function deleteFigure() {
  if (!_canvasBag.canvas === null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  _canvasBag.canvas.deleteCurrentFigure();
}

function switchCanvasMode(obj) {
  _canvasBag.canvas.state.mode = obj.mode;
  _canvasBag.canvas.redrawAll();
  switch(obj.mode) {
    case 'Draw': 
      break;
    case 'Edit':
      _canvasBag.canvas.focusOnAll();
      break;
    default:
      break;
  }
  _canvasBag.canvas.saveDrawingSurface();
  _canvasBag.canvas.drawVirtualSurface();
  _canvasBag.canvas.copyOffscreenToMain();
}

function toggleGuideWire() {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  console.log('called toggleGuideWire');
  _canvasBag.canvas.settings.guide.on = 
    !_canvasBag.canvas.settings.guide.on;
}

function loadImage(obj) {
  _canvasBag.canvas.setBackground(obj.path);
  _canvasBag.canvas.clearFigures();
}

function switchAspectFixMode() {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  _canvasBag.canvas.settings.aspect.fix = 
    !_canvasBag.canvas.settings.aspect.fix;
}

function changeAspectRatio(obj) {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  _canvasBag.canvas.settings.aspect.ratio = obj;
}

function changeLineWidth(obj) {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  _canvasBag.canvas.settings.stroke.lineWidth = obj.lineWidth;
  if (_canvasBag.canvas.state.currentFigure.figure) {
    _canvasBag.canvas.state.currentFigure.figure.lineWidth = obj.lineWidth;
  }
}

function changeLabel(obj) {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  if (_canvasBag.canvas.state.currentFigure.figure) {
    _canvasBag.canvas.state.currentFigure.figure.label = obj.label;
  }
  redrawCanvas();
}

function changeFileFormat(obj) {
  _canvasBag.controller.format = obj.format;
}

function mouseDownOnCanvas(event) {
  _canvasBag.canvas.onMouseDown(event);
}

function mouseMoveOnCanvas(event) {
  _canvasBag.canvas.onMouseMove(event);
}

function mouseUpOnCanvas(event) {
  _canvasBag.canvas.onMouseUp(event);
}

function redrawCanvas() {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
   
  _canvasBag.canvas.redrawAll();
  if (_canvasBag.canvas.state.mode === 'Edit') {
    if (_canvasBag.canvas.state.currentFigure.figure) {
      _canvasBag.canvas.state.currentFigure.figure.focus(_canvasBag.canvas.offscreenCtx);
    } else {
      _canvasBag.canvas.focusOnAll();
    }
  }
  _canvasBag.canvas.saveDrawingSurface();
  if (_canvasBag.canvas.hasVirtualSurface()) {
    _canvasBag.canvas.drawVirtualSurface();
  }
  _canvasBag.canvas.copyOffscreenToMain();
}

function colorPickerChange(color) {
  if (_canvasBag.canvas == null) {
    throw new Error('CanvasBag is not initialized yet.');
  }
  _canvasBag.canvas.settings.stroke.color = Object.assign({}, color);
  if (_canvasBag.canvas.state.currentFigure.figure) {
    console.log('current figure');
    _canvasBag.canvas.state.currentFigure.figure.color = Object.assign({}, color);
  }
  redrawCanvas();
}

function moveImglistRight() {
  _canvasBag.savedFigure.figureIdx++;
}

function moveImglistLeft() {
  _canvasBag.savedFigure.figureIdx--;
}

class CanvasAppStore extends EventEmitter {
  constructor() {
    super();
  }
  getCanvasState() {
    return _canvasBag;
  }
  setCanvasBag(canvas) {
    _canvasBag.canvas = canvas;
  }
  emitChange() {
    this.emit(CHANGE_EVENT);
  }
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}

export let canvasAppStore = new CanvasAppStore();

CanvasAppDispatcher.register((action) => {
  switch(action.actionType) {
    case CanvasAppConstants.INITIALIZE_CANVAS:
      canvasAppStore.setCanvasBag(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.RESET_CANVAS:
      if (action.value !== undefined && action.value !== null) {
        resetCanvas(action.value);
      } else {
        resetCanvas();
      }
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.SELECT_CANVAS_IMAGE:
      selectCanvasImage(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.LOAD_IMAGE:
      loadImage(action.value);
      break;

    case CanvasAppConstants.SWITCH_CANVAS_MODE:
      switchCanvasMode(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.CREATE_LABEL_FILE:
      break;
    case CanvasAppConstants.SAVE_LABEL_FILE:
      break;
    case CanvasAppConstants.CHANGE_FIGURE_COLOR:
      changeFigureColor(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.COLOR_PICKER_CHANGE:
      colorPickerChange(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.CHANGE_LINE_WIDTH:
      changeLineWidth(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.CHANGE_LABEL:
      changeLabel(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.TOGGLE_GUIDEWIRE:
      toggleGuideWire();
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.TOGGLE_GRID:
      break;

    case CanvasAppConstants.SWITCH_ASPECT_FIX_MODE:
      switchAspectFixMode();
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.CHANGE_ASPECT_RATIO:
      changeAspectRatio(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.CHANGE_FILE_FORMAT:
      changeFileFormat(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.REDO_DRAWING:
      redoDrawing();
      break;

    case CanvasAppConstants.ERASE_ALL:
      break;

    case CanvasAppConstants.DELETE_FIGURE:
      deleteFigure();
      break;
 
    case CanvasAppConstants.MOVE_IMGLIST_RIGHT:
      moveImglistRight();
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.MOVE_IMGLIST_LEFT:
      moveImglistLeft();
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.MOUSE_DOWN_ON_CANVAS:
      mouseDownOnCanvas(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.MOUSE_MOVE_ON_CANVAS:
      mouseMoveOnCanvas(action.value);
      canvasAppStore.emitChange();
      break;

    case CanvasAppConstants.MOUSE_UP_ON_CANVAS:
      mouseUpOnCanvas(action.value);
      canvasAppStore.emitChange();
      break;
         
    default:
      console.log('Unknown Action dispatched:', action.actionType);
      break;
  }
});

