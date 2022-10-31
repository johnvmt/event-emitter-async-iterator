import { EventEmitter } from 'events';
import iterall from 'iterall';

class EventEmitterAsyncIterator extends EventEmitter {
	constructor(options = {}) {
		super();

		this.pullQueue = [];
		this.pushQueue = [];
		this.listening = true;

		this._options = options;

		if(typeof this._options.max === "number" && this._options.max < 1)
			throw new Error("Invalid max value");

		this[iterall.$$asyncIterator] = () => this;
		if (Symbol.asyncIterator)
			this[Symbol.asyncIterator] = () => this;
	}

	stopListener() {
		if(this.listening) {
			this.listening = false;
			this.emptyQueues();
		}
	}

	emptyQueues() {
		this.pullQueue.forEach(({resolve}) => resolve({ value: undefined, done: true }));
		this.pullQueue = [];
		this.pushQueue = [];
	}

	static async valueFromPushQueueItem({value, callback}) {
		return callback
			? await callback()
			: value;
	}

	pullValue() {
		return new Promise(async (resolve, reject) => {
			if(this.pushQueue.length > 0) { // items in push queue
				const value = await EventEmitterAsyncIterator.valueFromPushQueueItem(this.pushQueue.shift());
				resolve({
					value: value, // get value of item at front of push queue
					done: false
				});
			}
			else
				this.pullQueue.push({resolve, reject});
		});
	}

	pushCallback(callback) {
		return this.pushQueueItem({callback});
	}

	pushValue(value) {
		return this.pushQueueItem({value});
	}

	async pushQueueItem(item) {
		if(this.pullQueue.length > 0) { // pulls pending
			const {resolve} = this.pullQueue.shift(); // get pull queue resolver
			const value = await EventEmitterAsyncIterator.valueFromPushQueueItem(item);
			resolve({
				value: value,
				done: false
			});
		}
		else { // no pulls pending
			if(typeof this._options.max === "number") { // remove excess item
				while(this.pushQueue.length > (this._options.max - 1))
					this.pushQueue.shift();
			}

			this.pushQueue.push(item);
		}
	}

	next() {
		return this.listening
			? this.pullValue()
			: this.return();
	}

	throw(error) {
		this.pullQueue.forEach(({reject}) => reject(error));
		this.stopListener();
		return Promise.reject(error);
	}

	return() {
		this.emit('return');
		this.stopListener();
		return Promise.resolve({
			value: undefined,
			done: true
		});
	}
}

export { EventEmitterAsyncIterator };
