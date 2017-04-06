function AppBus() {

    const postedPublications = [];
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

    const findSubscriptions = function (eventName, subscriber) {
        const foundSubscriptions = [];
        subscriptions.forEach(function (subscription) {
            if (subscription.eventName === eventName) {
                if (subscriber) {
                    if (subscription.subscriber === subscriber) {
                        foundSubscriptions.push(subscription);
                    }
                } else {
                    foundSubscriptions.push(subscription);
                }
            }
        });
        return foundSubscriptions;
    };

    const publishToSubscribers = function (eventName, payload) {
        const foundSubscriptions = findSubscriptions(eventName);
        foundSubscriptions.forEach(function (subscription) {
            subscription.send(payload);
        });
    };

    const processQueuedPublications = function (eventName) {
        for (let i = 0; i < queuedPublications.length; i++) {
            let queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName === eventName) {
                publishToSubscribers(queuedPublication.eventName, queuedPublication.payload);
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
    };

    const processPostedPublications = function (eventName) {
        for (let i = 0; i < postedPublications.length; i++) {
            let postedPublication = postedPublications[i];
            if (postedPublication.eventName === eventName) {
                publishToSubscribers(postedPublication.eventName, postedPublication.payload);
            }
        }
    };

    const validateEventName = function (eventName) {
        if (typeof eventName !== 'string') {
            throw new Error('The eventName argument is not a string. Found: ' + typeof eventName);
        }
    };

    const validateSubscriber = function (subscriber) {
        if (typeof subscriber !== 'function') {
            throw new Error('The subscriber argument is not a Function. Found: ' + typeof subscriber);
        }
    };

    const addSubscription = function (subscriber, eventName) {
        const duplicateSubscriptions = findSubscriptions(eventName, subscriber);
        if (duplicateSubscriptions.length > 0) {
            return;
        }
        const subscription = makeSubscription(subscriber, eventName);
        subscriptions.push(subscription);
        processPostedPublications(eventName);
        processQueuedPublications(eventName);
    };

    const removeSubscription = function (subscriber, eventName) {
        for (let i = 0; i < subscriptions.length; i++) {
            let subscription = subscriptions[i];
            if (subscription.eventName === eventName && subscription.subscriber === subscriber) {
                subscriptions.splice(i, 1);
                i -= 1;
            }
        }
    };

    const postPublication = function (eventName, payload) {
        const publication = {
            eventName: eventName,
            payload: payload
        };
        const foundSubscriptions = findSubscriptions(eventName);
        if (foundSubscriptions.length) {
            publishToSubscribers(eventName, payload);
        }
        for (let i = 0; i < postedPublications.length; i++) {
            let postedPublication = postedPublications[i];
            if (postedPublication.eventName === eventName) {
                postedPublications.splice(i, 1);
                i -= 1;
            }
        }
        postedPublications.push(publication);
    };

    const queuePublication = function (eventName, payload) {
        const publication = {
            eventName: eventName,
            payload: payload
        };
        const foundSubscriptions = findSubscriptions(eventName);
        if (foundSubscriptions.length) {
            publishToSubscribers(eventName, payload);
        } else {
            queuedPublications.push(publication);
        }
    };

    const queueOnlyLatestPublication = function (eventName, payload) {
        for (let i = 0; i < queuedPublications.length; i++) {
            let queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName === eventName) {
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
        queuePublication(eventName, payload);
    };

    const clearAllSubscriptions = function () {
        subscriptions.splice(0, subscriptions.length);
    };

    const clearAllQueuedPublications = function () {
        queuedPublications.splice(0, queuedPublications.length);
    };

    const clearAllPostedPublications = function () {
        postedPublications.splice(0, postedPublications.length);
    };

    const clearSubscriptionsByEventName = function (eventName) {
        for (let i = 0; i < subscriptions.length; i++) {
            let subscription = subscriptions[i];
            if (subscription.eventName === eventName) {
                subscriptions.splice(i, 1);
                i -= 1;
            }
        }
    };

    const clearQueuedPublicationsByEventName = function (eventName) {
        for (let i = 0; i < queuedPublications.length; i++) {
            let queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName === eventName) {
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
    };

    const clearPostedPublicationsByEventName = function (eventName) {
        for (let i = 0; i < postedPublications.length; i++) {
            let postedPublication = postedPublications[i];
            if (postedPublication.eventName === eventName) {
                postedPublications.splice(i, 1);
                i -= 1;
            }
        }
    };

    const curryTo = function (subscriber) {
        return {
            to: function (eventName) {
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
            all: function () {
                queuePublication(eventName, payload);
            },
            latest: function () {
                queueOnlyLatestPublication(eventName, payload);
            }
        };
    };

    const curryTimingOptions = function (eventName, payload) {
        return {
            now: function () {
                publishToSubscribers(eventName, payload);
            },
            post: function () {
                postPublication(eventName, payload);
            },
            queue: curryQueueOptions(eventName, payload),
        };
    };

    const curryPublishOptions = function (eventName) {
        return {
            now: function () {
                publishToSubscribers(eventName);
            },
            queue: curryQueueOptions(eventName),
            post: function () {
                postPublication(eventName);
            },
            with: function (payload) {
                return curryTimingOptions(eventName, payload);
            }
        };
    };

    const clearOptions = {
        posts: {
            all: clearAllPostedPublications,
            byEventName: clearPostedPublicationsByEventName
        },
        queue: {
            all: clearAllQueuedPublications,
            byEventName: clearQueuedPublicationsByEventName
        },
        subscriptions: {
            all: clearAllSubscriptions,
            byEventName: clearSubscriptionsByEventName
        }
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
        unSubscribe: unSubscribe,
        clear: clearOptions
    };

}

const AppBusFactory = {
    new: function () {
        return AppBus();
    }
};

module.exports = AppBusFactory;