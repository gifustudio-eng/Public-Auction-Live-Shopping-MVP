require("dotenv").config({path: ".env.local"});

const Mux = require("@mux/mux-node").default;

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

const run = async () => {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET must be configured.");
  }

  const stream = await mux.video.liveStreams.create({
    playback_policies: ["public"],
    new_asset_settings: {
      playback_policies: ["public"],
    },
  });

  console.log({
    liveStreamId: stream.id,
    playbackId: stream.playback_ids?.[0]?.id,
    playerUrl: stream.playback_ids?.[0]?.id
      ? `https://player.mux.com/${stream.playback_ids[0].id}`
      : null,
    rtmpUrl: "rtmp://global-live.mux.com:5222/app",
  });
};

run().catch((error) => {
  console.error("Unable to create Mux live stream:", error.message);
  process.exitCode = 1;
});
