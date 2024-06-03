const axios = require("axios");

const apiClient = axios.create({
  baseURL: "https://for-devs.onrender.com/api",
  timeout: 5000,
});

const sendErrorMessage = (message, errorMessage) => {
  message.reply({ body: errorMessage });
};

const getApiResponse = async (prompt, uid, apikey) => {
  try {
    const response = await apiClient.get("/pi", {
      params: { query: prompt, uid, apikey },
    });
    return response.data?.result;
  } catch (error) {
    console.error("API Request Error:", error.message);
    throw new Error("Server not responding ❌");
  }
};

const handleApiResponse = (message, event, commandName, result) => {
  const replyMessage = `✨ | 𝙿𝚎𝚛𝚙𝚕𝚎𝚡𝚒𝚝𝚢 |\n━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━`;

  message.reply(
    { body: replyMessage },
    (err, info) => {
      if (err) {
        console.error("Message Reply Error:", err);
        sendErrorMessage(message, "Failed to send reply ❌");
        return;
      }

      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
      });
    }
  );
};

module.exports = {
  config: {
    name: "perplexity",
    version: "1.0",
    author: "Rishad",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "chat with PI AI",
      en: "chat with PI AI"
    },
    longDescription: {
      vi: "chat with PI AI",
      en: "chat with PI AI"
    },
    category: "AI",
    guide: {
      en: `{pn} 'prompt'\nexample:\n{pn} hi there \nyou can reply to chat\nuse clear to delete conversations`
    }
  },
  onStart: async function ({ message, event, args, commandName }) {
    const prompt = args.join(" ") || "hi";

    try {
      const uid = event.senderID;
      const result = await getApiResponse(prompt, uid, "api1");

      if (result) {
        handleApiResponse(message, event, commandName, result);
      } else {
        console.error("API Error: No result found");
        sendErrorMessage(message, "Server not responding ❌");
      }
    } catch (error) {
      sendErrorMessage(message, error.message);
    }
  },
  onReply: async function ({ message, event, Reply, args }) {
    const { author, commandName } = Reply;
    if (event.senderID !== author) return;

    const prompt = args.join(" ") || "hi";

    try {
      const uid = event.senderID;
      const result = await getApiResponse(prompt, uid, "api1");

      if (result) {
        handleApiResponse(message, event, commandName, result);
      } else {
        console.error("API Error: No result found");
        sendErrorMessage(message, "Server not responding ❌");
      }
    } catch (error) {
      sendErrorMessage(message, error.message);
    }
  }
};