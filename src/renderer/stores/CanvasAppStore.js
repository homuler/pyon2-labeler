'use strict';

import {CanvasAppDispatcher} from '../dispatcher/CanvasAppDispatcher';
import EventEmitter from 'events';
import {CanvasAppConstants} from '../constants/CanvasAppConstants';

const CHANGE_EVENT = 'change';

var _canvasBag = defaultCanvasBag();

function defaultCanvasBag() {
   return {
      message: 'Pyon2 Labeler',
      controller: {
         format: 'json',
      },
      canvas: null
   };
}

function resetCanvasBag() {
   _canvasBag.canvas.reset();
}

function deleteFigure() {
   if (!_canvasBag.canvas === null) {
      throw ('CanvasBag is not initialized yet.');
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
      throw ('CanvasBag is not initialized yet.');
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
      throw ('CanvasBag is not initialized yet.');
   }
   _canvasBag.canvas.settings.aspect.fix = 
      !_canvasBag.canvas.settings.aspect.fix;
}

function changeAspectRatio(obj) {
   if (_canvasBag.canvas == null) {
      throw ('CanvasBag is not initialized yet.');
   }
   _canvasBag.canvas.settings.aspect.ratio = obj;
}

function changeFigureColor(obj) {
   console.log('changeFigureColor');
   if (_canvasBag.canvas == null) {
      throw ('CanvasBag is not initialized yet.');
   }
   _canvasBag.canvas.settings.stroke.color = obj;
   if (_canvasBag.canvas.state.currentFigure.figure) {
      _canvasBag.canvas.state.currentFigure.figure.color = obj;
   }
}

function changeLineWidth(obj) {
   if (_canvasBag.canvas == null) {
      throw ('CanvasBag is not initialized yet.');
   }
   _canvasBag.canvas.settings.stroke.lineWidth = obj.lineWidth;
   if (_canvasBag.canvas.state.currentFigure.figure) {
      _canvasBag.canvas.state.currentFigure.figure.lineWidth = obj.lineWidth;
   }
}

function changeLabel(obj) {
   if (_canvasBag.canvas == null) {
      throw ('CanvasBag is not initialized yet.');
   }
   if (_canvasBag.canvas.state.currentFigure.figure) {
      _canvasBag.canvas.state.currentFigure.figure.label = obj.label;
   }
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

function colorPickerChange(color) {
   if (_canvasBag.canvas == null) {
      throw ('CanvasBag is not initialized yet.');
   }
   _canvasBag.canvas.settings.stroke.color = color;
   if (_canvasBag.canvas.state.currentFigure.figure
           && _canvasBag.canvas.state.mode === 'Edit') {
      _canvasBag.canvas.state.currentFigure.figure.color = color;
      _canvasBag.canvas.redrawAll();
      _canvasBag.canvas.state.currentFigure.figure.focus(_canvasBag.canvas.offscreenCtx);
      _canvasBag.canvas.saveDrawingSurface();
      if (_canvasBag.canvas.hasVirtualSurface()) {
         _canvasBag.canvas.drawVirtualSurface();
      }
      _canvasBag.canvas.copyOffscreenToMain();
   }
}

class CanvasAppStore extends EventEmitter {
   constructor(){
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

export var canvasAppStore = new CanvasAppStore();

CanvasAppDispatcher.register((action) => {
   switch(action.actionType) {
      case CanvasAppConstants.INITIALIZE_CANVAS:
         canvasAppStore.setCanvasBag(action.value);
         canvasAppStore.emitChange();
         break;

      case CanvasAppConstants.RESET_CANVAS:
         resetCanvasBag();
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
         console.log('change figure color');
         canvasAppStore.emitChange();
         break;

      case CanvasAppConstants.COLOR_PICKER_CHANGE:
         colorPickerChange(action.value);
         canvasAppStore.emitChange();
         break;

      case CanvasAppConstants.CHANGE_LINE_WIDTH:
         changeLineWidth(action.value);
         console.log('change line width', action.value);
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

