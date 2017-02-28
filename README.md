AppBus
=========

A small library that give you a publish / subscribe application bus that runs synchronously and in-memory.

## Installation

  `npm install app-bus`

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
    
    //Publish an event with the optional payload
    appBus.publish(myEventName, myPayload);
    
    //Unsubscribe when done
    appBus.unSubscribe(mySubscriber).from(myEventName);

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