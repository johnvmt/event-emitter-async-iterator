import { assert, expect, use } from "chai";
import _ from "lodash";
import EventEmitterAsyncIterator from "../src/EventEmitterAsyncIterator";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

describe("basic tests", function () {
    it("some events", async function () {
        const events = _.range(30, 40);

        const e = new EventEmitterAsyncIterator();

        for (const event of events) {
            e.pushValue(event);
        }

        const emittedEvents = [];
        for await (const event of e) {
            emittedEvents.push(event);

            if (emittedEvents.length == events.length) {
                break;
            }
        }

        assert.sameOrderedMembers(emittedEvents, events);
    });

    it("some events with throw", async function () {
        const e = new EventEmitterAsyncIterator();

        e.pushValue("a");
        assert.deepEqual(await e.next(), { done: false, value: "a" });

        expect(e.throw(new Error("foobar"))).to.be.rejectedWith(Error, "foobar");
    });

    it("some events with throw 2", async function () {
        const e = new EventEmitterAsyncIterator();

        e.pushValue("a");
        assert.deepEqual(await e.next(), { done: false, value: "a" });

        const promisedError = e.next();

        expect(e.throw(new Error("foobar"))).to.be.rejectedWith(Error, "foobar");

        expect(promisedError).to.be.rejectedWith(Error, "foobar");
    });
});