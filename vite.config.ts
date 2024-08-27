import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";
import { minifyHTMLLiterals, type Options } from "minify-html-literals";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            fileName: "json-viewer",
            entry: "src/json-viewer.ts",
            formats: ["es"],
        },
        minify: "esbuild",
        target: "esnext",
        // rollupOptions: { external: /^lit/ },
    },
    plugins: [minifyHTMLLiteralsPlugin(), dts({ rollupTypes: true })],
});

function minifyHTMLLiteralsPlugin(options: Options = {}): Plugin {
    return {
        name: "minify-html-literals",
        transform(code, id) {
            const result = minifyHTMLLiterals(code, { ...options, fileName: id });
            return result ? { code: result.code, map: result.map?.toString() } : null;
        },
    };
}
