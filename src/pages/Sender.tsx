import { useEffect, useRef } from "preact/compat";
import { fail, Maybe, succeed } from "@intzaaa/maybe";
import { signal, effect, computed } from "@preact/signals";
import { readBarcodes } from "zxing-wasm";
import { Peer } from "peerjs";
import { config } from "../utils/config";
import { Text } from "..";
import { alarm } from "../utils/alarm";
import { writeBarcode } from "zxing-wasm/writer";
import { receiver_url } from "../utils/receiver_url";

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
  const media = signal<MediaStream | undefined>(undefined);
  const scanned = signal<string | undefined>(undefined);

  const peer = signal<Peer | undefined>(undefined);
  const url = computed(() => (peer.value ? receiver_url(peer.value.id) : undefined));
  const url_svg = signal<string | undefined>(undefined);
  const peer_count = signal<number>(0);

  effect(() => {
    if (peer.value) {
      peer.value.on("connection", (conn) => {
        conn.on("open", () => {
          console.info("Connected to", conn.peer);
          peer_count.value++;

          const dispose = effect(() => {
            if (scanned.value) {
              conn.send(scanned.value);

              console.info("Send to", conn.peer);
            }
          });

          conn.on("close", () => {
            dispose();
            peer_count.value--;
          });
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
    if (scanned.value) {
      navigator.vibrate([10, 5, 3]);
      alarm();
    }
  });

  effect(() => {
    if (url.value) {
      try {
        navigator.clipboard.writeText(url.value);
        alarm();
      } catch {}
    }
  });

  useEffect(() => {
    request_camera().then(([err, media_stream]) => {
      if (err) return console.error(err);

      media.value = media_stream;
      video.current!.srcObject = media_stream;
      video.current!.play();
    });

    create_sender_peer().then(async (_peer) => {
      peer.value = _peer;

      url_svg.value = URL.createObjectURL(
        new Blob(
          [
            (
              await writeBarcode(url.value!, {
                format: "QRCode",
                ecLevel: "H",
              })
            ).svg,
          ],
          { type: "image/svg+xml" }
        )
      );
    });

    return () => {
      media
        .peek()
        ?.getTracks()
        .forEach((track) => track.stop());

      url_svg.value && URL.revokeObjectURL(url_svg.value);

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
            onClick={() => url.value && navigator.clipboard.writeText(url.value)}
            class="h-0 grow select-none font-mono text-center flex flex-col items-center justify-center cursor-pointer">
            {computed(() =>
              peer.value?.id ? (
                <>
                  <div class="w-full h-full flex flex-row items-center justify-between">
                    <img
                      src={url_svg.value}
                      class="h-full w-auto aspect-square"></img>
                    <div class="text-[80px] overflow-clip">{peer_count}</div>
                  </div>
                  <div class="text-xs">{peer.value.id}</div>
                </>
              ) : (
                <div class="text-4xl">
                  <Text path="setup" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
