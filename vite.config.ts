import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import legacy from "@vitejs/plugin-legacy";
import topLevelAwait from "vite-plugin-top-level-await";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssMinify: true,
  },
  plugins: [
    basicSsl(),
    createHtmlPlugin({
      inject: {
        data: {
          HEAD_INSERT: process.env["HEAD_INSERT"],
        },
      },
    }),
    topLevelAwait(),
    legacy({
      targets: ["IE 11", "firefox 40"],
    }),
    preact({
      prefreshEnabled: false,
    }),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toUTCString()),
  },
});
