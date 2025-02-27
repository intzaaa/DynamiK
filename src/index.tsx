import "./index.css";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import setupI18n from "./utils/i18n";
import Sender from "./pages/Sender";
import Receiver from "./pages/Receiver";

import zxingWasmFilePath from "zxing-wasm/full/zxing_full.wasm?url";
import { prepareZXingModule } from "zxing-wasm";

prepareZXingModule({
  overrides: {
    locateFile: () => zxingWasmFilePath,
  },
});

const { Text, register } = setupI18n("en", {
  send: "Send",
  receive: "Receive",
  setup: "Setting up...",
  waitCode: "Waiting for code...",
  waitConn: "Waiting for connection...",
  waitData: "Waiting for data...",
  auto: "AUTO",
  codeInput: "CODE",
});

register("zh", {
  send: "发送",
  receive: "接收",
  setup: "正在设置...",
  waitCode: "等待输入代码...",
  waitConn: "等待连接...",
  waitData: "等待数据...",
  auto: "自动",
  codeInput: "代码",
});

register("de", {
  send: "Senden",
  receive: "Empfangen",
  setup: "Einrichtung...",
  waitCode: "Warte auf Code...",
  waitConn: "Warte auf Verbindung...",
  waitData: "Warte auf Daten...",
  auto: "AUTO",
  codeInput: "CODE",
});

export { Text };

export function App() {
  return (
    <LocationProvider>
      <main class="flex flex-col overflow-auto w-full h-dvh">
        <Router>
          <Route
            path="/"
            component={Home}
          />
          <Route
            path="/send"
            component={Sender}
          />
          <Route
            path="/receive"
            component={Receiver}
          />
          <Route
            default
            component={NotFound}
          />
        </Router>
      </main>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app")!);
