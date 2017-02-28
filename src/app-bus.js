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

    const sendSubscriptions = function (eventName, payload) {
        subscriptions.forEach(function(subscription){
            if (subscription.eventName === eventName) {
                subscription.send(payload);
            }
        });
    };

    const curryTo = function (subscriber) {

        //TODO: Ensure unique subscriptions?
        const to = function (eventName) {
            const subscription = makeSubscription(subscriber, eventName);
            if(typeof eventName !== 'string'){
                throw new Error('Event name is not a string. Found: ' + typeof eventName);
            }
            subscriptions.push(subscription);
        };

        return {
            to: to
        };

    };

    const curryFrom = function (subscriber) {

        const from = function (eventName) {
            if(typeof eventName !== 'string'){
                throw new Error('Event name is not a string. Found: ' + typeof eventName);
            }
            for (let i = 0; i < subscriptions.length; i++){
                let subscription = subscriptions[i];
                if(subscription.eventName === eventName && subscription.subscriber === subscriber){
                    subscriptions.splice(i, 1);
                    i=-1;
                }
            }
        };

        return {
            from: from
        };

    };

    //Usage: AppBus.unSubscribe(subscriber).from(eventName)
    const subscribe = function (subscriber) {
        if(typeof subscriber !== 'function'){
            throw new Error('The subscriber argument is not a function. Found: ' + typeof subscriber);
        }
        return curryTo(subscriber);
    };

    //Usage: AppBus.unSubscribe(subscriber).from(eventName)
    const unSubscribe = function (subscriber) {
        if(typeof subscriber !== 'function'){
            throw new Error('The subscriber argument is not a function. Found: ' + typeof subscriber);
        }
        return curryFrom(subscriber);
    };

    const publish = function (eventName, payload) {
        if(typeof eventName !== 'string') {
            throw new Error('The eventName argument is not a string. Found: ' + typeof eventName);
        }
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

const instance = AppBus();

export {AppBusFactory};
export default instance;