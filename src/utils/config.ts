export const config = {
  config: {
    iceServers: [
      { urls: "stun:stun.nextcloud.com:443" },
      { urls: "stun:stun.ideasip.com" },
      { urls: "stun:stun.iptel.org" },
      { urls: "stun:stun.rixtelecom.se" },
      { urls: "stun:stun.schlund.de" },
      { urls: "stun:stunserver.org" },
      { urls: "stun:stun.softjoys.com" },
      { urls: "stun:stun.voiparound.com" },
      { urls: "stun:stun.voipbuster.com" },
      { urls: "stun:stun.voipstunt.com" },
      { urls: "stun:stun.voxgratia.org" },
      { urls: "stun:stun.xten.com" },
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "9056cffa3ca6fe05b5ac81f0",
        credential: "ejenD6+PzzDEBvNQ",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "9056cffa3ca6fe05b5ac81f0",
        credential: "ejenD6+PzzDEBvNQ",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "9056cffa3ca6fe05b5ac81f0",
        credential: "ejenD6+PzzDEBvNQ",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "9056cffa3ca6fe05b5ac81f0",
        credential: "ejenD6+PzzDEBvNQ",
      },
    ],
    sdpSemantics: "unified-plan",
  },
};
