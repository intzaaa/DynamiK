import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import legacy from "@vitejs/plugin-legacy";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		cssMinify: true,
	},
	plugins: [
		basicSsl(),
		topLevelAwait(),
		legacy({
			targets: ["IE 11", "firefox 40"],
		}),
		preact({
			prefreshEnabled: false,
		}),
	],
	define: {
		date: {
			value: new Date().toUTCString(),
		},
	},
});
