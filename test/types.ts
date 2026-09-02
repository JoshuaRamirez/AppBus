import AppBusFactory from '@redjay/app-bus';
import type { TypedAppBus } from '@redjay/app-bus';

interface Events {
  'user.created': { id: number };
  'user.renamed': { name: string };
  'sync.completed': void;
  'cache.updated': { key: string } | undefined;
  'internal.impossible': never;
}

interface UnsafeEvents {
  unsafe: any;
}

const bus = AppBusFactory.new<Events>();
const unsafeBus = AppBusFactory.new<UnsafeEvents>();

unsafeBus.publish('unsafe').now();
unsafeBus.publish('unsafe').with({ userControlled: true }).now();

bus.subscribe('user.created', payload => {
  const id: number = payload.id;
  void id;
});

bus.publish('user.created').with({ id: 1 }).now();

bus.once('user.renamed', payload => {
  const name: string = payload.name;
  void name;
});

const renamedSubscriber = (payload: Events['user.renamed']) => {
  void payload.name;
};
bus.subscribe('user.renamed', renamedSubscriber);
bus.unsubscribe('user.renamed', renamedSubscriber);

bus.publish('sync.completed').now();
bus.publish('cache.updated').now();
bus.publish('cache.updated').with({ key: 'users' }).async();

const subscriptions = bus.getSubscriptions('user.created');
// @ts-expect-error Subscription snapshots are immutable.
subscriptions[0].eventName = 'user.renamed';

// Generic wrappers around the factory compile.
function makeBus<E extends object>(): TypedAppBus<E> {
  return AppBusFactory.new<E>();
}
const wrapped = makeBus<Events>();
wrapped.publish('sync.completed').now();

// typeof on an instance is the same type as the exported interface.
type Bus = typeof bus;
const viaTypeof: Bus = bus;
const viaInterface: TypedAppBus<Events> = viaTypeof;
void viaInterface;

// Generic emit helpers compile: `.with(...)` is always available.
function emit<K extends keyof Events>(eventName: K, payload: Events[K]) {
  bus.publish(eventName).with(payload).now();
}
emit('user.created', { id: 2 });

// A union of event names is checked per member, not on the union of payloads.
declare const createdOrCompleted: 'user.created' | 'sync.completed';
// @ts-expect-error One member of the union requires a payload.
bus.publish(createdOrCompleted).now();

declare const completedOrUpdated: 'sync.completed' | 'cache.updated';
bus.publish(completedOrUpdated).now();

// A bus created without an event map is untyped: any name, any payload.
const untyped = AppBusFactory.new();
untyped.subscribe('greet', payload => void payload);
untyped.publish('greet').now();
untyped.publish('greet').with({ anything: true }).now();
untyped.once('other', (payload: number) => void payload);
// @ts-expect-error Unknown event names are rejected.
bus.publish('user.missing');
// @ts-expect-error Events with required payloads cannot publish without one.
bus.publish('user.created').now();
// @ts-expect-error Payloads must match their event.
bus.publish('user.created').with({ name: 'Ada' });
// @ts-expect-error Subscriber payloads are inferred from the event name.
bus.subscribe('user.created', (payload: Events['user.renamed']) => void payload);
// @ts-expect-error Events with impossible payloads cannot be published.
bus.publish('internal.impossible').now();
