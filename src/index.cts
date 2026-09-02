import AppBusFactoryImpl from './app-bus.js';
import type {
    TypedAppBus as TypedAppBusType,
    UntypedEvents as UntypedEventsType
} from './app-bus.js';

const AppBusFactory = AppBusFactoryImpl;

// Type-only namespace merged onto the `export =` value so CommonJS consumers can
// `import { TypedAppBus } from '@redjay/app-bus'` like ESM consumers.
declare namespace AppBusFactory {
    export type TypedAppBus<Events extends object> = TypedAppBusType<Events>;
    export type UntypedEvents = UntypedEventsType;
}

export = AppBusFactory;
