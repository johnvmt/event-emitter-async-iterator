import { EventEmitter } from 'events';
import iterall from 'iterall';

class EventEmitterAsyncIterator extends EventEmitter {
	constructor() {
		super();

		this.pullQueue = [];
		this.pushQueue = [];
		this.listening = true;

		this[iterall.$$asyncIterator] = () => this;
		if (Symbol.asyncIterator) {
			this[Symbol.asyncIterator] = () => this;
		}
	}

	emptyQueue() {
		if(this.listening) {
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
			if(self.pushQueue.length !== 0)
				resolve({
					value: self.pushQueue.shift(),
					done: false
				});
			else
				self.pullQueue.push([resolve, reject]);
		});
	}

	pushValue(event) {
		if(this.pullQueue.length !== 0) {
			const [ resolve ] = this.pullQueue.shift();

			resolve({
				value: event,
				done: false
			});
		} else
			this.pushQueue.push(event);
	}

	next() {
		return this.listening
			? this.pullValue()
			: this.return();
	}

	throw(error) {
		this.listening = false;

		this.pullQueue.forEach(([resolve, reject]) => {
			return reject(error);
		});
		this.pullQueue.length = 0;

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

export { EventEmitterAsyncIterator };
