AppBus
=========

A small library that give you a publish / subscribe application bus that runs synchronously and in-memory.

## Installation

  `npm install app-bus`

## Usage

    //Require in AppBus
    var AppBus = require('app-bus');
    
    var myEventName = "Events.MyEvent.Occured";

    //Subscriber aka 'Event Handler'
    var mySubscriber = function(payload){
        console.log(payload);   
    };
    
    //Subscribe
    AppBus.subscribe(mySubscriber).to(myEventName);
    
    //Publish
    var myPayload = "Hello World";
    AppBus.publish(myEventName, myPayload)
  
  
  Console output should be "Hello World"

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