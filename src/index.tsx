import "./index.css";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import setupI18n from "./utils/i18n";
import Sender from "./pages/Sender";
import Receiver from "./pages/Receiver";

const { Text, register } = setupI18n("en", {
  send: "Send",
  receive: "Receive",
  setup: "Setting up...",
  waitCode: "Waiting for inputting code...",
  tryConn: "Waiting for connection...",
  receiveReady: "Ready to receive...",
  connInterrupt: "Connection interrupted",
  codePlaceholder: "Peering code",
});

register("zh", {
  send: "发送",
  receive: "接收",
  setup: "正在设置...",
  waitCode: "等待输入代码...",
  tryConn: "尝试连接...",
  receiveReady: "已准备好接收...",
  connInterrupt: "连接中断",
  codePlaceholder: "配对码",
});

register("de", {
  send: "Senden",
  receive: "Empfangen",
  setup: "Einrichtung...",
  waitCode: "Warte auf Eingabe des Codes...",
  tryConn: "Warte auf Verbindung...",
  receiveReady: "Bereit zum Empfangen...",
  connInterrupt: "Verbindung unterbrochen",
  codePlaceholder: "Pairing-Code",
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
