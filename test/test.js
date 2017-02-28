'use strict';

import chai from 'chai';
import {AppBusFactory} from '../src/app-bus';

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
            appBus.publish(testEventName, false); //Would fail the testSubscriber() assertion if subscribed.
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

        //Note: Keep this when/if the potential option of adding duplicate subscriptions is supported.
        // it('and un-subscribes duplicate subscriber functions all at once.', function(){
        //
        //     counter = 0;
        //     appBus.unSubscribe(testSubscriber).from(testEventName);
        //     appBus.publish(testEventName, 3);
        //     expect(counter).to.equal(0);
        //
        // });

    });





});