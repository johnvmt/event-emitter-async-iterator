// src/EventEmitterAsyncIterator.js
import { EventEmitter } from "events";
import iterall from "iterall";
var EventEmitterAsyncIterator = class extends EventEmitter {
  constructor(options = {}) {
    super();
    this.pullQueue = [];
    this.pushQueue = [];
    this.listening = true;
    this._options = options;
    if (typeof this._options.max === "number" && this._options.max < 1)
      throw new Error("Invalid max value");
    this[iterall.$$asyncIterator] = () => this;
    if (Symbol.asyncIterator)
      this[Symbol.asyncIterator] = () => this;
  }
  stopListener() {
    if (this.listening) {
      this.listening = false;
      this.emptyQueues();
    }
  }
  emptyQueues() {
    this.pullQueue.forEach(({ resolve }) => resolve({ value: void 0, done: true }));
    this.pullQueue = [];
    this.pushQueue = [];
  }
  static async valueFromPushQueueItem({ value, callback }) {
    return callback ? await callback() : value;
  }
  pullValue() {
    return new Promise(async (resolve, reject) => {
      if (this.pushQueue.length > 0) {
        const value = await EventEmitterAsyncIterator.valueFromPushQueueItem(this.pushQueue.shift());
        resolve({
          value,
          done: false
        });
      } else
        this.pullQueue.push({ resolve, reject });
    });
  }
  pushCallback(callback) {
    return this.pushQueueItem({ callback });
  }
  pushValue(value) {
    return this.pushQueueItem({ value });
  }
  async pushQueueItem(item) {
    if (this.pullQueue.length > 0) {
      const { resolve } = this.pullQueue.shift();
      const value = await EventEmitterAsyncIterator.valueFromPushQueueItem(item);
      resolve({
        value,
        done: false
      });
    } else {
      if (typeof this._options.max === "number") {
        while (this.pushQueue.length > this._options.max - 1)
          this.pushQueue.shift();
      }
      this.pushQueue.push(item);
    }
  }
  next() {
    return this.listening ? this.pullValue() : this.return();
  }
  throw(error) {
    this.pullQueue.forEach(({ reject }) => reject(error));
    this.stopListener();
    return Promise.reject(error);
  }
  return() {
    this.emit("return");
    this.stopListener();
    return Promise.resolve({
      value: void 0,
      done: true
    });
  }
};
var EventEmitterAsyncIterator_default = EventEmitterAsyncIterator;
export {
  EventEmitterAsyncIterator_default as EventEmitterAsyncIterator
};
