'use strict';

import chai from 'chai';
import AppBusFactory from '../src/app-bus';

const expect = chai.expect;

describe('Mocha and Chai', function() {
    it('should work fine.', function() {
        expect(true).to.equal(true);
    });
});

describe('AppBus', function(){

    const testEventName = 'Test';

    describe('Basic Functionality', function(){
        const appBus = AppBusFactory.new();
        let receivedPayload = false;
        let publications = 0;
        const testSubscriber = function(payload){
            publications += 1;
            receivedPayload = payload;
        };
        it('Can subscribe,', function(){
            appBus.subscribe(testSubscriber).to(testEventName);
        });
        it('publish without a payload,', function(){
            appBus.publish(testEventName).now();
            expect(publications).to.equal(1);
        });
        it('publish with a payload,', function(){
            appBus.publish(testEventName).with(true).now();
            expect(publications).to.equal(2);
            expect(receivedPayload).to.equal(true);
        });
        it('un-subscribe,', function(){
            appBus.unSubscribe(testSubscriber).from(testEventName);
        });
        it('and then ignore publications.', function(){
            appBus.publish(testEventName, false);
        });
    });

    describe('Basic Queued Functionality', function(){
        const appBus = AppBusFactory.new();
        let payloadReceivedCounter = 0;
        let publicationReceivedCounter = 0;
        const testSubscriber = function(payload){
            publicationReceivedCounter += 1;
            if(payload !== undefined) {
                payloadReceivedCounter += payload;
            }
        };
        it('Can queue several publications with a payload,', function(){
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
        });
        it('Can queue several more publications without a payload,', function(){
            appBus.publish(testEventName).queue.all();
            appBus.publish(testEventName).queue.all();
            appBus.publish(testEventName).queue.all();
        });
        it('subscribe, and have those publications sent.', function(){
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(payloadReceivedCounter).to.equal(9);
            expect(publicationReceivedCounter).to.equal(6);
        });
        it('Can queue several more publications with a payload,', function(){
            payloadReceivedCounter = 0;
            publicationReceivedCounter = 0;
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
        });
        it('Can queue several more publications without a payload,', function(){
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
            appBus.publish(testEventName).with(3).queue.all();
        });
        it('and each one will have been processed because the subscription existed.', function(){
            expect(payloadReceivedCounter).to.equal(18);
            expect(publicationReceivedCounter).to.equal(6);
        });
    });

    describe('Other Queued Functionality', function(){
        const appBus = AppBusFactory.new();
        let payloadReceivedCounter = 0;
        let publicationReceivedCounter = 0;
        const testSubscriber = function(payload){
            publicationReceivedCounter += 1;
            payloadReceivedCounter += payload;
        };
        it('Can queue with a payload only the latest out of several publications,', function(){
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
        });
        it('subscribe, and have only one publication sent.', function(){
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(payloadReceivedCounter).to.equal(3);
        });
        it('Can un-subscribe and then queue without a payload only the latest out of several publications,', function(){
            appBus.unSubscribe(testSubscriber).from(testEventName);
            publicationReceivedCounter = 0;
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
        });
        it('subscribe, and have only one publication sent.', function(){
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(publicationReceivedCounter).to.equal(1);
        });
        it('Can queue with a payload only the latest out of several more publications,', function(){
            payloadReceivedCounter = 0;
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
            appBus.publish(testEventName).with(3).queue.latest();
        });
        it('but each one will have been processed because a subscription exists.', function(){
            expect(payloadReceivedCounter).to.equal(9);
        });
        it('Can queue without a payload only the latest out of several more publications,', function(){
            publicationReceivedCounter = 0;
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
            appBus.publish(testEventName).queue.latest();
        });
        it('but each one will have been processed because a subscription exists.', function(){
            expect(publicationReceivedCounter).to.equal(3);
        });
    });

    describe('Edge Cases', function(){
        const appBus = AppBusFactory.new();
        let counter = 0;
        const testSubscriber = function(payload){
            counter += payload;
        };
        it('Ignores duplicate subscriptions.', function(){

            appBus.subscribe(testSubscriber).to(testEventName);
            appBus.subscribe(testSubscriber).to(testEventName);
            appBus.subscribe(testSubscriber).to(testEventName);
            appBus.publish(testEventName).with(3).now();
            expect(counter).to.equal(3);

        });
    });

    describe('Module', function(){
        it('Can import the factory,', function(){
            expect(AppBusFactory).to.have.property('new');
        });
        it('and use it to create an instance.', function(){
            const appBus = AppBusFactory.new();
            expect(appBus).to.have.property('publish');
            expect(appBus).to.have.property('subscribe');
        });
        it('Can require the factory', function(){
            const appBusFactory = require('../src/app-bus');
            expect(appBusFactory).to.have.property('new');
        });
        it('and use it to create an instance.', function(){
            const appBus = AppBusFactory.new();
            expect(appBus).to.have.property('publish');
            expect(appBus).to.have.property('subscribe');
        });
    });

});