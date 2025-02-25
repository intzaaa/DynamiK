import { computed, effect, signal } from "@preact/signals";
import { decode } from "base65536";
import { DataConnection, Peer } from "peerjs";
import { config } from "../utils/config";
import { useEffect } from "preact/hooks";
import { Text } from "..";

const create_receiver_peer = () => {
  const peer = new Peer(config);

  return new Promise<Peer>((resolve) => {
    peer.on("open", () => {
      resolve(peer);
      console.info(peer.id);
    });
  });
};

export default function Receive() {
  const id = signal<string | null>(null);
  const peer = signal<Peer | null>(null);
  const conn = signal<DataConnection | null>(null);
  const url = signal<string | null>(null);
  const auto = signal<boolean>(localStorage.getItem("auto") === "true");

  effect(() => {
    if (auto.value && url.value) {
      window.open(url.value, "_blank");
    }
  });

  effect(() => {
    localStorage.setItem("auto", String(auto.value));
  });

  effect(() => {
    if (id.value && peer.value) {
      conn.peek()?.close();

      const _conn = peer.value.connect(id.value);
      _conn.on("data", (data: any) => {
        url.value = String(data);
        console.info(data);
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

      console.info("Destroyed");
    };
  }, []);

  return (
    <>
      <div>
        <input
          onInput={(e) => {
            const decoded = decode((e.target as HTMLInputElement).value);

            console.info(decoded);
            id.value = new TextDecoder().decode(decoded);
          }}
          autoFocus
          type="text"
          class="w-full h-24 text-center text-xl text-mono border-none outline-none"
          placeholder={Text({ path: "inputPlaceholder" }).raw}
        />
      </div>
      <div class="w-full h-0 grow text-4xl break-all font-mono p-8 overflow-clip dark:text-white flex flex-row justify-between items-center">
        {computed(() => {
          if (!peer.value) {
            return <Text path="setup" />;
          } else if (!id.value) {
            return <Text path="waitCode" />;
          } else if (!conn.value?.open) {
            return <Text path="waitConn" />;
          } else if (!url.value) {
            return <Text path="waitData" />;
          } else if (!conn.value) {
            return <Text path="waitScan" />;
          } else {
            return url.value;
          }
        })}
      </div>
      <div class="w-full h-[150px] flex flex-row justify-between items-center overflow-hidden">
        <a
          class="text-[100px] aspect-square h-full w-auto text-center"
          href="/">
          {"<"}
        </a>
        <div
          onClick={() => (auto.value = !auto.peek())}
          class={`text-[50px] h-full w-0 grow flex flex-col items-center justify-center font-mono transition-colors duration-300" ${auto.value ? "bg-green-500" : ""}`}>
          <Text path="auto" />
        </div>
      </div>
    </>
  );
}
