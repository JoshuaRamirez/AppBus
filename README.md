# AppBus

[![CI](https://github.com/JoshuaRamirez/AppBus/actions/workflows/test.yml/badge.svg)](https://github.com/JoshuaRamirez/AppBus/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/app-bus.svg)](https://www.npmjs.com/package/app-bus)
[![license](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

An in-memory publish/subscribe bus for JavaScript and TypeScript.

AppBus is tiny, synchronous and dependency free. It supports typed events and works in both Node.js and browsers.

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
- Strongly typed events when used with TypeScript

## Installation
```bash
npm install app-bus --save
```
Both ESM and CommonJS builds are provided. Use `import` or `require` depending on your environment.

## Quick Start
```js
import AppBusFactory from 'app-bus'; // or const AppBusFactory = require('app-bus');

const bus = AppBusFactory.new();

bus.subscribe(payload => {
  console.log('greeted:', payload);
}).to('greet');

bus.publish('greet').with('hello').now();
```

## TypeScript Example
```ts
import AppBusFactory from 'app-bus';

interface Events {
  'user.created': { id: number };
  'user.deleted': { id: number };
}

const typedBus = AppBusFactory.new<Events>();
typedBus.subscribe(e => console.log(e.id)).to('user.created');
typedBus.publish('user.created').with({ id: 1 }).now();
```

## API Reference
- `AppBusFactory.new<T>()` – Create a new bus. Optional generic `T` gives type safety.
- `subscribe(fn).to(event)` – Register a subscriber for an event.
- `once(fn).to(event)` – Subscribe for a single publication.
- `unSubscribe(fn).from(event)` – Remove a subscriber.
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
Update the version and release notes, then run `npm run release -- --dry-run` to validate the exact npm artifact. Commit and tag the release (for example `v2.3.1`) before running `npm run release`. Publishing requires an npm account with access to `app-bus`; use `npm login` first when needed.

## Release Notes
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
