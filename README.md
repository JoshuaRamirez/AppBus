AppBus
=========

A small library written in TypeScript that gives you a publish / subscribe application bus that runs synchronously and in-memory.

## Installation

Both ESM and CommonJS builds are provided. Use the default import in modern
bundlers or `require` in Node's CommonJS mode.

  `npm install app-bus --save`

## Usage

    //Require in the instance factory
    import AppBusFactory from 'app-bus'; // ESM
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

    //Publish asynchronously using a microtask
    appBus.publish(myEventName).with(myPayload).async();
    
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
    
    //Clear subscription by event name
    appBus.clear.subscriptions.byEventName(myEventName);
    
    //Also clear all subscriptions
    appBus.clear.subscriptions.all();
    
    //Clear queued subscriptions by event name
    appBus.clear.queue.byEventName(myEventName);
    
    //Also clear all queued subscriptions
    appBus.clear.queue.all();
    
    //Post publications for future subscriptions
    appBus.publish(myEventName).post();
    
    //Update and overwrite the posted publication to have a payload 
    appBus.publish(myEventName).with(myPayload).post();
    
    //Subscribe and receive the posted publication
    appBus.subscribe(mySubscriber).to(myEventName);
    
    //Unsubscribe...
    appBus.unSubscribe(mySubscriber).from(myEventName);
    
    //Then subscribe again and receive the posted publication again
    appBus.subscribe(mySubscriber).to(myEventName);
    
    //Clear that particular posting
    appBus.clear.posts.byEventName(myEventName);
    
    //Also clear all posts
    appBus.clear.posts.all();

## TypeScript Example

    interface Events {
        'user.created': { id: number };
        'user.deleted': { id: number };
    }

    const typedBus = AppBusFactory.new<Events>();
    typedBus.subscribe((payload) => {
        console.log(payload.id);
    }).to('user.created');
    typedBus.publish('user.created').with({ id: 1 }).now();
    
## Tests

  `npm test`

## Release Notes

### 2.2.0
- Ported the library to TypeScript.
- Builds now output both CommonJS and ES modules.
- Added a compatibility wrapper for `require`.
- Dropped the Grunt/Babel build.

### 2.1.1
- Documentation updates only.

### 2.1.0
- Added posting and clearing APIs for queued events.
- Improved queueing behavior and fixed multi-event bugs.
- Expanded unit tests.

### 1.1.0
- Introduced queued publication support.
- Centralized validation logic.

### 1.0.2
- Module now always exports the factory function.
- Added Travis CI integration and documentation fixes.

### 1.0.0
- Initial release with publish/subscribe API and duplicate subscription handling.
  
## Stack

  * TypeScript
  * Mocha
  * Chai

## Contributing

Pull requests are welcome. Please take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.