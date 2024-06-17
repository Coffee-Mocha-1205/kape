const axios = require("axios");
const fs = require("fs-extra");
const os = require("os");
const ytdl = require("@neoxr/ytdl-core");

module.exports = {
  sentMusic: [],

  config: {
    name: "opm",
    version: "2.0",
    role: 0,
    author: "coffee",
    cooldowns: 40,
    shortDescription: "Fetch a random music song of axix band",
    longDescription: "Fetch a random music song of axix band",
    category: "music",
    dependencies: {
      "fs-extra": "",
      "axios": "",
      "@neoxr/ytdl-core": ""
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const apiKey = "AIzaSyAO1tuGus4-S8RJID51f8WJAM7LXz1tVNc";
      const playlistIds = [
        "PL3oW2tjiIxvQTMgnXMwbesTc1Z7-ogJi9&si=dgzKqff_ny5lnNYy",
        "PLdmvwyBhD_YunGWjvZavyHui_uAx78RXV&si=PZ7ZYrdaKEawWEEP"
      ];

      if (this.sentMusic.length === 0) {
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&part=contentDetails&maxResults=50&playlistId=${playlistIds.join(',')}`;
        const response = await axios.get(playlistUrl);
        const videoIds = response.data.items.map(item => item.contentDetails.videoId);
        this.sentMusic = videoIds;
      }

      const randomVideoId = this.sentMusic.splice(Math.floor(Math.random() * this.sentMusic.length), 1)[0];

      const videoDetails = await ytdl.getInfo(randomVideoId, { quality: 'highestaudio' });
      const randomMusicTitle = videoDetails.videoDetails.title;
      const audioFormat = ytdl.chooseFormat(videoDetails.formats, { quality: 'highestaudio' });

      if (!audioFormat) {
        return api.sendMessage("No audio track found for the selected video.", event.threadID, null, event.messageID);
      }

      const stream = ytdl(randomVideoId, { format: audioFormat });
      const fileName = `${randomMusicTitle}.mp3`;
      const filePath = `${os.tmpdir()}/${fileName}`;

      stream.on('info', info => {
        console.info('[DOWNLOADER]', `Downloading music: ${randomMusicTitle}`);
      });

      const fileWriter = fs.createWriteStream(filePath);
      stream.pipe(fileWriter);

      fileWriter.on('finish', async () => {
        console.info('[DOWNLOADER]', 'Downloaded');
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('🚫 | The file could not be sent because it is larger than 25MB.', event.threadID, null, event.messageID);
        }

        const message = {
          body: `🎧 | Title: ${randomMusicTitle}`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, event.threadID, null, event.messageID, async () => {
          // Delete the temporary file after sending
          try {
            await fs.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
          } catch (error) {
            console.error(`Error deleting file: ${filePath}`, error);
          }
        });
      });

      fileWriter.on('error', error => {
        console.error('[FILE_WRITER_ERROR]', error);
        api.sendMessage('An error occurred while writing the file.', event.threadID, null, event.messageID);
      });
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('An error occurred while processing the command.', event.threadID, null, event.messageID);
    }
  },
};