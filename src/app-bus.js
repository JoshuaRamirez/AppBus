function AppBus() {

    const subscriptions = [];

    const curryDeliveryJob = function (subscriber) {
        return function (payload) {
            subscriber.apply(null, [payload]);
        };
    };

    const makeSubscription = function (subscriber, eventName) {
        const send = curryDeliveryJob(subscriber);
        return {
            subscriber: subscriber,
            eventName: eventName,
            send: send
        };
    };

    const findSubscriptions = function(eventName, subscriber) {
        const foundSubscriptions = [];
        subscriptions.forEach(function(subscription){
            if (subscription.eventName === eventName) {
                if(subscriber && subscriber === subscription.subscriber){
                    foundSubscriptions.push(subscription);
                } else {
                    foundSubscriptions.push(subscription);
                }
            }
        });
        return foundSubscriptions;
    };

    const sendSubscriptions = function(eventName, payload) {
        const foundSubscriptions = findSubscriptions(eventName);
        foundSubscriptions.forEach(function(subscription){
            subscription.send(payload);
        });
    };

    const validateEventName = function(eventName){
        if(typeof eventName !== 'string'){
            throw new Error('The eventName argument is not a string. Found: ' + typeof eventName);
        }
    };

    const validateSubscriber = function(subscriber){
        if(typeof subscriber !== 'Function'){
            throw new Error('The subscriber argument is not a Function. Found: ' + typeof subscriber);
        }
    };

    const addSubscription = function(subscriber, eventName){
        validateEventName(eventName);
        validateSubscriber(subscriber);
        const duplicateSubscriptions = findSubscriptions(eventName, subscriber);
        if(duplicateSubscriptions.length > 0) {
            return;
        }
        const subscription = makeSubscription(subscriber, eventName);
        subscriptions.push(subscription);
    };

    const removeSubscription = function (subscriber, eventName) {
        validateEventName(eventName);
        validateSubscriber(subscriber);
        for (let i = 0; i < subscriptions.length; i++){
            let subscription = subscriptions[i];
            if(subscription.eventName === eventName && subscription.subscriber === subscriber){
                subscriptions.splice(i, 1);
                i=-1;
            }
        }
    };

    const subscribe = function (subscriber) {
        const curryTo = function (subscriber) {
            const to = function(eventName){
                addSubscription(subscriber, eventName);
            };
            return {to: to};
        };
        if(typeof subscriber !== 'function'){
            throw new Error('The subscriber argument is not a function. Found: ' + typeof subscriber);
        }
        return curryTo(subscriber);
    };

    const unSubscribe = function (subscriber) {
        validateSubscriber(subscriber);
        const curryFrom = function (subscriber) {
            const from = function (eventName) {
                removeSubscription(subscriber, eventName);
            };
            return {from: from};
        };
        return curryFrom(subscriber);
    };

    const publish = function (eventName, payload) {
        validateEventName(eventName);
        sendSubscriptions(eventName, payload);
    };

    return {
        subscribe: subscribe,
        publish: publish,
        unSubscribe: unSubscribe
    };

}

const AppBusFactory = {
    new: function(){
        return AppBus();
    }
};

module.exports = AppBusFactory;