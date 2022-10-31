var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/exports.js
var exports_exports = {};
__export(exports_exports, {
  EventEmitterAsyncIterator: () => EventEmitterAsyncIterator_default
});
module.exports = __toCommonJS(exports_exports);

// src/EventEmitterAsyncIterator.js
var import_events = require("events");
var import_iterall = __toESM(require("iterall"), 1);
var EventEmitterAsyncIterator = class extends import_events.EventEmitter {
  constructor(options = {}) {
    super();
    this.pullQueue = [];
    this.pushQueue = [];
    this.listening = true;
    this._options = options;
    if (typeof this._options.max === "number" && this._options.max < 1)
      throw new Error("Invalid max value");
    this[import_iterall.default.$$asyncIterator] = () => this;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EventEmitterAsyncIterator
});
