import { useEffect, useRef } from "preact/compat";
import { fail, Maybe, succeed } from "@intzaaa/maybe";
import { signal, effect, computed } from "@preact/signals";
import { readBarcodes } from "zxing-wasm/reader";
import { Peer } from "peerjs";
import { encode } from "base65536";
import { split } from "../utils/split";
import { config } from "../utils/config";
import { Text } from "..";

const request_camera = async (): Promise<Maybe<MediaStream>> => {
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
    console.info(devices);

    return succeed(
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: {
            ideal: 2000,
          },
          height: {
            ideal: 2000,
          },
        },
        audio: false,
      })
    );
  } catch (e) {
    return fail(e);
  }
};

const create_sender_peer = () => {
  const peer = new Peer(config);

  return new Promise<Peer>((resolve) => {
    peer.on("open", () => {
      resolve(peer);
      console.info(peer.id);
    });
  });
};

export default function Sender() {
  const video = useRef<HTMLVideoElement>(null);
  const media = signal<MediaStream | null>(null);
  const scanned = signal<string | null>(null);

  const peer = signal<Peer | null>(null);
  const peer_id_encoded = computed(() => (peer.value ? encode(new TextEncoder().encode(peer.value.id)) : ""));

  effect(() => {
    if (peer.value) {
      peer.value.on("connection", (conn) => {
        conn.on("open", () => {
          console.info("Connected to", conn.peer);

          const dispose = effect(() => {
            if (scanned.value) {
              conn.send(scanned.value);

              console.info("Send to", conn.peer);
            }
          });

          conn.on("close", dispose);
        });
      });
    }
  });

  effect(() => {
    if (media.value?.getVideoTracks()[0]) {
      setInterval(async () => {
        try {
          const decoded = await readBarcodes(
            await new ImageCapture(media.value!.getVideoTracks()[0]!).grabFrame().then((bitmap) => {
              const { width, height } = bitmap;

              const context = new OffscreenCanvas(width, height).getContext("2d")!;

              context.drawImage(bitmap, 0, 0, width, height);

              return context.getImageData(0, 0, width, height);
            }),
            {
              formats: ["QRCode"],
              tryHarder: true,
            }
          );

          const valid = decoded.filter((code) => code.isValid);

          if (valid.length > 0) {
            scanned.value = valid[0]!.text;

            console.info(scanned.value);
          }
        } catch {}
      }, 100);
    }
  });

  effect(() => {
    scanned.value && navigator.vibrate([2, 5, 10, 3, 2]);
  });

  effect(() => {
    navigator.clipboard.writeText(peer_id_encoded.value);
  });

  useEffect(() => {
    request_camera().then(([err, media_stream]) => {
      if (err) return console.error(err);

      media.value = media_stream;
      video.current!.srcObject = media_stream;
      video.current!.play();
    });

    create_sender_peer().then((_peer) => {
      peer.value = _peer;
    });

    return () => {
      media
        .peek()
        ?.getTracks()
        .forEach((track) => track.stop());

      peer.peek()?.destroy();

      console.info("Destroyed");
    };
  }, []);

  return (
    <>
      <div class="w-full h-0 grow ">
        <video
          ref={video}
          class="w-full h-full object-cover"
          playsInline
          muted></video>
      </div>
      <div class="w-full h-[150px] flex flex-row justify-between items-center overflow-hidden">
        <a
          class="text-[100px] aspect-square h-full w-auto text-center"
          href="/">
          {"<"}
        </a>
        <div class="h-full w-0 grow flex flex-col items-center justify-center">
          <div
            onClick={() => navigator.clipboard.writeText(peer_id_encoded.value)}
            class="h-0 grow text-2xl select-none text-center flex items-center justify-center">
            {computed(() =>
              peer_id_encoded.value ? (
                <>
                  {split(peer_id_encoded.value, 9).map((s) => (
                    <>
                      {s}
                      <br></br>
                    </>
                  ))}
                </>
              ) : (
                <Text path="setup" />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
