declare module "*.wasm" {
    const wasm: <T extends Object>(exports?: T) => Promise<T extends Object ? { module: WebAssembly.Module, instance: WebAssembly.Instance } : WebAssembly.Module>;
    export default wasm;
}