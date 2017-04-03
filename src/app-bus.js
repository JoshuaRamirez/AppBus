function AppBus() {

    const queuedPublications = [];
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

    const publishToSubscribers = function(eventName, payload) {
        const foundSubscriptions = findSubscriptions(eventName);
        foundSubscriptions.forEach(function(subscription){
            subscription.send(payload);
        });
    };

    const processQueuedPublications = function() {
        for (let queuedPublicationIndex = 0; queuedPublicationIndex < queuedPublications.length; queuedPublicationIndex++) {
            let queuedPublication = queuedPublications[queuedPublicationIndex];
            for (let subscriptionIndex = 0; subscriptionIndex < subscriptions.length; subscriptionIndex++){
                let subscription = subscriptions[subscriptionIndex];
                if(queuedPublication.eventName === subscription.eventName){
                    publishToSubscribers(queuedPublication.eventName, queuedPublication.payload);
                    queuedPublications.splice(queuedPublicationIndex, 1);
                    queuedPublicationIndex -= 1;
                }
            }
        }
    };

    const validateEventName = function(eventName){
        if(typeof eventName !== 'string'){
            throw new Error('The eventName argument is not a string. Found: ' + typeof eventName);
        }
    };

    const validateSubscriber = function(subscriber){
        if(typeof subscriber !== 'function'){
            throw new Error('The subscriber argument is not a Function. Found: ' + typeof subscriber);
        }
    };

    const addSubscription = function(subscriber, eventName){
        const duplicateSubscriptions = findSubscriptions(eventName, subscriber);
        if(duplicateSubscriptions.length > 0) {
            return;
        }
        const subscription = makeSubscription(subscriber, eventName);
        subscriptions.push(subscription);
        processQueuedPublications();
    };

    const removeSubscription = function (subscriber, eventName) {
        for (let i = 0; i < subscriptions.length; i++){
            let subscription = subscriptions[i];
            if(subscription.eventName === eventName && subscription.subscriber === subscriber){
                subscriptions.splice(i, 1);
                i-=1;
            }
        }
    };

    const queuePublication = function (eventName, payload) {
        const publication = {
            eventName: eventName,
            payload: payload
        };
        const foundSubscriptions = findSubscriptions(eventName);
        if(foundSubscriptions.length){
            publishToSubscribers(eventName, payload);
        } else {
            queuedPublications.push(publication);
        }

    };

    const queueOnlyLatestPublication = function (eventName, payload) {
        for (let i = 0; queuedPublications.length; i++){
            let queuedPublication = queuedPublications[i];
            if(queuedPublication.eventName === eventName){
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
        queuePublication(eventName, payload);
    };

    const curryTo = function (subscriber) {
        return {
            to: function(eventName){
                addSubscription(subscriber, eventName);
            }
        };
    };

    const curryFrom = function (subscriber) {
        return {
            from: function (eventName) {
                removeSubscription(subscriber, eventName);
            }
        };
    };

    const curryQueueOptions = function (eventName, payload) {
        return {
            all: function(){
                queuePublication(eventName, payload);
            },
            latest: function(){
                queueOnlyLatestPublication(eventName, payload);
            },
        };
    };

    const curryTimingOptions = function (eventName, payload) {
        return {
            now: function(){
                publishToSubscribers(eventName, payload);
            },
            queue: curryQueueOptions(eventName, payload)
        };
    };

    const curryPublishOptions = function (eventName) {
        return {
            now: function(){
                publishToSubscribers(eventName);
            },
            queue: curryQueueOptions(eventName),
            with: function (payload) {
                return curryTimingOptions(eventName, payload);
            }
        };
    };

    const subscribe = function (subscriber) {
        validateSubscriber(subscriber);
        return curryTo(subscriber);
    };

    const unSubscribe = function (subscriber) {
        validateSubscriber(subscriber);
        return curryFrom(subscriber);
    };

    const publish = function (eventName) {
        validateEventName(eventName);
        return curryPublishOptions(eventName);
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