import EventEmitter from "eventemitter3";
import iterall from "iterall";

type ResolveResult = (arg: { value: any, done: boolean }) => void;
type RejectResult = (error: Error) => void;

class EventEmitterAsyncIterator extends EventEmitter implements AsyncIterator<any> {
	protected pullQueue: Array<[ResolveResult, RejectResult]>;
	protected pushQueue: any[];
	protected listening: boolean;

	public readonly [iterall.$$asyncIterator]: () => this;

	constructor() {
		super();

		this.pullQueue = [];
		this.pushQueue = [];
		this.listening = true;

		this[iterall.$$asyncIterator] = () => this;
	}

	public emptyQueue(): void {
		if(this.listening) {
			this.listening = false;

			this.pullQueue.forEach(([resolve]) => {
				return resolve({ value: undefined, done: true });
			});

			this.pullQueue.length = 0;
			this.pushQueue.length = 0;
		}
	}

	public pullValue(): Promise<IteratorResult<any, any>> {
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

	public pushValue(event: any): void {
		if(this.pullQueue.length !== 0) {
			const [ resolve ] = this.pullQueue.shift()!;

			resolve({
				value: event,
				done: false
			});
		} else
			this.pushQueue.push(event);
	}

	public next(): Promise<IteratorResult<any, any>> {
		return (this.listening ? this.pullValue() : this.return());
	}

	public throw(error: Error): Promise<IteratorResult<any, any>> {
		this.listening = false;

		if(this.pullQueue.length !== 0) {
			const [ resolve, reject ] = this.pullQueue.shift()!;

			reject(error);
		}

		this.emptyQueue();
		return Promise.reject(error);
	}

	public return(): Promise<IteratorResult<any, any>> {
		this.emit('return');
		this.emptyQueue();
		return Promise.resolve({
			value: undefined,
			done: true
		});
	}
}

export default EventEmitterAsyncIterator;
