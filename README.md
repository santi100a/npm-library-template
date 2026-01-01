# Santi's DICT Client

[![Build Status][workflow badge]][repo actions]
[![npm homepage][npm badge]][npm home]
[![GitHub stars][stars badge]][repo url]
[![License][license badge]][repo url]
[![Bundlephobia stats][bundlephobia badge]][bundlephobia url]

[workflow badge]: https://github.com/santi100a/dict-client/actions/workflows/ci.yml/badge.svg
[npm badge]: https://img.shields.io/npm/v/@santi100a/dict-client
[stars badge]: https://img.shields.io/github/stars/santi100a/dict-client.svg
[license badge]: https://img.shields.io/github/license/santi100a/dict-client.svg
[bundlephobia badge]: https://img.shields.io/bundlephobia/min/@santi100a/dict-client

[npm home]: https://npmjs.org/package/@santi100a/dict-client
[repo actions]: https://github.com/santi100a/dict-client/actions
[repo url]: https://github.com/santi100a/dict-client
[bundlephobia url]: https://bundlephobia.com/package/@santi100a/dict-client@latest

## Description

This NPM package is a promise-based DICT (RFC 2229) client used to retrieve word definitions from a DICT server.
Since it needs a raw TCP socket in order to function properly, it is based on the `node:net` module and, thus,
only works on Node.js for now. 

## Installation

- Via NPM: `npm install @santi100a/dict-client`
- Via Yarn: `yarn add @santi100a/dict-client`
- Via PNPM: `pnpm install @santi100a/dict-client`

## Usage examples

```typescript
import { DictClient } from '@santi100a/dict-client';
const { DictClient } = require('@santi100a/dict-client');



```