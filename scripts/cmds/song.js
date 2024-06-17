const fs = require("fs-extra");
const ytdl = require("@neoxr/ytdl-core");
const yts = require("yt-search");

const FILE_SIZE_LIMIT_MB = 25;

module.exports = {
  config: {
    name: "song",
    version: "1.0",
    author: "Coffee",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play a song",
    },
    longDescription: {
      en: "This command allows you to play a song. Usage: !song <song name>",
    },
    category: "music",
    guide: {
      en: "{prefix}song <song name>",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const songName = args.join(" ");

      if (!songName) {
        return api.sendMessage("Please provide a song name!", event.threadID, event.messageID);
      }

      const searchResults = await yts(songName);

      if (!searchResults.videos.length) {
        return api.sendMessage("Error: Song not found.", event.threadID, event.messageID);
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const stream = ytdl(videoUrl, { filter: "audioonly" });
      const fileName = `music.mp3`;
      const filePath = `${__dirname}/tmp/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('response', () => {
      });

      stream.on('info', (info) => {
      });

      stream.on('end', async () => {
        if (fs.statSync(filePath).size > FILE_SIZE_LIMIT_MB * 1024 * 1024) {
          fs.unlinkSync(filePath);
          return api.sendMessage(`[ERR] The file could not be sent because it is larger than ${FILE_SIZE_LIMIT_MB}MB.`, event.threadID, event.messageID);
        }

        const replyMessage = {
          body: `🎧 | Playing ${video.title}`,
          attachment: fs.createReadStream(filePath),
        };
        await api.sendMessage(replyMessage, event.threadID, () => {
          fs.unlinkSync(filePath);
        }, event.messageID);
      });
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage("Error processing the request.", event.threadID, event.messageID);
    }
  },
};