interface Publication {
    eventName: string;
    payload?: unknown;
}

type RuntimeSubscriber = (payload?: unknown) => void;

interface Subscription {
    subscriber: RuntimeSubscriber;
    eventName: string;
    once: boolean;
    send: RuntimeSubscriber;
}

type EventName<Events extends object> = Extract<keyof Events, string>;
type EventSubscriber<Payload> = (payload: Payload) => void;
type IsAny<Value> = 0 extends (1 & Value) ? true : false;

interface QueueOptions {
    /**
     * Deliver to current subscribers if any exist; otherwise store the
     * publication until the next subscriber arrives, then deliver and discard it.
     */
    all(): void;
    /** Like `all()`, but first drops earlier queued publications for the same event. */
    latest(): void;
}

interface TimingOptions {
    /** Deliver synchronously to current subscribers. Nothing is stored. */
    now(): void;
    /**
     * Deliver to current subscribers, then keep the publication so every future
     * subscriber to this event receives it on subscribe. Only the most recent
     * post per event is kept.
     */
    post(): void;
    /** Deliver in a microtask to whoever is subscribed when it runs. */
    async(): void;
    /** Store the publication until a subscriber exists. */
    queue: QueueOptions;
}

interface WithPayload<Payload> {
    /** Attach a payload, then choose a delivery mode. */
    with(payload: Payload): TimingOptions;
}

/**
 * Every branch keeps `with(...)` so the type stays usable when the event name
 * is a generic parameter (TypeScript then sees the union of all branches).
 * Only events whose payload may be omitted also expose the timing helpers
 * directly on the builder.
 */
type PublishOptions<Payload> =
    IsAny<Payload> extends true
        ? TimingOptions & WithPayload<Payload>
        : [Payload] extends [never]
            ? never
            : [Payload] extends [void]
                ? TimingOptions & WithPayload<Payload>
                : undefined extends Payload
                    ? TimingOptions & WithPayload<Payload>
                    : WithPayload<Payload>;

/** Distributes over `K` so a union of event names is checked per member. */
type PublishOptionsFor<Events extends object, K extends EventName<Events>> = {
    [Name in K]: PublishOptions<Events[Name]>;
}[K];

type SubscriptionSnapshot<
    Events extends object,
    K extends EventName<Events> = EventName<Events>
> = {
    [Name in K]: {
        readonly eventName: Name;
        readonly subscriber: EventSubscriber<Events[Name]>;
    }
}[K];

interface ClearOptions<Events extends object> {
    /** Discard stored posts. */
    posts: {
        all(): void;
        byEventName(eventName: EventName<Events>): void;
    };
    /** Discard queued publications. */
    queue: {
        all(): void;
        byEventName(eventName: EventName<Events>): void;
    };
    /** Remove subscriptions. Posts and queued publications are kept. */
    subscriptions: {
        all(): void;
        byEventName(eventName: EventName<Events>): void;
    };
}

/**
 * An in-memory publish/subscribe bus. `Events` maps event names to payload
 * types; every method infers its payload type from the event name.
 */
export interface TypedAppBus<Events extends object> {
    /**
     * Register `subscriber` for `eventName`. Registering the same function
     * twice for the same event is ignored. Any posted publication for the event
     * is delivered to the new subscriber immediately, followed by any queued
     * publications.
     */
    subscribe<K extends EventName<Events>>(
        eventName: K,
        subscriber: EventSubscriber<Events[K]>
    ): void;
    /**
     * Like `subscribe`, but the subscription is removed before its first
     * delivery. A `once` and a persistent subscription of the same function
     * may coexist.
     */
    once<K extends EventName<Events>>(
        eventName: K,
        subscriber: EventSubscriber<Events[K]>
    ): void;
    /** Remove every subscription of `subscriber` for `eventName`, persistent or `once`. */
    unsubscribe<K extends EventName<Events>>(
        eventName: K,
        subscriber: EventSubscriber<Events[K]>
    ): void;
    /** @deprecated Use `unsubscribe`. Alias retained for 2.x compatibility. */
    unSubscribe<K extends EventName<Events>>(
        eventName: K,
        subscriber: EventSubscriber<Events[K]>
    ): void;
    /**
     * Start a publication. Call `.with(payload)` then a delivery mode. Events
     * whose payload is `void`, optional, or `any` may skip `.with(...)`.
     */
    publish<K extends EventName<Events>>(eventName: K): PublishOptionsFor<Events, K>;
    /** Remove every subscription on the bus. Posts and queued publications are kept. */
    unsubscribeAll(): void;
    /** Read-only snapshot of the subscriptions for one event. */
    getSubscriptions<K extends EventName<Events>>(
        eventName: K
    ): SubscriptionSnapshot<Events, K>[];
    /** Read-only snapshot of every subscription on the bus. */
    getSubscriptions(): SubscriptionSnapshot<Events>[];
    /** Discard stored state by kind and, optionally, by event name. */
    clear: ClearOptions<Events>;
}

