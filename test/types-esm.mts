import AppBusFactory from '@redjay/app-bus';
import type { TypedAppBus } from '@redjay/app-bus';

interface Events {
  ready: void;
}

const bus: TypedAppBus<Events> = AppBusFactory.new<Events>();
bus.publish('ready').now();
