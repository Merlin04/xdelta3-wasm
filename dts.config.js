const { defineConfig } = require("./node_modules/dts-cli/dist/index");
const wasm = require("@rollup/plugin-wasm");

module.exports = defineConfig({
    // This function will run for each entry/format/env combination
    rollup: (config, options) => {
        config.plugins.push(
            wasm({
                maxFileSize: 0
            })
        );

        return config; // always return a config.
    }
});
