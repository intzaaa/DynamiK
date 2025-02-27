import { computed, effect, signal } from "@preact/signals";
import { DataConnection, Peer } from "peerjs";
import { config } from "../utils/config";
import { useEffect } from "preact/hooks";
import { Text } from "..";
import { writeBarcode } from "zxing-wasm";
import { alarm } from "../utils/alarm";
import { useLocation } from "preact-iso";
import Controller from "../components/Controller";

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
  const senderId = signal<string | undefined>(new URLSearchParams(location.search).get("id") ?? undefined);
  const peer = signal<Peer | undefined>(undefined);
  const currentConnection = signal<DataConnection | undefined>(undefined);
  const isConnected = signal<boolean>(false);
  const dataUrl = signal<string | undefined>(undefined);
  let count = 0;
  const dataUrlSvg = signal<string | undefined>(undefined);

  // effect(() => {
  //   if (id.value) {
  //     const search = new URLSearchParams(location.search);

  //     search.set("id", id.value);

  //     window.location.search = search.toString();
  //   }
  // });

  effect(() => {
    if (dataUrl.value) {
      writeBarcode(dataUrl.value, {
        format: "QRCode",
        ecLevel: "M",
      }).then((result) => {
        count++;

        alarm();
        dataUrlSvg.value && URL.revokeObjectURL(dataUrlSvg.value);
        dataUrlSvg.value = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));
      });
    }
  });

  effect(() => {
    if (senderId.value && peer.value) {
      currentConnection.peek()?.close();

      const _conn = peer.value.connect(senderId.value);
      _conn.on("open", () => {
        isConnected.value = true;
        console.info("Connected to", _conn.peer);
      });
      _conn.on("data", async (data: any) => {
        dataUrl.value = String(data);

        console.info(data);
      });
      _conn.peerConnection.addEventListener("connectionstatechange", () => {
        currentConnection.value = undefined;
        isConnected.value = false;

        useLocation().route("/");
        console.info("Disconnected");
      });

      currentConnection.value = _conn;
    }
  });

  useEffect(() => {
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
          value={senderId.value}
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
          } else if (!isConnected.value) {
            return <Text path="waitConn" />;
          } else {
            return <Text path="waitData" />;
          }
        })}
      </div>
      <Controller></Controller>
    </>
  );
}
