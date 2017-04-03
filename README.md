AppBus
=========

A small library that give you a publish / subscribe application bus that runs synchronously and in-memory.

## Installation

  `npm install app-bus --save`

## Usage

    //Require in the instance factory
    var AppBusFactory = require('app-bus');
    
    //Create an instance
    var appBus = AppBusFactory.new();
    
    //Define an event as a name
    var myEventName = "Events.MyEvent.Occured";

    //Define a subscriber
    var mySubscriber = function(payload){
        console.log(payload);
    };
    
    //Subscribe to the event as a name
    appBus.subscribe(mySubscriber).to(myEventName);
    
    //Define an optional payload for the subscription
    var myPayload = "Hello World";
    
    //Publish an event immediately with a payload
    appBus.publish(myEventName).with(myPayload).now();
    
    //Publish an event immediately without a payload
    appBus.publish(myEventName).now();
    
    //Unsubscribe when done
    appBus.unSubscribe(mySubscriber).from(myEventName);
    
    //Queue publications with a payload for the future when a subscription is made
    appBus.publish(myEventName).with(myPayload).queue.all();
    appBus.publish(myEventName).with(myPayload).queue.all();
    appBus.publish(myEventName).with(myPayload).queue.all();
    
    //Subscribe and receive all the queued publications
    appBus.subscribe(mySubscriber).to(myEventName);
    
    //Unsubscribe when done again
    appBus.unSubscribe(mySubscriber).from(myEventName);
    
    //Queue a publication again with a payload for the future when a subscription is made
    appBus.publish(myEventName).with(myPayload).queue.all();
    
    //Replace the publication with only the latest one queued
    appBus.publish(myEventName).with(myPayload).queue.latest();
    
    //Replace the latest publication again with only the latest one queued
    appBus.publish(myEventName).with(myPayload).queue.latest();
    
    //Replace the latest publication again with only the latest one queued without a payload
    appBus.publish(myEventName).queue.latest();
    
    //Subscribe and expect only the last queued publication without a payload to be received
    appBus.subscribe(mySubscriber).to(myEventName);

## Tests
    
  `npm test`
  
## Stack
  
  * Grunt
  * ES6 (Babel)
  * ESLint
  * Mocha
  * Chai

## Contributing

Pull requests are welcome. Please take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.