import wasm from "./native/xdelta3.wasm";

export enum xd3_smatch_cfg {
    DEFAULT = 0,
    SLOW,
    FAST,
    FASTER,
    FASTEST,
    SOFT
};

export enum WASI_ERRNO {
    SUCCESS = 0,
    ENOMEM = 48,
    ENOSPC = 51
}

const initPromise = wasm({});

export const init = async () => { await initPromise };

let _w: Awaited<ReturnType<typeof wasm>>;

initPromise.then((w) => {
    _w = w;
});

type Exports = {
    malloc: (size: number) => number,
    free: (ptr: number) => void,
    xd3_encode_memory: Function,
    xd3_decode_memory: Function,
    xd3_strerror: (code: number) => number,
    memory: WebAssembly.Memory
}

let _memory_view: DataView;
const exports = new Proxy({} as Exports & { memory_view: DataView }, {
    get(_, prop) {
        if(!_w) throw new Error("WASM not initialized - await init() first");
        return prop === "memory_view" ? (_memory_view ?? (_memory_view = new DataView(_w.instance.exports["memory"].buffer))) : _w.instance.exports[prop as string];
    }
});

const writeToMemoryAt = (ptr: number, data: Uint8Array) => {
    (new Uint8Array(exports.memory.buffer, ptr, data.byteLength)).set(data);
};

const readFromMemoryAt = (ptr: number, length: number) => {
    return new Uint8Array(exports.memory.buffer, ptr, length);
};

const readCStrAt = (ptr: number) => {
    let b = ptr;
    for(; exports.memory_view.getUint8(b) !== 0; b++) {};

    return new TextDecoder().decode(new Uint8Array(exports.memory.buffer, ptr, b - ptr));
};

const getCodeStr = (code: number) => code in WASI_ERRNO ? WASI_ERRNO[code] : readCStrAt(exports.xd3_strerror(code));

// the function signatures for xd3_encode_memory and xd3_decode_memory are identical, which is very helpful for us
// however we want to always pass 0 to the flags arg for decoding

const makeWrappedXD3Fn = (xd3_fn_name: keyof Exports) => (input: Uint8Array, source: Uint8Array, output_size_max: number, smatch_cfg: xd3_smatch_cfg): { ret: number, str: string, output: Uint8Array } => {
    const { malloc, free, memory_view } = exports;
    const xd3_fn = exports[xd3_fn_name] as Function;
    const input_ptr = malloc(input.byteLength);
    const source_ptr = malloc(source.byteLength);
    const output_ptr = malloc(output_size_max);
    const output_size_ptr = malloc(4);

    writeToMemoryAt(input_ptr, input);
    writeToMemoryAt(source_ptr, source);

    const ret = xd3_fn(input_ptr, input.byteLength, source_ptr, source.byteLength, output_ptr, output_size_ptr, output_size_max, smatch_cfg);

    const output_size = memory_view.getUint32(output_size_ptr, true);
    // copy output to new arraybuffer
    const output = new Uint8Array(output_size);
    output.set(readFromMemoryAt(output_ptr, output_size));

    // free memory
    free(input_ptr);
    free(source_ptr);
    free(output_ptr);
    free(output_size_ptr);

    return { ret, str: getCodeStr(ret), output };
}

/**
 * Create a delta of the `input` relative to the `source`.
 * @param input Input data to create a delta of
 * @param source Source/"dictionary" the input is compared to
 * @param output_size_max Maximum size, in bytes, of the resulting delta. If the delta would be larger than this value, the function will return with the error `ENOSPC` and an empty buffer.
 * @param smatch_cfg The string matching configuration to use
 * @returns An object containing the return code, a string representation of the return code, and the resulting bytes of the delta
 */
export const xd3_encode_memory = makeWrappedXD3Fn("xd3_encode_memory");
const _xd3_decode_memory = makeWrappedXD3Fn("xd3_decode_memory");
/**
 * Decode a delta created relative to the `source`.
 * @param input Delta data to decode
 * @param source Source/"dictionary" the delta is relative to. This is the same `source` as used in encoding
 * @param output_size_max Maximum size, in bytes, of the resulting decoded data. If the decoded data would be larger than this value, the function will return with the error `ENOSPC` and an empty buffer.
 * @returns An object containing the return code, a string representation of the return code, and the resulting bytes of the decoded data
 */
export const xd3_decode_memory = (input: Uint8Array, source: Uint8Array, output_size_max: number) => _xd3_decode_memory(input, source, output_size_max, 0);