import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		https: true,
	},
	plugins: [
		basicSsl(),
		preact({
			prefreshEnabled: false,
		}),
	],
});
