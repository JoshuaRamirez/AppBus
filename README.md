AppBus
=========

A small library that give you a publish / subscribe application bus that runs synchronously and in-memory.

## Installation

  `npm install app-bus`

## Usage

    //Require in AppBusFactory
    var AppBusFactory = require('app-bus');
    
    //Create an instance
    var appBus = AppBusFactory.new();
    
    //Define an event as a name
    var myEventName = "Events.MyEvent.Occured";

    //Define a subscriber
    var mySubscriber = function(payload){
        console.log(payload);   
    };
    
    //Subscribe to the event as a nem
    AppBus.subscribe(mySubscriber).to(myEventName);
    
    //Define an optional payload for the subscription
    var myPayload = "Hello World";
    
    //Publish an event with the optional payload
    AppBus.publish(myEventName, myPayload)
    
    //Console output should be "Hello World"

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