define(function () {

    var subscriptions = [];

    var makeDeliveryJob = function (subscriber) {
        return function (event) {
            subscriber.apply(null, event.Arguments);
        };
    };

    var makeSubscription = function (subscriber, eventName) {
        var subscription = {
            Subscriber: subscriber,
            EventName: eventName,
            Send: makeDeliveryJob(subscriber)
        };
        return subscription;
    };

    var sendSubscriptions = function(event){
        for (var i = 0; i < subscriptions.length; i++) {
            var subscription = subscriptions[i];
            if (subscription.EventName = event.Name) {
                subscription.Send(event);
            }
        }
    };

    var validateEvent = function(event){
        if (!event.hasOwnProperty("Name")) {
            throw "Interactivity Failure: " +
                "Tried to publish an event object missing a 'Name' property. " +
                "Set a 'Name' property (string) on the event object before publishing."
        }
        if (!event.hasOwnProperty("Arguments")) {
            throw "Interactivity Failure: " +
                "Tried to publish an event object missing an 'Arguments' property. " +
                "Set a 'Arguments' property (array) on the event object before publishing."
        }
    };

    var makeSubscriptionApi = function(subscriber){

        //Implementation
        var to = function (eventName) {
            var subscription = makeSubscription(subscriber, eventName);
            subscriptions.push(subscription);
        };

        //"API"
        return {
            To: to
        };

    }

    var subscribe = function(subscriber) {
        return makeSubscriptionApi(subscriber);
    };

    var publish = function(event) {
        validateEvent(event);
        sendSubscriptions(event);
    }

    return {
        Subscribe: subscribe,
        Publish: publish
    };

});