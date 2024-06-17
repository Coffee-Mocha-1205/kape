const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "alldl",
    version: "1.8",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    shortDescription: "download content by link",
    longDescription: "download content",
    category: "download",
    guide: "{pn} link"
  },

  onStart: async function ({ api, event, args }) {
    const link = args.join(" ");
    if (!link) {
      api.sendMessage(`Please provide the link.`, event.threadID, event.messageID);
      return;
    }

    let BASE_URL;

    if (link.includes("facebook.com")) {
      BASE_URL = `https://apis-samir.onrender.com/fbdl?vid_url=${encodeURIComponent(link)}`;
    } else if (link.includes("twitter.com") || link.includes("x.com")) {
      BASE_URL = `https://apis-samir.onrender.com/twitter?url=${encodeURIComponent(link)}`;
    } else if (link.includes("tiktok.com")) {
      BASE_URL = `https://apis-samir.onrender.com/tiktok?url=${encodeURIComponent(link)}`;
    } else if (link.includes("open.spotify.com")) {
      BASE_URL = `https://apis-samir.onrender.com/spotifydl?url=${encodeURIComponent(link)}`;

      try {
        const apiResponse = await axios.get(BASE_URL);

        if (apiResponse.data.success) {
          const metadata = apiResponse.data.metadata;
          const audioUrl = apiResponse.data.link;

          api.sendMessage("⬇ | Downloading the content for you", event.threadID, async () => {
            try {
              const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
              const filePath = path.join(__dirname, '/cache/spotify.mp3');
              fs.writeFileSync(filePath, Buffer.from(audioResponse.data));

              const replyMessage = {
                body: `• Title: ${metadata.title}\n• Album: ${metadata.album}\n• Artist: ${metadata.artists}\n• Released: ${metadata.releaseDate}`,
                attachment: fs.createReadStream(filePath)
              };

              api.sendMessage(replyMessage, event.threadID, () => {
                fs.unlinkSync(filePath); // Delete file after sending
              });
            } catch (error) {
              console.error(error);
              api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
            }
          });
        } else {
          api.sendMessage("Sorry, the Spotify content could not be downloaded.", event.threadID);
        }
      } catch (error) {
        console.error(error);
        api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
      }

      return;
    } else if (link.includes("youtu.be") || link.includes("youtube.com")) {
      const providedURL = `https://apis-samir.onrender.com/ytdl?url=${link}`;
      api.sendMessage({
        attachment: await global.utils.getStreamFromURL(providedURL),
      }, event.threadID);
      return;
    } else if (link.includes("instagram.com")) {
      BASE_URL = `https://apis-samir.onrender.com/igdl?url=${encodeURIComponent(link)}`;
    } else {
      api.sendMessage(`Unsupported source.`, event.threadID);
      return;
    }

    api.sendMessage("Processing your request... Please wait.", event.threadID);

    try {
      let res = await axios.get(BASE_URL);

      let contentUrl;

      if (link.includes("facebook.com")) {
        contentUrl = res.data.links["Download High Quality"];
      } else if (link.includes("twitter.com") || link.includes("x.com")) {
        contentUrl = res.data.HD;
      } else if (link.includes("tiktok.com")) {
        contentUrl = res.data.hdplay;
      } else if (link.includes("instagram.com")) {
        contentUrl = res.downloadHref;
      }

      const response = {
        attachment: await global.utils.getStreamFromURL(contentUrl)
      };

      await api.sendMessage(response, event.threadID);
    } catch (error) {
      api.sendMessage(`Sorry, an error occurred: ${error.message}`, event.threadID);
    }
  }
};