import EventEmitter from "eventemitter3";
import iterall from "iterall";
declare class EventEmitterAsyncIterator extends EventEmitter implements AsyncIterator<any> {
    protected pullQueue: any[];
    protected pushQueue: Promise<any>[];
    protected listening: boolean;
    readonly [iterall.$$asyncIterator]: () => this;
    constructor();
    emptyQueue(): void;
    pullValue(): Promise<IteratorResult<any, any>>;
    pushValue(event: any): void;
    next(): Promise<IteratorResult<any, any>>;
    throw(error: Error): Promise<IteratorResult<any, any>>;
    return(): Promise<IteratorResult<any, any>>;
}
export default EventEmitterAsyncIterator;
