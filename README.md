# AppBus

[![CI](https://github.com/JoshuaRamirez/AppBus/actions/workflows/test.yml/badge.svg)](https://github.com/JoshuaRamirez/AppBus/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/%40redjay%2Fapp-bus.svg)](https://www.npmjs.com/package/@redjay/app-bus)
[![license](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

An in-memory publish/subscribe bus for JavaScript and TypeScript.

AppBus is tiny, synchronous and dependency free. It supports typed events and works in both Node.js and browsers.

Current releases are published as `@redjay/app-bus`. The unscoped `app-bus` package is retained as the legacy package name.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [TypeScript Example](#typescript-example)
- [API Reference](#api-reference)
- [Tests](#tests)
- [Release Process](#release-process)
- [Release Notes](#release-notes)
- [Contributing](#contributing)

## Features
- Synchronous publish/subscribe API
- Queue or post events for future subscribers
- Optional asynchronous publishing using microtasks
- Mandatory event maps and exact payload inference when used with TypeScript

## Installation
```bash
npm install @redjay/app-bus --save
```
Both ESM and CommonJS builds are provided. Use `import` or `require` depending on your environment.

## Quick Start
```js
import AppBusFactory from '@redjay/app-bus'; // or const AppBusFactory = require('@redjay/app-bus');

const bus = AppBusFactory.new();

bus.subscribe('greet', payload => {
  console.log('greeted:', payload);
});

bus.publish('greet').with('hello').now();
```

JavaScript callers may also use the legacy curried form, `bus.subscribe(fn).to('greet')`
and `bus.unSubscribe(fn).from('greet')`. That form is not part of the TypeScript
API and is kept only for backward compatibility.

## TypeScript Example
```ts
import AppBusFactory from '@redjay/app-bus';

interface Events {
  'user.created': { id: number };
  'user.deleted': { id: number };
}

const typedBus = AppBusFactory.new<Events>();
typedBus.subscribe('user.created', e => console.log(e.id));
typedBus.publish('user.created').with({ id: 1 }).now();
```

TypeScript callers must provide an event map. Event names, subscriber payloads, and
published payloads are then checked together. Events declared as `void` can be
published without `.with(...)`. Using `any` as a payload type explicitly opts that
event out of payload checking. A bus created without an event map cannot publish or
subscribe to anything; the compiler error names the fix.

```ts
import type { TypedAppBus } from '@redjay/app-bus';

function makeBus<E extends object>(): TypedAppBus<E> {
  return AppBusFactory.new<E>();
}
```

## API Reference
- `AppBusFactory.new<T>()` – Create a bus using the required TypeScript event map.
- `subscribe(event, fn)` – Register a subscriber with an inferred payload type. Duplicate registrations of the same function are ignored.
- `once(event, fn)` – Subscribe for a single publication. A once and a persistent subscription of the same function may coexist.
- `unSubscribe(event, fn)` – Remove every subscription of `fn` for the event.
- `getSubscriptions(event?)` – Snapshot of `{ eventName, subscriber }` pairs.
- `publish(event)` – Start a publication builder with helpers:
  - `.with(payload)` – attach data.
  - `.now()` – publish immediately.
  - `.async()` – publish asynchronously.
  - `.queue.all()` – queue multiple events until subscribed.
  - `.queue.latest()` – keep only the most recent queued event.
  - `.post()` – store a publication for the next subscription.
- `clear.subscriptions.byEventName(name)` – Remove subscribers for a name.
- `clear.queue.all()` / `clear.posts.all()` – Reset queued or posted events.

## Tests
Run `npm test` to compile and execute the mocha test suite.

## Release Process
Update the version and release notes, then run `npm run release -- --dry-run` to validate the exact npm artifact. Commit and tag the release (for example `v3.0.0`) before running `npm run release`. Publishing requires an npm account with access to `@redjay/app-bus`; use `npm login` first when needed.

## Release Notes
### 3.0.0
Breaking changes for TypeScript consumers:
- `AppBusFactory.new<Events>()` requires an event map. A bus created without one cannot publish or subscribe; the compiler error names the fix.
- The typed API is event-first: `subscribe(event, fn)`, `once(event, fn)`, `unSubscribe(event, fn)`. The curried `.to()` / `.from()` form remains available to JavaScript callers only.
- Events with a required payload must call `.with(payload)` before `.now()`, `.post()`, `.async()` or `.queue`. A union of event names is checked per member.
- CommonJS type declarations use `export =`; `TypedAppBus` is exported as a type from both entry points.
- `getSubscriptions()` snapshots expose only `eventName` and `subscriber`.
- Package metadata declares `engines.node >= 20`, `type: commonjs`, and `sideEffects: false`.

Fixes:
- A `once` subscriber could be delivered twice when an earlier subscriber republished the same event.
- Subscribing during delivery of a posted publication re-delivered it to existing subscribers and could overflow the stack.
- A queued publication is retained when the subscriber throws during replay.
- `once` and `subscribe` with the same function no longer silently drop one another.
- Generic wrappers around `AppBusFactory.new` and generic `publish(k).with(p)` helpers compile again.
- The CommonJS entry is `dist/cjs/index.cjs`; the ESM build no longer emits stray `.cjs` files.

### 2.3.2
- Moved current releases to the `@redjay/app-bus` package.
- Updated package metadata, documentation, and consumer tests for the scoped name.

### 2.3.1
- Added ISC license
- Trimmed sources from the npm package
- Documented the release process
- Added build, npm and license badges
- CI now runs `npm audit`
- Fixed native ES module resolution
- Added consumer-level CommonJS and ESM package tests
- Hardened the publish lifecycle and cleared dependency audit findings

### 2.3.0
- Added typed events and generics for TypeScript.
- Introduced asynchronous publishing support.
- Improved and consolidated unit test coverage.

### 2.2.0
- Ported the library to TypeScript.
- Builds now output both CommonJS and ES modules.
- Added a compatibility wrapper for `require`.
- Dropped the Grunt/Babel build.

### 2.1.1
- Documentation updates only.

### 2.1.0
- Added posting and clearing APIs for queued events.
- Improved queueing behavior and fixed multi-event bugs.
- Expanded unit tests.

### 1.1.0
- Introduced queued publication support.
- Centralized validation logic.

### 1.0.2
- Module now always exports the factory function.
- Added Travis CI integration and documentation fixes.

### 1.0.0
- Initial release with publish/subscribe API and duplicate subscription handling.

## Contributing
Pull requests are welcome. Please maintain the existing coding style and include unit tests for any changes. Run `npm test` and `npm run build` before submitting.
