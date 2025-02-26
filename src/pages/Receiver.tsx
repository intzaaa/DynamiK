import { computed, effect, signal } from "@preact/signals";
import { DataConnection, Peer } from "peerjs";
import { config } from "../utils/config";
import { useEffect } from "preact/hooks";
import { Text } from "..";
import { writeBarcode } from "zxing-wasm";
import { alarm } from "../utils/alarm";

const createReceiverPeer = () => {
  const peer = new Peer(config);

  return new Promise<Peer>((resolve) => {
    peer.on("open", () => {
      resolve(peer);
      console.info(peer.id);
    });
  });
};

export default function Receiver() {
  const senderId = signal<string | undefined>(undefined);
  const peer = signal<Peer | undefined>(undefined);
  const currentConnection = signal<DataConnection | undefined>(undefined);
  const connectionState = signal<"idle" | "failed" | "connected">("idle");
  const dataUrl = signal<string | undefined>(undefined);
  let count = 0;
  const dataUrlSvg = signal<string | undefined>(undefined);

  effect(() => {
    if (dataUrl.value) {
      writeBarcode(dataUrl.value, {
        format: "QRCode",
        ecLevel: "M",
      }).then((result) => {
        dataUrlSvg.value && URL.revokeObjectURL(dataUrlSvg.value);
        dataUrlSvg.value = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));

        setTimeout(() => {
          count++;
          alarm();
        }, 10);
      });
    }
  });

  effect(() => {
    if (senderId.value && peer.value) {
      if (currentConnection.peek()) {
        console.info("Closing", currentConnection.peek()?.peer);
        currentConnection.peek()?.close();
      }

      console.info("Connecting to", senderId.value);

      const conn = peer.value.connect(senderId.value);
      conn.on("open", () => {
        connectionState.value = "connected";
        console.info("Connected to", conn.peer);
      });
      conn.on("data", async (data: any) => {
        dataUrl.value = String(data);
        console.info(data);
      });
      conn.on("close", () => {
        connectionState.value = "idle";
        console.info("Closed", conn.peer);
      });
      conn.on("error", (err) => {
        connectionState.value = "failed";
        console.error(err);
      });

      currentConnection.value = conn;
    }
  });

  useEffect(() => {
    senderId.value = new URLSearchParams(location.search).get("id") ?? undefined;

    createReceiverPeer().then((_peer) => {
      peer.value = _peer;
    });

    return () => {
      peer.peek()?.destroy();
      dataUrlSvg.value && URL.revokeObjectURL(dataUrlSvg.value);

      console.info("Destroyed");
    };
  }, []);

  return (
    <>
      <div>
        <input
          value={senderId}
          onInput={(e) => (senderId.value = e.currentTarget.value)}
          autoFocus
          type="text"
          class="w-full h-24 text-center text-xl text-mono border-none outline-none bg-transparent"
          placeholder={Text({ path: "codeInput" }).raw}
        />
      </div>
      <div
        onClick={() => {
          dataUrl.value && navigator.clipboard.writeText(dataUrl.value);
        }}
        class={`w-full h-0 grow text-4xl break-all font-mono p-2 overflow-clip dark:text-white flex flex-wrap flex-row items-center justify-between`}>
        {computed(() => {
          if (dataUrl.value) {
            return (
              <img
                src={dataUrlSvg.value}
                alt={dataUrl.value}
                class={`w-full h-full object-contain cursor-pointer ${count % 2 === 0 ? "object-right-bottom" : "object-left-top"}`}></img>
            );
          } else if (!peer.value) {
            return <Text path="setup" />;
          } else if (!senderId.value) {
            return <Text path="waitCode" />;
          } else if (connectionState.value === "idle") {
            return <Text path="waitConn" />;
          } else {
            return <Text path="waitData" />;
          }
        })}
      </div>
      <div class="w-full h-[150px] flex flex-row justify-between items-center overflow-hidden">
        <a
          class="text-[100px] aspect-square h-full w-auto text-center"
          href="/">
          {"<"}
        </a>
      </div>
    </>
  );
}
