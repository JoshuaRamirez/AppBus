'use strict';

const chai = require('chai');
const AppBusFactory = require('../dist/cjs/index.js');

const expect = chai.expect;

describe('Mocha and Chai', function () {
    it('should work fine.', function () {
        expect(true).to.equal(true);
    });
});

describe('AppBus', function () {

    const testEventName = 'Test';

    describe('Basic Functionality:', function () {
        const appBus = AppBusFactory.new();
        let receivedPayload = false;
        let publications = 0;
        const testSubscriber = function (payload) {
            publications += 1;
            receivedPayload = payload;
        };
        it('Can subscribe,', function () {
            appBus.subscribe(testSubscriber).to(testEventName);
        });
        it('publish without a payload,', function () {
            appBus.publish(testEventName).now();
            expect(publications).to.equal(1);
        });
        it('publish with a payload,', function () {
            appBus.publish(testEventName).with(true).now();
            expect(publications).to.equal(2);
            expect(receivedPayload).to.equal(true);
        });
        it('un-subscribe,', function () {
            appBus.unSubscribe(testSubscriber).from(testEventName);
        });
        it('and then ignore publications.', function () {
            appBus.publish(testEventName, false);
        });
    });

    describe('Basic Queued Functionality:', function () {
        const appBus = AppBusFactory.new();
        let payloadReceivedCounter = 0;
        let publicationReceivedCounter = 0;
        const testSubscriber = function (payload) {
            publicationReceivedCounter += 1;
            if (payload !== undefined) {
                payloadReceivedCounter += payload;
            }
        };
        it('Can queue several publications with a payload,', function () {
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
        });
        it('Can queue several more publications without a payload,', function () {
            appBus.publish(testEventName).queue.all();
            appBus.publish(testEventName).queue.all();
            appBus.publish(testEventName).queue.all();
        });
        it('subscribe, and have those publications sent.', function () {
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(payloadReceivedCounter).to.equal(9);
            expect(publicationReceivedCounter).to.equal(6);
        });
        it('Can queue several more publications with a payload,', function () {
            payloadReceivedCounter = 0;
            publicationReceivedCounter = 0;
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
        });
        it('Can queue several more publications without a payload,', function () {
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
        });
        it('and each one will have been processed because the subscription existed.', function () {
            expect(payloadReceivedCounter).to.equal(18);
            expect(publicationReceivedCounter).to.equal(6);
        });
    });

    describe('Other Queued Functionality:', function () {
        const appBus = AppBusFactory.new();
        let payloadReceivedCounter = 0;
        let publicationReceivedCounter = 0;
        const testSubscriber = function (payload) {
            publicationReceivedCounter += 1;
            payloadReceivedCounter += payload;
        };
        it('Can queue with a payload only the latest out of several publications,', function () {
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
        });
        it('subscribe, and have only one publication sent.', function () {
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(payloadReceivedCounter).to.equal(3);
        });
        it('Can un-subscribe and then queue without a payload only the latest out of several publications,', function () {
            appBus.unSubscribe(testSubscriber).from(testEventName);
            publicationReceivedCounter = 0;
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
        });
        it('subscribe, and have only one publication sent.', function () {
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(publicationReceivedCounter).to.equal(1);
        });
        it('Can queue with a payload only the latest out of several more publications,', function () {
            payloadReceivedCounter = 0;
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
        });
        it('Can queue again with a different event alongside other events', function () {
            appBus.publish('ignored').with(3).queue.latest();
        });
        it('but each one will have been processed because a subscription exists.', function () {
            expect(payloadReceivedCounter).to.equal(9);
        });
        it('Can queue without a payload only the latest out of several more publications,', function () {
            publicationReceivedCounter = 0;
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
        });
        it('but each one will have been processed because a subscription exists.', function () {
            expect(publicationReceivedCounter).to.equal(3);
        });
    });

    describe('Posting Functionality:', function () {
        const appBus = AppBusFactory.new();
        let payload1Received = false;
        let payload2Received = false;
        let payload3Received = false;
        let event1Received = false;
        let event2Received = false;
        let event3Received = false;
        const testEventName1 = 'TestEvent1';
        const testEventName2 = 'TestEvent2';
        const testEventName3 = 'TestEvent3';
        const testSubscriber1 = function (payload) {
            payload1Received = payload;
            event1Received = true;
        };
        const testSubscriber2 = function (payload) {
            payload2Received = payload;
            event2Received = true;
        };
        const testSubscriber3 = function (payload) {
            payload3Received = payload;
            event3Received = true;
        };
        it('Can post multiple events with payloads,', function () {
            appBus.publish(testEventName1).with(true).post();
            appBus.publish(testEventName2).with(true).post();
            appBus.publish(testEventName3).with(true).post();
        });
        it('subscribe to the first and receive only that payload,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            expect(payload1Received).to.equal(true);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(false);
        });
        it('subscribe to the second and receive only that payload,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.subscribe(testSubscriber2).to(testEventName2);
            expect(payload1Received).to.equal(false);
            expect(payload2Received).to.equal(true);
            expect(payload3Received).to.equal(false);
        });
        it('subscribe to the third and receive only that payload,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.subscribe(testSubscriber3).to(testEventName3);
            expect(payload1Received).to.equal(false);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(true);
        });
        it('un-subscribe one of them, re-subscribe, and receive only that payload,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.unSubscribe(testSubscriber1).from(testEventName1);
            appBus.subscribe(testSubscriber1).to(testEventName1);
            expect(payload1Received).to.equal(true);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(false);
        });
        it('post again and receive only that payload,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.publish(testEventName1).with(true).post();
            expect(payload1Received).to.equal(true);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(false);
        });
        it('make duplicate subscriptions and expect no effects.', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
            expect(payload1Received).to.equal(false);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(false);
        });
        it('Can post multiple events without payloads,', function () {
            appBus.clear.subscriptions.all();
            appBus.clear.posts.all();
            appBus.publish(testEventName1).post();
            appBus.publish(testEventName2).post();
            appBus.publish(testEventName3).post();
        });
        it('subscribe to the first and receive only that event,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            expect(event1Received).to.equal(true);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
        it('subscribe to the second and receive only that event,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber2).to(testEventName2);
            expect(event1Received).to.equal(false);
            expect(event2Received).to.equal(true);
            expect(event3Received).to.equal(false);
        });
        it('subscribe to the third and receive only that event,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber3).to(testEventName3);
            expect(event1Received).to.equal(false);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(true);
        });
        it('un-subscribe one of them, re-subscribe, and receive only that event,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.unSubscribe(testSubscriber1).from(testEventName1);
            appBus.subscribe(testSubscriber1).to(testEventName1);
            expect(event1Received).to.equal(true);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
        it('post again and receive only that event.', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.publish(testEventName1).with(true).post();
            expect(event1Received).to.equal(true);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
    });

    describe('Clear Subscriptions Functionality:', function () {
        const appBus = AppBusFactory.new();
        let event1Received = false;
        let event2Received = false;
        let event3Received = false;
        const testEventName1 = 'TestEvent1';
        const testEventName2 = 'TestEvent2';
        const testEventName3 = 'TestEvent3';
        const testSubscriber1 = function () {
            event1Received = true;
        };
        const testSubscriber2 = function () {
            event2Received = true;
        };
        const testSubscriber3 = function () {
            event3Received = true;
        };
        it('Can subscribe to several events,', function () {
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('clear several subscriptions,', function () {
            appBus.clear.subscriptions.byEventName(testEventName1);
            appBus.clear.subscriptions.byEventName(testEventName3);
        });
        it('publish them all,', function () {
            appBus.publish(testEventName1).now();
            appBus.publish(testEventName2).now();
            appBus.publish(testEventName3).now();
        });
        it('expect no publications for the removed subscriptions,', function () {
            expect(event1Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
        it('expect a publication for remaining publication,', function () {
            expect(event2Received).to.equal(true);
        });
        it('re-subscribe the previously removed subscriptions,', function () {
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('remove all the subscriptions,', function () {
            appBus.clear.subscriptions.all();
        });
        it('publish them all again,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.publish(testEventName1).now();
            appBus.publish(testEventName2).now();
            appBus.publish(testEventName3).now();
        });
        it('and expect no effect.', function () {
            expect(event1Received).to.equal(false);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
    });

    describe('Clear Posts Functionality:', function () {
        const appBus = AppBusFactory.new();
        let payload1Received = false;
        let payload2Received = false;
        let payload3Received = false;
        let event1Received = false;
        let event2Received = false;
        let event3Received = false;
        const testEventName1 = 'TestEvent1';
        const testEventName2 = 'TestEvent2';
        const testEventName3 = 'TestEvent3';
        const testSubscriber1 = function (payload) {
            payload1Received = payload;
            event1Received = true;
        };
        const testSubscriber2 = function (payload) {
            payload2Received = payload;
            event2Received = true;
        };
        const testSubscriber3 = function (payload) {
            payload3Received = payload;
            event3Received = true;
        };
        it('Can make posted publications with payloads,', function () {
            appBus.publish(testEventName1).with(true).post();
            appBus.publish(testEventName2).with(true).post();
            appBus.publish(testEventName3).with(true).post();
        });
        it('subscribe to them all,', function () {
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('expect the payloads to be received', function () {
            expect(payload1Received).to.equal(true);
            expect(payload2Received).to.equal(true);
            expect(payload3Received).to.equal(true);
        });
        it('clear all the posted publications and subscriptions,', function () {
            appBus.clear.posts.all();
            appBus.clear.subscriptions.all();
        });
        it('subscribe again to them all,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('and expect no effect.', function () {
            expect(payload1Received).to.equal(false);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(false);
            appBus.clear.subscriptions.all();
        });
        it('Can make posted publications without payloads,', function () {
            appBus.publish(testEventName1).post();
            appBus.publish(testEventName2).post();
            appBus.publish(testEventName3).post();
        });
        it('subscribe to them all,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('expect the events to be received', function () {
            expect(event1Received).to.equal(true);
            expect(event2Received).to.equal(true);
            expect(event3Received).to.equal(true);
        });
        it('clear all the posted publications and subscriptions,', function () {
            appBus.clear.posts.all();
            appBus.clear.subscriptions.all();
        });
        it('subscribe again to them all,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('and expect no effect.', function () {
            expect(event1Received).to.equal(false);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(false);
            appBus.clear.posts.all();
            appBus.clear.subscriptions.all();
        });
        it('Can post publications without payloads,', function () {
            appBus.publish(testEventName1).post();
            appBus.publish(testEventName2).post();
            appBus.publish(testEventName3).post();
        });
        it('remove some of them', function () {
            appBus.clear.posts.byEventName(testEventName1);
            appBus.clear.posts.byEventName(testEventName3);
        });
        it('subscribe to them all,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('expect the removed posted publications to not publish', function () {
            expect(event1Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
        it('expect the remaining posted publication to publish', function () {
            expect(event2Received).to.equal(true);
        });
    });

    describe('Clear Queue Functionality:', function () {
        const appBus = AppBusFactory.new();
        let payload1Received = false;
        let payload2Received = false;
        let payload3Received = false;
        let event1Received = false;
        let event2Received = false;
        let event3Received = false;
        const testEventName1 = 'TestEvent1';
        const testEventName2 = 'TestEvent2';
        const testEventName3 = 'TestEvent3';
        const testSubscriber1 = function (payload) {
            payload1Received = payload;
            event1Received = true;
        };
        const testSubscriber2 = function (payload) {
            payload2Received = payload;
            event2Received = true;
        };
        const testSubscriber3 = function (payload) {
            payload3Received = payload;
            event3Received = true;
        };
        it('Can queue publications with payloads,', function () {
            appBus.publish(testEventName1).with(true).queue.all();
            appBus.publish(testEventName2).with(true).queue.all();
            appBus.publish(testEventName3).with(true).queue.all();
        });
        it('subscribe to them all,', function () {
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('expect the payloads to be received', function () {
            expect(payload1Received).to.equal(true);
            expect(payload2Received).to.equal(true);
            expect(payload3Received).to.equal(true);
        });
        it('clear all the queued publications and subscriptions,', function () {
            appBus.clear.queue.all();
            appBus.clear.subscriptions.all();
        });
        it('subscribe to them all,', function () {
            payload1Received = false;
            payload2Received = false;
            payload3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('and expect no effect.', function () {
            expect(payload1Received).to.equal(false);
            expect(payload2Received).to.equal(false);
            expect(payload3Received).to.equal(false);
            appBus.clear.subscriptions.all();
        });
        it('Can queue publications without payloads,', function () {
            appBus.publish(testEventName1).queue.all();
            appBus.publish(testEventName2).queue.all();
            appBus.publish(testEventName3).queue.all();
        });
        it('subscribe to them all,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('expect the events to be received', function () {
            expect(event1Received).to.equal(true);
            expect(event2Received).to.equal(true);
            expect(event3Received).to.equal(true);
        });
        it('clear all the queued publications and subscriptions,', function () {
            appBus.clear.queue.all();
            appBus.clear.subscriptions.all();
        });
        it('subscribe to them all,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('and expect no effect.', function () {
            expect(event1Received).to.equal(false);
            expect(event2Received).to.equal(false);
            expect(event3Received).to.equal(false);
            appBus.clear.posts.all();
            appBus.clear.subscriptions.all();
        });
        it('Can queue publications without payloads,', function () {
            appBus.publish(testEventName1).queue.all();
            appBus.publish(testEventName2).queue.all();
            appBus.publish(testEventName3).queue.all();
        });
        it('remove some of them', function () {
            appBus.clear.queue.byEventName(testEventName1);
            appBus.clear.queue.byEventName(testEventName3);
        });
        it('subscribe to them all,', function () {
            event1Received = false;
            event2Received = false;
            event3Received = false;
            appBus.subscribe(testSubscriber1).to(testEventName1);
            appBus.subscribe(testSubscriber2).to(testEventName2);
            appBus.subscribe(testSubscriber3).to(testEventName3);
        });
        it('expect the removed queued publications to not publish', function () {
            expect(event1Received).to.equal(false);
            expect(event3Received).to.equal(false);
        });
        it('expect the remaining queued publication to publish', function () {
            expect(event2Received).to.equal(true);
        });
    });

    describe('Edge Cases:', function () {
        const appBus = AppBusFactory.new();
        let counter = 0;
        const testSubscriber = function (payload) {
            counter += payload;
        };
        it('Ignores duplicate subscriptions.', function () {
            appBus.subscribe(testSubscriber).to(testEventName);
            appBus.subscribe(testSubscriber).to(testEventName);
            appBus.subscribe(testSubscriber).to(testEventName);
            appBus.publish(testEventName).with(3).now();
            expect(counter).to.equal(3);

        });
    });

    describe('Module:', function () {
        it('Can import the factory,', function () {
            expect(AppBusFactory).to.have.property('new');
        });
        it('and use it to create an instance.', function () {
            const appBus = AppBusFactory.new();
            expect(appBus).to.have.property('publish');
            expect(appBus).to.have.property('subscribe');
        });
        it('Can require the factory', function () {
            const appBusFactory = require('../dist/cjs/index.js');
            expect(appBusFactory).to.have.property('new');
        });
        it('and use it to create an instance.', function () {
            const appBus = AppBusFactory.new();
            expect(appBus).to.have.property('publish');
            expect(appBus).to.have.property('subscribe');
        });
    });

    describe('New Features:', function () {
        it('supports once subscriptions', function () {
            const bus = AppBusFactory.new();
            let counter = 0;
            const sub = () => { counter++; };
            bus.once(sub).to('once');
            bus.publish('once').now();
            bus.publish('once').now();
            expect(counter).to.equal(1);
        });

        it('supports async publishing', function (done) {
            const bus = AppBusFactory.new();
            let flag = false;
            bus.subscribe((v) => { flag = v; }).to('async');
            bus.publish('async').with(true).async();
            expect(flag).to.equal(false);
            setTimeout(() => {
                expect(flag).to.equal(true);
                done();
            }, 5);
        });
    });

    describe('Additional Coverage', function () {
        it('rejects invalid event names', function () {
            const bus = AppBusFactory.new();
            expect(() => bus.publish(123)).to.throw('eventName');
        });

        it('rejects invalid subscribers', function () {
            const bus = AppBusFactory.new();
            expect(() => bus.subscribe('notFn')).to.throw('Function');
        });

        it('supports async publishing without payload', function (done) {
            const bus = AppBusFactory.new();
            let called = false;
            bus.subscribe(() => { called = true; }).to('A');
            bus.publish('A').async();
            expect(called).to.equal(false);
            setTimeout(() => {
                expect(called).to.equal(true);
                done();
            }, 5);
        });

        it('clears all subscriptions via unsubscribeAll', function () {
            const bus = AppBusFactory.new();
            const fn = () => {};
            bus.subscribe(fn).to('E');
            expect(bus.getSubscriptions('E').length).to.equal(1);
            bus.unsubscribeAll();
            expect(bus.getSubscriptions('E').length).to.equal(0);
        });

        it('returns subscription list per event', function () {
            const bus = AppBusFactory.new();
            const fn1 = () => {};
            const fn2 = () => {};
            bus.subscribe(fn1).to('E1');
            bus.subscribe(fn2).to('E2');
            const subsE1 = bus.getSubscriptions('E1');
            const allSubs = bus.getSubscriptions();
            expect(subsE1[0].subscriber).to.equal(fn1);
            expect(allSubs.length).to.equal(2);
        });
    });

});