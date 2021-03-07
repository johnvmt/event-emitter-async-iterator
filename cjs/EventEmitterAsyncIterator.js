"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const iterall_1 = __importDefault(require("iterall"));
class EventEmitterAsyncIterator extends eventemitter3_1.default {
    constructor() {
        super();
        this.pullQueue = [];
        this.pushQueue = [];
        this.listening = true;
        this[iterall_1.default.$$asyncIterator] = () => this;
    }
    emptyQueue() {
        if (this.listening) {
            this.listening = false;
            this.pullQueue.forEach(([resolve]) => {
                return resolve({ value: undefined, done: true });
            });
            this.pullQueue.length = 0;
            this.pushQueue.length = 0;
        }
    }
    pullValue() {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self.pushQueue.length !== 0)
                resolve({
                    value: self.pushQueue.shift(),
                    done: false
                });
            else
                self.pullQueue.push([resolve, reject]);
        });
    }
    pushValue(event) {
        if (this.pullQueue.length !== 0) {
            const [resolve] = this.pullQueue.shift();
            resolve({
                value: event,
                done: false
            });
        }
        else
            this.pushQueue.push(event);
    }
    next() {
        return (this.listening ? this.pullValue() : this.return());
    }
    throw(error) {
        this.listening = false;
        if (this.pullQueue.length !== 0) {
            const [resolve, reject] = this.pullQueue.shift();
            reject(error);
        }
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
iterall_1.default.$$asyncIterator;
exports.default = EventEmitterAsyncIterator;
