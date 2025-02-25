import "./index.css";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import setup_i18n from "./utils/i18n";
import Send from "./pages/Send";
import Receive from "./pages/Receive";

const { Text, register } = setup_i18n("en-US", {
  send: "Send",
  receive: "Receive",
});

register("zh", {
  send: "发送",
  receive: "接收",
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
