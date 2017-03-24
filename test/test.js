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

    describe('Queued Functionality', function(){
        const appBus = AppBusFactory.new();
        let counter = 0;
        const testSubscriber = function(payload){
            counter += payload;
        };
        it('Can queue several publications,', function(){
            appBus.queuePublication(testEventName, 3);
            appBus.queuePublication(testEventName, 3);
            appBus.queuePublication(testEventName, 3);
        });
        it('subscribe, and have those publications sent.', function(){
            appBus.subscribe(testSubscriber).to(testEventName);
            expect(counter).to.equal(9);
        });

    });

    describe('Basic Functionality', function(){

        const appBus = AppBusFactory.new();

        let receivedPayload = false;
        const testSubscriber = function(payload){
            receivedPayload = payload;
        };

        it('Can subscribe,', function(){
            appBus.subscribe(testSubscriber).to(testEventName);
        });

        it('publish without a payload,', function(){
            appBus.publish(testEventName);
        });

        it('publish without a payload,', function(){
            appBus.publish(testEventName, true);
            expect(receivedPayload).to.equal(true);
        });

        it('un-subscribe,', function(){
            appBus.unSubscribe(testSubscriber).from(testEventName);
        });

        it('and then ignore publications.', function(){
            appBus.publish(testEventName, false);
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
            appBus.publish(testEventName, 3);
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