const fs = require("fs");
const path = require("path");
const axios = require("axios");
const tinyurl = require('tinyurl');

// Define your list of bad words
const badWords = ["tits", "gay", "pussy", "dick","nude","sugar","fuck","fucked","slut","🤭","🍼","shit","bitch","hentai","🥵","sugar","smut","naked","penis","🍑","👄","💋","bitch","hentai","sex","😋","boobs","🤤","undressed", "nude","😛","bra","dick","arse","asshole","ass","crack","fellatio","blow job","suck","hot","bikini","👙","💦","🍆","👌","🖕","😝","😜","🤪","🥴","🥺","cock","vagina","pedo","lips","69","yuck","gae","milf","prostitute","without clothe"];

module.exports = {
  config: {
    name: "prodia",
    aliases: [],
    version: "1.0",
    author: "vex_Kshitiz",
    countDown: 20,
    role: 0,
    shortDescription: "Image to image",
    longDescription: "Image to image conversion",
    category: "game",
    guide: {
      en: "{p}prodia reply to image or {p}prodia [prompt]"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const promptApiUrl = "https://www.api.vyturex.com/describe?url=";
      const sdxlApiUrl = "https://sdxl-kshitiz.onrender.com/gen";

      let imageUrl = null;
      let prompt = '';
      let style = 2; // Set style to 2

      // Function to check for bad words
      function containsBadWords(text) {
        const lowerText = text.toLowerCase();
        return badWords.some(word => lowerText.includes(word));
      }

      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments[0];
        if (!attachment || !["photo", "sticker"].includes(attachment.type)) {
          return message.reply("❌ | Reply must be an image.");
        }
        imageUrl = attachment.url;
        const promptResponse = await axios.get(promptApiUrl + encodeURIComponent(imageUrl));
        prompt = promptResponse.data;
      } else if (args.length > 0 && args[0].startsWith("http")) {
        imageUrl = args[0];
        const promptResponse = await axios.get(promptApiUrl + encodeURIComponent(imageUrl));
        prompt = promptResponse.data;
      } else if (args.length > 0) {
        const argParts = args.join(" ").split("|");
        prompt = argParts[0].trim();
        if (argParts.length > 1) {
          style = parseInt(argParts[1].trim());
        }
      } else {
        return message.reply("❌");
      }

      // Check for bad words in the prompt
      if (containsBadWords(prompt)) {
        return message.reply("❌ | Your prompt contains inappropriate language.");
      }

      const sdxlResponse = await axios.get(sdxlApiUrl, {
        params: {
          prompt: prompt,
          style: style 
        }
      });

      if (sdxlResponse.data.status === "success") {
        const imageUrl = sdxlResponse.data.url;
        const imagePath = path.join(__dirname, "cache", `${Date.now()}_generated_image.png`);
        const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
        const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));
        imageStream.on("finish", () => {
          const stream = fs.createReadStream(imagePath);
          message.reply({
            body: "",
            attachment: stream
          });
        });
      } else {
        throw new Error("Image generation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred. Please try again later.");
    }
  }
};
