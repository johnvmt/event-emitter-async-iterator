"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _eventemitter = _interopRequireDefault(require("eventemitter3"));

var _iterall = _interopRequireDefault(require("iterall"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EventEmitterAsyncIterator extends _eventemitter.default {
  constructor() {
    super();
    this.pullQueue = [];
    this.pushQueue = [];
    this.listening = true;

    this[_iterall.default.$$asyncIterator] = () => this;
  }

  emptyQueue() {
    if (this.listening) {
      this.listening = false;
      this.pullQueue.forEach(resolve => {
        return resolve({
          value: undefined,
          done: true
        });
      });
      this.pullQueue.length = 0;
      this.pushQueue.length = 0;
    }
  }

  pullValue() {
    const self = this;
    return new Promise(resolve => {
      if (self.pushQueue.length !== 0) resolve({
        value: self.pushQueue.shift(),
        done: false
      });else self.pullQueue.push(resolve);
    });
  }

  pushValue(event) {
    if (this.pullQueue.length !== 0) this.pullQueue.shift()({
      value: event,
      done: false
    });else this.pushQueue.push(event);
  }

  next() {
    return this.listening ? this.pullValue() : this.return();
  }

  throw(error) {
    this.emptyQueue();
    return Promise.reject(error);
  }

  return() {
    this.emit('return');
    this.emptyQueue();
    return Promise.resolve({
      value: undefined,
      done: true
    });
  }

}

var _default = EventEmitterAsyncIterator;
exports.default = _default;