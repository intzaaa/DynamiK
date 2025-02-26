export const config = {
  config: {
    iceServers: [{
      "urls": [
        "stun:stun.cloudflare.com:3478",
        "stun:stun.nextcloud.com:443",
      ],
    }],
  },
};
