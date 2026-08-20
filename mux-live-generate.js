require('dotenv').config();

import Mux from '@mux/mux-node';

const Mux = new Mux({
    accessToken: process.env.MUX_TOKEN_ID,
    secret: process.env.MUX_TOKEN_SECRET,
});

const run = async () => {
    const stream = await Mux.Video.LiveStreams.create({
        playback_policy: 'public',
        new_asset_settings: {playback_policy: 'public',},
    })
    console.log(stream)
}
    run()