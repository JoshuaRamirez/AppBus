# AppBus

[![CI](https://github.com/JoshuaRamirez/AppBus/actions/workflows/test.yml/badge.svg)](https://github.com/JoshuaRamirez/AppBus/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/%40redjay%2Fapp-bus.svg)](https://www.npmjs.com/package/@redjay/app-bus)
[![license](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

An in-memory publish/subscribe bus for JavaScript and TypeScript.

AppBus is tiny, synchronous and dependency free. It supports typed events and works in Node.js 20 or later and in browsers.

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
and `bus.unsubscribe(fn).from('greet')`. That form is not part of the TypeScript
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

### Creating a bus
- `AppBusFactory.new<Events>()` – Create a bus. `Events` maps event names to payload types and is required in TypeScript.

### Subscribing
- `subscribe(event, fn)` – Register `fn` for `event`. The payload type is inferred from the event map. Registering the same function twice for the same event is ignored. Any posted publication for the event is delivered to the new subscriber immediately, followed by any queued publications.
- `once(event, fn)` – Like `subscribe`, but the subscription is removed before its first delivery. A `once` and a persistent subscription of the same function may coexist.
- `unsubscribe(event, fn)` – Remove every subscription of `fn` for `event`, whether persistent or `once`. `unSubscribe` remains as a deprecated alias.
- `unsubscribeAll()` – Remove every subscription on the bus. Posted and queued publications are kept.
- `getSubscriptions(event?)` – Read-only snapshot of `{ eventName, subscriber }` pairs, for one event or for the whole bus.

### Publishing
`publish(event)` returns a builder. Call `.with(payload)` to attach data, then choose a delivery mode. Events whose payload type is `void`, optional, or `any` may skip `.with(...)`.
- `.now()` – Deliver synchronously to current subscribers. Nothing is stored.
- `.async()` – Deliver in a microtask to whoever is subscribed when it runs.
- `.post()` – Deliver to current subscribers, then keep the publication so every future subscriber to the event receives it on subscribe. Only the most recent post per event is kept.
- `.queue.all()` – Deliver to current subscribers if any exist; otherwise store the publication until the next subscriber arrives, then deliver and discard it. Multiple queued publications are delivered in order.
- `.queue.latest()` – Like `.queue.all()`, but drops any earlier queued publications for the same event first.

If a subscriber throws while a queued publication is being replayed, the publication stays queued and the error propagates from `subscribe`.

### Clearing
- `clear.subscriptions.all()` / `clear.subscriptions.byEventName(event)` – Remove subscriptions.
- `clear.posts.all()` / `clear.posts.byEventName(event)` – Discard stored posts.
- `clear.queue.all()` / `clear.queue.byEventName(event)` – Discard queued publications.

### Exported types
- `TypedAppBus<Events>` – The bus interface, for annotating variables or wrapping the factory.
- `EventMapRequired` – The placeholder event map used when `new()` is called without one. Its single event name is the compiler error message, so you should never need to reference it directly.

## Tests
- `npm test` – build, run the mocha suite, and type-check the consumer tests.
- `npm run test:unit` – the mocha suite alone, against the existing `dist` build.
- `npm run test:types` – type-check the consumer tests in `test/` under CommonJS and ESM resolution.
- `npm run lint` – ESLint over sources, tests, and scripts.
- `npm run typecheck` – type-check both build targets without emitting.
- `npm run test:coverage` – mocha under c8 with an lcov report in `coverage/`; fails below 95% lines and 90% branches.
- `npm run check:package` – build, validate the package with publint and Are The Types Wrong, then install the packed tarball into a throwaway project and load it through both entry points.
- `npm run release:notes` – print the README release-notes section for the current version; fails if it is missing.
- `npm run check` – everything above; this is what the release workflow runs.

CI runs lint, typecheck and coverage, the test matrix on Node 20, 22, and 24 on Linux plus Node 24 on Windows and macOS, and the package checks on every push and pull request. Actions are pinned to commit SHAs; Dependabot opens weekly grouped update PRs for npm and GitHub Actions.

## Release Process
Releases are published by GitHub Actions when a `v*` tag is pushed.

1. Update the version in `package.json` (`npm version <major|minor|patch> --no-git-tag-version`) and add a release-notes entry below.
2. Run `npm run check` locally and commit.
3. Tag and push: `git tag -a v3.0.0 -m "Release 3.0.0" && git push origin master v3.0.0`.

The release workflow verifies that the tag matches the package version and that the version is not already on the registry, runs `npm run check`, publishes to npm with provenance, confirms the version is visible on the registry, and creates a GitHub release whose body is the README release-notes section for that version.

Publishing uses npm trusted publishing. One-time setup on npmjs.com: open the package settings for `@redjay/app-bus`, add a GitHub Actions trusted publisher with owner `JoshuaRamirez`, repository `AppBus`, workflow `release.yml`, and environment `npm`. If an `NPM_TOKEN` repository secret is configured instead, the workflow uses it as a fallback.

Trusted publishing can only be configured for a package that already exists on the registry. The very first publish of a new package name must therefore use a token: either set the `NPM_TOKEN` secret before pushing the tag, or publish once from a machine with `npm login` using `npm run release -- --dry-run` to validate and `npm run release` to publish. Configure the trusted publisher afterwards and remove the token.

npm does not allow a fully unpublished package name to be republished for 24 hours, and a version number that was ever published cannot be reused.

### Testing a release against a local registry
To exercise the exact artifact before it reaches npmjs, publish it to a local registry such as [Verdaccio](https://verdaccio.org/) and install from there:

```bash
npx verdaccio                                   # serves http://localhost:4873
npm adduser --registry http://localhost:4873    # once
npm publish --registry http://localhost:4873
npm install @redjay/app-bus --registry http://localhost:4873   # from a scratch project
```

Unlike npmjs, a local registry lets you `npm unpublish --force` and republish the same version while iterating. The `--registry` flag keeps your default registry untouched.

## Release Notes
### 3.0.0
First version published under `@redjay/app-bus`. The unscoped `app-bus` package ends at 2.1.1 and receives no further releases.

Breaking changes for TypeScript consumers:
- `AppBusFactory.new<Events>()` requires an event map. A bus created without one cannot publish or subscribe; the compiler error names the fix.
- The typed API is event-first: `subscribe(event, fn)`, `once(event, fn)`, `unsubscribe(event, fn)`. The curried `.to()` / `.from()` form remains available to JavaScript callers only.
- `unSubscribe` is renamed `unsubscribe` to match `unsubscribeAll`. The old spelling still works but is marked deprecated.
- Events with a required payload must call `.with(payload)` before `.now()`, `.post()`, `.async()` or `.queue`. A union of event names is checked per member.
- CommonJS type declarations use `export =`; `TypedAppBus` is exported as a type from both entry points.
- `getSubscriptions()` snapshots expose only `eventName` and `subscriber`.
- Package metadata declares `engines.node >= 20`, `type: commonjs`, and `sideEffects: false`.
- The exports map exposes `./package.json` for tooling that reads a dependency's manifest.

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
Pull requests are welcome. Please maintain the existing coding style and include unit tests for any changes. Run `npm run check` before submitting; it is the same gate CI and the release workflow apply. Commit messages follow the `type(scope): summary` convention used in the history, for example `fix(bus): ...` or `docs: ...`.
