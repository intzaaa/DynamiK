import { useEffect, useRef } from "preact/compat";
import { fail, Maybe, succeed } from "@intzaaa/maybe";
import { signal, effect, computed } from "@preact/signals";
import { readBarcodes, writeBarcode } from "zxing-wasm";
import { Peer } from "peerjs";
import { config } from "../utils/config";
import { Text } from "..";
import { alarm } from "../utils/alarm";
import { receiver_url } from "../utils/receiver_url";
import "image-capture";

async function requestCamera(): Promise<Maybe<MediaStream>> {
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
}

const createSenderPeer = () => {
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
  const mediaStream = signal<MediaStream | undefined>(undefined);
  const scannedData = signal<string | undefined>(undefined);

  const currentPeer = signal<Peer | undefined>(undefined);
  const peerUrl = computed(() => (currentPeer.value ? receiver_url(currentPeer.value.id) : undefined));
  const sharingQR = signal<string | undefined>(undefined);
  const connCount = signal<number>(0);

  effect(() => {
    if (currentPeer.value) {
      currentPeer.value.on("connection", (conn) => {
        conn.on("open", () => {
          console.info("Connected to", conn.peer);
          connCount.value++;

          const dispose = effect(() => {
            if (scannedData.value) {
              conn.send(scannedData.value)?.then(() => {
                console.info("Sent to", conn.peer);
              });
              conn.send(scannedData.value)?.then(() => {
                console.info("Sent to", conn.peer);
              });

              console.info("Sending to", conn.peer);
            }
          });

          conn.peerConnection.addEventListener("connectionstatechange", () => {
            if (conn.peerConnection.connectionState !== "connected") {
              conn.close();
              dispose();
              connCount.value--;

              console.info("Closed", conn.peer);
            }
          });
        });
      });

      currentPeer.value.on("disconnected", () => {
        currentPeer.value?.reconnect();
      });
    }
  });

  effect(() => {
    if (mediaStream.value?.getVideoTracks()[0]) {
      let done = false;

      setInterval(async () => {
        if (done) return;
        done = true;

        try {
          const decoded = await readBarcodes(
            await new ImageCapture(mediaStream.value!.getVideoTracks()[0]!).grabFrame().then((bitmap) => {
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
            scannedData.value = valid[0]!.text;

            console.info(scannedData.value);
          }
        } catch {}

        done = false;
      }, 100);
    }
  });

  effect(() => {
    if (scannedData.value) {
      alarm();
    }
  });

  effect(() => {
    if (peerUrl.value) {
      try {
        navigator.clipboard.writeText(peerUrl.value);
        alarm();
      } catch {}
    }
  });

  useEffect(() => {
    requestCamera().then(([err, stream]) => {
      if (err) return console.error(err);

      mediaStream.value = stream;
      video.current!.srcObject = stream;
      video.current!.play();
    });

    createSenderPeer().then(async (_peer) => {
      currentPeer.value = _peer;

      const blob = (
        await writeBarcode(peerUrl.value!, {
          format: "QRCode",
          ecLevel: "H",
        })
      ).image!;

      const reader = new FileReader();
      reader.onload = () => {
        sharingQR.value = reader.result as string;
      };
      reader.readAsDataURL(blob);
    });

    return () =>
      effect(() => {
        mediaStream.value?.getTracks().forEach((track) => track.stop());

        const peerId = currentPeer.value?.id;
        currentPeer.value?.destroy();

        currentPeer.value?.destroyed && console.info("Destroyed", peerId);
      });
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
          <div class="w-full h-0 grow font-mono text-center flex flex-col items-center justify-center cursor-pointer">
            {computed(() =>
              currentPeer.value?.id ? (
                <>
                  <div class="w-full h-full flex flex-row items-center justify-between">
                    <img
                      src={sharingQR.value}
                      style={{
                        imageRendering: "pixelated",
                      }}
                      class="h-full w-auto aspect-square"></img>
                    <div class="text-[80px] overflow-clip px-4">{connCount}</div>
                  </div>
                  <a
                    class="text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      navigator.clipboard.writeText(e.currentTarget.href);
                    }}
                    href={peerUrl.value}>
                    {currentPeer.value.id}
                  </a>
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
