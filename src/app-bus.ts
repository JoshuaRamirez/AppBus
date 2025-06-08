interface Publication {
    eventName: string;
    payload?: any;
}

interface Subscription {
    subscriber: (payload?: any) => void;
    eventName: string;
    send: (payload?: any) => void;
}

export interface TypedAppBus<Events extends Record<string, any>> {
    subscribe<K extends keyof Events>(
        subscriber: (payload: Events[K]) => void
    ): { to: (eventName: K) => void };
    once<K extends keyof Events>(
        subscriber: (payload: Events[K]) => void
    ): { to: (eventName: K) => void };
    unSubscribe<K extends keyof Events>(
        subscriber: (payload: Events[K]) => void
    ): { from: (eventName: K) => void };
    publish<K extends keyof Events>(eventName: K): {
        now: () => void;
        post: () => void;
        async: () => void;
        queue: {
            all: () => void;
            latest: () => void;
        };
        with: (payload: Events[K]) => {
            now: () => void;
            post: () => void;
            async: () => void;
            queue: {
                all: () => void;
                latest: () => void;
            };
        };
    };
    unsubscribeAll(): void;
    getSubscriptions(eventName?: keyof Events): unknown[];
    clear: any;
}

function AppBus() {
    const postedPublications: Publication[] = [];
    const queuedPublications: Publication[] = [];
    const subscriptions: Subscription[] = [];

    const curryDeliveryJob = (subscriber: (payload?: any) => void) => {
        return (payload?: any) => {
            subscriber.apply(null, [payload]);
        };
    };

    const makeSubscription = (subscriber: (payload?: any) => void, eventName: string): Subscription => {
        const send = curryDeliveryJob(subscriber);
        return {
            subscriber,
            eventName,
            send
        };
    };

    const findSubscriptions = (eventName: string, subscriber?: (payload?: any) => void): Subscription[] => {
        const found: Subscription[] = [];
        subscriptions.forEach(subscription => {
            if (subscription.eventName === eventName) {
                if (subscriber) {
                    if (subscription.subscriber === subscriber) {
                        found.push(subscription);
                    }
                } else {
                    found.push(subscription);
                }
            }
        });
        return found;
    };

    const publishToSubscribers = (eventName: string, payload?: any) => {
        const found = findSubscriptions(eventName);
        found.forEach(subscription => {
            subscription.send(payload);
        });
    };

    const publishAsync = (eventName: string, payload?: any) => {
        queueMicrotask(() => publishToSubscribers(eventName, payload));
    };

    const processQueuedPublications = (eventName: string) => {
        for (let i = 0; i < queuedPublications.length; i++) {
            const queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName === eventName) {
                publishToSubscribers(queuedPublication.eventName, queuedPublication.payload);
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
    };

    const processPostedPublications = (eventName: string) => {
        for (let i = 0; i < postedPublications.length; i++) {
            const postedPublication = postedPublications[i];
            if (postedPublication.eventName === eventName) {
                publishToSubscribers(postedPublication.eventName, postedPublication.payload);
            }
        }
    };

    const validateEventName = (eventName: string) => {
        if (typeof eventName !== 'string') {
            throw new Error('The eventName argument is not a string. Found: ' + typeof eventName);
        }
    };

    const validateSubscriber = (subscriber: unknown) => {
        if (typeof subscriber !== 'function') {
            throw new Error('The subscriber argument is not a Function. Found: ' + typeof subscriber);
        }
    };

    const addSubscription = (subscriber: (payload?: any) => void, eventName: string) => {
        const duplicateSubscriptions = findSubscriptions(eventName, subscriber);
        if (duplicateSubscriptions.length > 0) {
            return;
        }
        const subscription = makeSubscription(subscriber, eventName);
        subscriptions.push(subscription);
        processPostedPublications(eventName);
        processQueuedPublications(eventName);
    };

    const removeSubscription = (subscriber: (payload?: any) => void, eventName: string) => {
        for (let i = 0; i < subscriptions.length; i++) {
            const subscription = subscriptions[i];
            if (subscription.eventName === eventName && subscription.subscriber === subscriber) {
                subscriptions.splice(i, 1);
                i -= 1;
            }
        }
    };

    const postPublication = (eventName: string, payload?: any) => {
        const publication: Publication = {
            eventName,
            payload
        };
        const found = findSubscriptions(eventName);
        if (found.length) {
            publishToSubscribers(eventName, payload);
        }
        for (let i = 0; i < postedPublications.length; i++) {
            const postedPublication = postedPublications[i];
            if (postedPublication.eventName === eventName) {
                postedPublications.splice(i, 1);
                i -= 1;
            }
        }
        postedPublications.push(publication);
    };

    const queuePublication = (eventName: string, payload?: any) => {
        const publication: Publication = {
            eventName,
            payload
        };
        const found = findSubscriptions(eventName);
        if (found.length) {
            publishToSubscribers(eventName, payload);
        } else {
            queuedPublications.push(publication);
        }
    };

    const queueOnlyLatestPublication = (eventName: string, payload?: any) => {
        for (let i = 0; i < queuedPublications.length; i++) {
            const queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName === eventName) {
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
        queuePublication(eventName, payload);
    };

    const clearAllSubscriptions = () => {
        subscriptions.splice(0, subscriptions.length);
    };

    const clearAllQueuedPublications = () => {
        queuedPublications.splice(0, queuedPublications.length);
    };

    const clearAllPostedPublications = () => {
        postedPublications.splice(0, postedPublications.length);
    };

    const clearSubscriptionsByEventName = (eventName: string) => {
        for (let i = 0; i < subscriptions.length; i++) {
            const subscription = subscriptions[i];
            if (subscription.eventName === eventName) {
                subscriptions.splice(i, 1);
                i -= 1;
            }
        }
    };

    const clearQueuedPublicationsByEventName = (eventName: string) => {
        for (let i = 0; i < queuedPublications.length; i++) {
            const queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName === eventName) {
                queuedPublications.splice(i, 1);
                i -= 1;
            }
        }
    };

    const clearPostedPublicationsByEventName = (eventName: string) => {
        for (let i = 0; i < postedPublications.length; i++) {
            const postedPublication = postedPublications[i];
            if (postedPublication.eventName === eventName) {
                postedPublications.splice(i, 1);
                i -= 1;
            }
        }
    };

    const curryTo = (subscriber: (payload?: any) => void) => {
        return {
            to: (eventName: string) => {
                addSubscription(subscriber, eventName);
            }
        };
    };

    const curryOnce = (subscriber: (payload?: any) => void) => {
        return {
            to: (eventName: string) => {
                const wrapper = (payload?: any) => {
                    subscriber(payload);
                    removeSubscription(wrapper, eventName);
                };
                addSubscription(wrapper, eventName);
            }
        };
    };

    const curryFrom = (subscriber: (payload?: any) => void) => {
        return {
            from: (eventName: string) => {
                removeSubscription(subscriber, eventName);
            }
        };
    };

    const curryQueueOptions = (eventName: string, payload?: any) => {
        return {
            all: () => {
                queuePublication(eventName, payload);
            },
            latest: () => {
                queueOnlyLatestPublication(eventName, payload);
            }
        };
    };

    const curryTimingOptions = (eventName: string, payload?: any) => {
        return {
            now: () => {
                publishToSubscribers(eventName, payload);
            },
            async: () => {
                publishAsync(eventName, payload);
            },
            post: () => {
                postPublication(eventName, payload);
            },
            queue: curryQueueOptions(eventName, payload)
        };
    };

    const curryPublishOptions = (eventName: string) => {
        return {
            now: () => {
                publishToSubscribers(eventName);
            },
            async: () => {
                publishAsync(eventName);
            },
            queue: curryQueueOptions(eventName),
            post: () => {
                postPublication(eventName);
            },
            with: (payload: any) => {
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

    const subscribe = (subscriber: (payload?: any) => void) => {
        validateSubscriber(subscriber);
        return curryTo(subscriber);
    };

    const once = (subscriber: (payload?: any) => void) => {
        validateSubscriber(subscriber);
        return curryOnce(subscriber);
    };

    const unSubscribe = (subscriber: (payload?: any) => void) => {
        validateSubscriber(subscriber);
        return curryFrom(subscriber);
    };

    const unsubscribeAll = () => {
        clearAllSubscriptions();
    };

    const getSubscriptionsList = (eventName?: string): Subscription[] => {
        if (eventName) {
            return findSubscriptions(eventName).slice();
        }
        return subscriptions.slice();
    };

    const publish = (eventName: string) => {
        validateEventName(eventName);
        return curryPublishOptions(eventName);
    };

    return {
        subscribe,
        once,
        publish,
        unSubscribe,
        unsubscribeAll,
        getSubscriptions: getSubscriptionsList,
        clear: clearOptions
    };
}

const AppBusFactory = {
    new: <E extends Record<string, any> = Record<string, any>>() => {
        return AppBus() as unknown as TypedAppBus<E>;
    }
};

export default AppBusFactory;