/**
 * Event map used when `AppBusFactory.new()` is called without one: any event
 * name, any payload. Type checking at the bus boundary is opt-in by supplying
 * a map; the in-memory store is untyped either way.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UntypedEvents = Record<string, any>;

function AppBus() {
    const postedPublications: Publication[] = [];
    const queuedPublications: Publication[] = [];
    const subscriptions: Subscription[] = [];

    const makeSubscription = (subscriber: RuntimeSubscriber, eventName: string, once: boolean): Subscription => {
        const subscription: Subscription = {
            subscriber,
            eventName,
            once,
            send: (payload?: unknown) => {
                subscriber.apply(null, [payload]);
            }
        };
        if (once) {
            subscription.send = (payload?: unknown) => {
                // A nested publish may already have consumed this subscription;
                // deliver only if it was still registered.
                if (removeSubscriptionEntry(subscription)) {
                    subscriber.apply(null, [payload]);
                }
            };
        }
        return subscription;
    };

    const isSubscribed = (subscription: Subscription) => subscriptions.indexOf(subscription) !== -1;

    const findSubscriptions = (eventName: string, subscriber?: RuntimeSubscriber): Subscription[] => {
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

    const publishToSubscribers = (eventName: string, payload?: unknown) => {
        const found = findSubscriptions(eventName);
        found.forEach(subscription => {
            subscription.send(payload);
        });
    };

    const publishAsync = (eventName: string, payload?: unknown) => {
        queueMicrotask(() => publishToSubscribers(eventName, payload));
    };

    // Queued publications are replayed only to the subscription that was just
    // added; existing subscribers already received them when they were queued.
    const processQueuedPublications = (subscription: Subscription) => {
        for (let i = 0; i < queuedPublications.length;) {
            const queuedPublication = queuedPublications[i];
            if (queuedPublication.eventName !== subscription.eventName) {
                i += 1;
                continue;
            }
            if (!isSubscribed(subscription)) {
                return;
            }
            queuedPublications.splice(i, 1);
            try {
                subscription.send(queuedPublication.payload);
            } catch (error) {
                // Delivery failed: keep the publication for a later subscriber.
                queuedPublications.splice(Math.min(i, queuedPublications.length), 0, queuedPublication);
                throw error;
            }
        }
    };

    // Posted publications are replayed only to the subscription that was just
    // added, so a subscriber that subscribes during delivery cannot trigger a
    // second delivery to subscribers that already received the post.
    const processPostedPublications = (subscription: Subscription) => {
        for (let i = 0; i < postedPublications.length; i++) {
            const postedPublication = postedPublications[i];
            if (postedPublication.eventName === subscription.eventName) {
                if (!isSubscribed(subscription)) {
                    return;
                }
                subscription.send(postedPublication.payload);
            }
        }
    };

    const validateEventName = (eventName: string) => {
        if (typeof eventName !== 'string') {
            throw new Error('The eventName argument is not a string. Found: ' + typeof eventName);
        }
    };

    const validateSubscriber: (
        subscriber: unknown
    ) => asserts subscriber is RuntimeSubscriber = subscriber => {
        if (typeof subscriber !== 'function') {
            throw new Error('The subscriber argument is not a Function. Found: ' + typeof subscriber);
        }
    };

    const addSubscription = (subscriber: RuntimeSubscriber, eventName: string, once = false) => {
        const duplicate = findSubscriptions(eventName, subscriber).some(
            subscription => subscription.once === once
        );
        if (duplicate) {
            return;
        }
        const subscription = makeSubscription(subscriber, eventName, once);
        subscriptions.push(subscription);
        processPostedPublications(subscription);
        processQueuedPublications(subscription);
    };

    const removeSubscriptionEntry = (subscription: Subscription): boolean => {
        const index = subscriptions.indexOf(subscription);
        if (index === -1) {
            return false;
        }
        subscriptions.splice(index, 1);
        return true;
    };

    const removeSubscription = (subscriber: RuntimeSubscriber, eventName: string) => {
        for (let i = 0; i < subscriptions.length; i++) {
            const subscription = subscriptions[i];
            if (subscription.eventName === eventName && subscription.subscriber === subscriber) {
                subscriptions.splice(i, 1);
                i -= 1;
            }
        }
    };

    const postPublication = (eventName: string, payload?: unknown) => {
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

    const queuePublication = (eventName: string, payload?: unknown) => {
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

    const queueOnlyLatestPublication = (eventName: string, payload?: unknown) => {
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

    const curryTo = (subscriber: RuntimeSubscriber) => {
        return {
            to: (eventName: string) => {
                addSubscription(subscriber, eventName);
            }
        };
    };

    const curryOnce = (subscriber: RuntimeSubscriber) => {
        return {
            to: (eventName: string) => {
                addSubscription(subscriber, eventName, true);
            }
        };
    };

    const curryFrom = (subscriber: RuntimeSubscriber) => {
        return {
            from: (eventName: string) => {
                removeSubscription(subscriber, eventName);
            }
        };
    };

    const curryQueueOptions = (eventName: string, payload?: unknown) => {
        return {
            all: () => {
                queuePublication(eventName, payload);
            },
            latest: () => {
                queueOnlyLatestPublication(eventName, payload);
            }
        };
    };

    const curryTimingOptions = (eventName: string, payload?: unknown) => {
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
            ...curryTimingOptions(eventName),
            with: (payload: unknown) => {
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

    const subscribe = (eventNameOrSubscriber: string | RuntimeSubscriber, subscriber?: unknown) => {
        if (typeof eventNameOrSubscriber === 'function') {
            return curryTo(eventNameOrSubscriber);
        }
        validateEventName(eventNameOrSubscriber);
        validateSubscriber(subscriber);
        addSubscription(subscriber, eventNameOrSubscriber);
    };

    const once = (eventNameOrSubscriber: string | RuntimeSubscriber, subscriber?: unknown) => {
        if (typeof eventNameOrSubscriber === 'function') {
            return curryOnce(eventNameOrSubscriber);
        }
        validateEventName(eventNameOrSubscriber);
        validateSubscriber(subscriber);
        addSubscription(subscriber, eventNameOrSubscriber, true);
    };

    const unsubscribe = (eventNameOrSubscriber: string | RuntimeSubscriber, subscriber?: unknown) => {
        if (typeof eventNameOrSubscriber === 'function') {
            return curryFrom(eventNameOrSubscriber);
        }
        validateEventName(eventNameOrSubscriber);
        validateSubscriber(subscriber);
        removeSubscription(subscriber, eventNameOrSubscriber);
    };

    const unsubscribeAll = () => {
        clearAllSubscriptions();
    };

    const snapshot = (subscription: Subscription) => ({
        eventName: subscription.eventName,
        subscriber: subscription.subscriber
    });

    const getSubscriptionsList = (eventName?: string) => {
        if (eventName !== undefined) {
            return findSubscriptions(eventName).map(snapshot);
        }
        return subscriptions.map(snapshot);
    };

    const publish = (eventName: string) => {
        validateEventName(eventName);
        return curryPublishOptions(eventName);
    };

    return {
        subscribe,
        once,
        publish,
        unsubscribe,
        unSubscribe: unsubscribe,
        unsubscribeAll,
        getSubscriptions: getSubscriptionsList,
        clear: clearOptions
    };
}

const AppBusFactory = {
    /**
     * Create a bus. `E` maps event names to payload types; every method on the
     * returned bus is checked against it. Omit it for an untyped bus.
     */
    new: <E extends object = UntypedEvents>() => {
        return AppBus() as unknown as TypedAppBus<E>;
    }
};

export default AppBusFactory;
