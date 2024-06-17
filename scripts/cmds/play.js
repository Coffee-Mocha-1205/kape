const fs = require("fs-extra");
const ytdl = require("@neoxr/ytdl-core");
const yts = require("yt-search");
const axios = require("axios");

const FILE_SIZE_LIMIT_MB = 25;

module.exports = {
  config: {
    name: "play",
    version: "1.0",
    author: "Coffee",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play a song with lyrics",
    },
    longDescription: {
      en: "This command allows you to play a song and display its lyrics. Usage: !play <song name>",
    },
    category: "music",
    guide: {
      en: "{prefix}play <song name>",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const songName = args.join(" ");

      if (!songName) {
        return api.sendMessage("Please provide a song name!", event.threadID, event.messageID);
      }

      const searchResults = await yts(songName);
      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const stream = ytdl(videoUrl, { filter: "audioonly" }); // Download highest available audio quality
      const fileName = `music.mp3`;
      const filePath = `${__dirname}/tmp/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('end', async () => {
        if (await isFileSizeWithinLimit(filePath)) {
          await handleLyrics(api, event, video, filePath, songName, event.messageID); // Pass event.messageID to handleLyrics
        } else {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('[ERROR]', 'Failed to delete file:', err);
            }
            api.sendMessage(`[ERR] The file could not be sent because it is larger than ${FILE_SIZE_LIMIT_MB}MB.`, event.threadID, event.messageID);
          });
        }
      });
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage("Error processing the request.", event.threadID, event.messageID);
    }
  },
};

async function handleLyrics(api, event, video, filePath, songName, messageID) { // Add messageID parameter
  const apiUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`;

  try {
    const response = await axios.get(apiUrl);
    const { lyrics, title, artist } = response.data;

    const lyricsWithTitle = `🎧 | Title: ${title}\n🎤 | Artist: ${artist}\n\n${lyrics || "Sorry, lyrics not found!"}`;

    const sendLyricsPromise = api.sendMessage(lyricsWithTitle, event.threadID, messageID); // Reply to the message that triggered the request
    const sendSongPromise = api.sendMessage({
      body: "",
      attachment: fs.createReadStream(filePath),
    }, event.threadID);

    await Promise.all([sendLyricsPromise, sendSongPromise]);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('[ERROR]', 'Failed to delete file:', err);
      }
    });
  } catch (error) {
    console.error('[ERROR]', error);
    api.sendMessage(`Can't fetch music for "${songName}"!`, event.threadID);
  }
}

async function isFileSizeWithinLimit(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= FILE_SIZE_LIMIT_MB * 1024 * 1024;
  } catch (error) {
    console.error('[ERROR]', 'Failed to get file stats:', error);
    return false;
  }
}