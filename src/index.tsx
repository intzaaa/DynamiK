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
import Help from "./pages/Help";

await prepareZXingModule({
  overrides: {
    locateFile: () => zxingWasmFilePath,
  },
  fireImmediately: true,
});

const { Text, register } = setupI18n("en", {
  send: "Send",
  receive: "Receive",
  help: "Help",
  helpContent: (
    <>
      <h1>Help Information</h1>
      <p>
        <b>DynamiK is free software without any warranty.</b>
      </p>
      <p>
        DynamiK is short for Dynamic QRCode Killer. It can be used to broadcast QR code data. Thanks to WebRTC technology, your data transfer is private and
        fast.
      </p>
      <p>
        DynamiK is designed carefully and is easy to use. As a sender, you can view or click the pairing code area, or long-press the QR code in the control
        area (mobile devices only) to get a pairing code or subscription link for the receiver. As a receiver, you can enter the pairing code provided by the
        sender or directly open the subscription link to access the data the sender pushes.
      </p>
      <p>
        Built on modern web technologies, if you encounter any issues, please try using the latest versions of Chromium or Safari browsers. DynamiK does not
        support Firefox.
      </p>
      <p>
        If you have any questions or suggestions, please open an issue or submit a pull request on <a href="https://github.com/intzaaa/DynamiK">Github</a>.
      </p>
    </>
  ),
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
  help: "帮助",
  helpContent: (
    <>
      <h1>帮助信息</h1>
      <p>
        <b>DynamiK 是自由软件，不附带任何担保。</b>
      </p>
      <p>DynamiK 是 Dynamic QRCode Killer 的缩写，可用于广播二维码数据。得益于 WebRTC 技术，您的数据传输过程私密且迅速。</p>
      <p>
        DynamiK
        经过精心设计，易于使用。作为发送者，您可以通过查看或点击配对码区域，或长按控制区域的二维码（仅限移动设备）获取配对码或订阅链接提供给接收者。作为接收者，您可以在接收页面输入发送者提供的配对码或直接打开发送者提供的订阅链接来访问发送者推送的数据。
      </p>
      <p>DynamiK 建立在现代 Web 技术之上，如果您遇到问题，请尝试使用新版本的 Chromium 或 Safari 浏览器。DynamiK 不支持 Firefox 浏览器。</p>
      <p>
        如您有任何问题或建议，请在 <a href="https://github.com/intzaaa/DynamiK">Github</a> 上开启议题或推送请求。
      </p>
    </>
  ),
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
  help: "Hilfe",
  helpContent: (
    <>
      <h1>Hilfe-Informationen</h1>
      <p>
        <b>DynamiK ist freie Software und wird ohne jegliche Gewährleistung bereitgestellt.</b>
      </p>
      <p>
        DynamiK steht für Dynamic QRCode Killer. Es kann verwendet werden, um QR-Code-Daten zu senden. Dank der WebRTC-Technologie ist Ihre Datenübertragung
        privat und schnell.
      </p>
      <p>
        DynamiK ist sorgfältig entworfen und einfach zu verwenden. Als Sender können Sie den Pairing-Code-Bereich ansehen oder anklicken, oder den QR-Code im
        Steuerbereich (nur auf mobilen Geräten) lange drücken, um einen Pairing-Code oder einen Abonnementlink zu erhalten, den Sie dem Empfänger bereitstellen.
        Als Empfänger können Sie den vom Sender bereitgestellten Pairing-Code eingeben oder direkt den Abonnementlink öffnen, um auf die Daten des Senders
        zuzugreifen.
      </p>
      <p>
        DynamiK basiert auf modernen Webtechnologien. Falls Sie Probleme haben, versuchen Sie bitte, neuere Versionen der Chromium- oder Safari-Browser zu
        verwenden. DynamiK unterstützt Firefox nicht.
      </p>
      <p>
        Wenn Sie Fragen oder Vorschläge haben, eröffnen Sie bitte ein Issue oder senden Sie einen Pull Request auf{" "}
        <a href="https://github.com/intzaaa/DynamiK">Github</a>.
      </p>
    </>
  ),
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
            path="/help"
            component={Help}></Route>
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
