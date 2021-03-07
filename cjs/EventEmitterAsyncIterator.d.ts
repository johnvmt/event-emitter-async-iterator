import EventEmitter from "eventemitter3";
import iterall from "iterall";
declare type ResolveResult = (arg: {
    value: any;
    done: boolean;
}) => void;
declare type RejectResult = (error: Error) => void;
declare class EventEmitterAsyncIterator extends EventEmitter implements AsyncIterator<any> {
    protected pullQueue: Array<[ResolveResult, RejectResult]>;
    protected pushQueue: any[];
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
