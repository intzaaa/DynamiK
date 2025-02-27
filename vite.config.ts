import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		target: "es2015",
	},
	plugins: [
		basicSsl(),
		legacy({
			targets: ["IE 11", "firefox 40"],
		}),
		preact({
			prefreshEnabled: false,
		}),
	],
	define: {
		HEAD: process.env["INSERT"],
	},
});
