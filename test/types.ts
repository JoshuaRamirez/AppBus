import AppBusFactory from '@redjay/app-bus';

interface Events {
  'user.created': { id: number };
}

const bus = AppBusFactory.new<Events>();

bus.subscribe(payload => {
  const id: number = payload.id;
  void id;
}).to('user.created');

bus.publish('user.created').with({ id: 1 }).now();
