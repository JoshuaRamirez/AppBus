import AppBusFactory from '@redjay/app-bus';

interface Events {
  ready: void;
}

const bus = AppBusFactory.new<Events>();
type Bus = typeof bus;
const same: Bus = bus;
same.publish('ready').now();
