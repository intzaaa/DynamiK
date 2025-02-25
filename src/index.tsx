import "./index.css";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import setup_i18n from "./utils/i18n";
import Send from "./pages/Send";
import Receive from "./pages/Receive";

const { Text, register } = setup_i18n("en", {
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
            component={Send}
          />
          <Route
            path="/receive"
            component={Receive}
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
