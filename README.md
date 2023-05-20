# `xdelta3-wasm`

Create efficiently compressed deltas (diffs) between any kinds of data, in the browser or Node.js!

This is a wrapper around the [`xdelta3`](https://github.com/jmacd/xdelta) library, which has been compiled to WebAssembly with Emscripten and [`@rollup/plugin-wasm`](https://github.com/rollup/plugins/tree/master/packages/wasm).

## Usage

First, install the package:

```
yarn add xdelta3-wasm
```

### Creating a delta

A delta is a result of an `input` and a `source` - the delta is calculated relative to the `source` data, and can be applied to the `source` to get the `input` data.

You can use any kind of data that can be represented as binary; for this example we'll use strings.

```ts
import { init, xd3_encode_memory, xd3_smatch_cfg } from "xdelta3-wasm";

await init();

const source = "Hello, world!";
const input = "Hello, world! This is a test. Hello, world!";

const textEncoder = new TextEncoder();
const sourceBytes = new Uint8Array(source.length);
textEncoder.encodeInto(source, sourceBytes);
const inputBytes = new Uint8Array(input.length);
textEncoder.encodeInto(input, inputBytes);

const delta = xd3_encode_memory(inputBytes, sourceBytes, 9999, xd3_smatch_cfg.DEFAULT);

console.log(delta);
// {
//   ret: 0,
//   str: 'SUCCESS',
//   output: Uint8Array(48) [
//     214, 195, 196,   0,   0,   1,  13,   0,  39,  43,
//       0,  30,   3,   1,  32,  84, 104, 105, 115,  32,
//     105, 115,  32,  97,  32, 116, 101, 115, 116,  46,
//      32,  72, 101, 108, 108, 111,  44,  32, 119, 111,
//     114, 108, 100,  33,  29,   1,  30,   0
//   ]
// }
```

### Applying a delta

Once we have a delta, we can apply it to the source to get the input back. Continuing our previous example:

```ts
const orig = xd3_decode_memory(result.output, sourceBytes, 9999);
console.log(orig);
// {
//   ret: 0,
//   str: 'SUCCESS',
//   output: Uint8Array(43) [
//      72, 101, 108, 108, 111,  44,  32, 119, 111,
//     114, 108, 100,  33,  32,  84, 104, 105, 115,
//      32, 105, 115,  32,  97,  32, 116, 101, 115,
//     116,  46,  32,  72, 101, 108, 108, 111,  44,
//      32, 119, 111, 114, 108, 100,  33
//   ]
// }
console.log(new TextDecoder().decode(orig.output));
// Hello, world! This is a test. Hello, world!
```

## Development

### Building

To build the C components, you'll need to have the Emscripten SDK set up.

```sh
yarn make-native
yarn build
```

### Testing

```sh
yarn test
```

## Related

- [xdelta-async-nodejs-addon](https://github.com/ably/xdelta-async-nodejs-addon): Asynchronous native addon for Node.js