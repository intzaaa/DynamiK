import { computed, effect, signal } from "@preact/signals";
import { DataConnection, Peer } from "peerjs";
import { config } from "../utils/config";
import { useEffect } from "preact/hooks";
import { Text } from "..";
import { writeBarcode } from "zxing-wasm";
import { alarm } from "../utils/alarm";

const create_receiver_peer = () => {
  const peer = new Peer(config);

  return new Promise<Peer>((resolve) => {
    peer.on("open", () => {
      resolve(peer);
      console.info(peer.id);
    });
  });
};

export default function Receiver() {
  const id = signal<string | undefined>(new URLSearchParams(location.search).get("id") ?? undefined);
  const peer = signal<Peer | undefined>(undefined);
  const conn = signal<DataConnection | undefined>(undefined);
  const state = signal<boolean>(false);
  const url = signal<string | undefined>(undefined);
  let count = 0;
  const svg = signal<string | undefined>(undefined);

  // effect(() => {
  //   if (id.value) {
  //     const search = new URLSearchParams(location.search);

  //     search.set("id", id.value);

  //     window.location.search = search.toString();
  //   }
  // });

  effect(() => {
    if (url.value) {
      writeBarcode(url.value, {
        format: "QRCode",
        ecLevel: "M",
      }).then((result) => {
        count++;

        alarm();
        svg.value && URL.revokeObjectURL(svg.value);
        svg.value = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));
      });
    }
  });

  effect(() => {
    if (id.value && peer.value) {
      conn.peek()?.close();

      const _conn = peer.value.connect(id.value);
      _conn.on("open", () => {
        state.value = true;
        console.info("Connected to", _conn.peer);
      });
      _conn.on("data", async (data: any) => {
        url.value = String(data);

        console.info(data);
      });
      _conn.on("close", () => {
        conn.value = undefined;
        state.value = false;
        console.info("Disconnected");
      });

      conn.value = _conn;
    }
  });

  useEffect(() => {
    create_receiver_peer().then((_peer) => {
      peer.value = _peer;
    });

    return () => {
      peer.peek()?.destroy();
      svg.value && URL.revokeObjectURL(svg.value);

      console.info("Destroyed");
    };
  }, []);

  return (
    <>
      <div>
        <input
          value={id.value}
          onInput={(e) => (id.value = e.currentTarget.value)}
          autoFocus
          type="text"
          class="w-full h-24 text-center text-xl text-mono border-none outline-none bg-transparent"
          placeholder={Text({ path: "codeInput" }).raw}
        />
      </div>
      <div
        onClick={() => {
          url.value && navigator.clipboard.writeText(url.value);
        }}
        class={`w-full h-0 grow text-4xl break-all font-mono p-2 overflow-clip dark:text-white flex flex-wrap flex-row items-center justify-between`}>
        {computed(() => {
          if (url.value) {
            return (
              <img
                src={svg.value}
                alt={url.value}
                class={`w-full h-full object-contain cursor-pointer ${count % 2 === 0 ? "object-right-bottom" : "object-left-top"}`}></img>
            );
          } else if (!peer.value) {
            return <Text path="setup" />;
          } else if (!id.value) {
            return <Text path="waitCode" />;
          } else if (!state.value) {
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
