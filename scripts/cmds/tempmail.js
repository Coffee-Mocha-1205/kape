const axios = require("axios");

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["tm"],
    version: "1.0.0",
    author: "Upol | ArYAN | ARN",
    role: 0,
    countDown: 5,
    longDescription: {
      en: "Generate temporary email and check inbox"
    },
    category: "email",
    guide: {
      en: ".tempmail <subcommand>\n\nFor Example:\n.tempmail create\n.tempmail inbox <tempmail>"
    }
  },
  onStart: async function ({ api, event, args }) {
    const primaryApi = "https://himachalwale.onrender.com/api/tempmail/";
    const secondaryApi = "https://for-devs.onrender.com/api/mail/";
    const apiKey = "©himachalwale";
    const fallbackApiKey = "api1";

    if (args.length === 0) {
      return api.sendMessage(this.config.guide.en, event.threadID, event.messageID);
    }

    const fetchEmail = async (apiUrl, key) => {
      try {
        const response = await axios.get(`${apiUrl}get?apikey=${key}`);
        return response.data.tempmail || response.data.email;
      } catch (error) {
        console.error("Error fetching email:", error);
        throw error;
      }
    };

    const fetchInbox = async (apiUrl, email, key) => {
      try {
        const response = await axios.get(`${apiUrl}inbox?email=${email}&apikey=${key}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching inbox:", error);
        throw error;
      }
    };

    if (args[0] === "create") {
      try {
        const email = await fetchEmail(primaryApi, apiKey);
        api.sendMessage(`📩 Here's your generated temporary email: ${email}`, event.threadID, event.messageID);
      } catch {
        try {
          const email = await fetchEmail(secondaryApi, fallbackApiKey);
          api.sendMessage(`📩 Here's your generated temporary email: ${email}`, event.threadID, event.messageID);
        } catch {
          api.sendMessage("❌ Unable to generate email address. Please try again later...", event.threadID, event.messageID);
        }
      }
    } else if (args[0].toLowerCase() === "inbox" && args.length === 2) {
      const email = args[1];
      try {
        const inboxMessages = await fetchInbox(primaryApi, email, apiKey);
        const formattedMessages = inboxMessages.map(({ from, subject, body }) => `📧 Sender: ${from}\n📑 Subject: ${subject || 'Empty'}\n📩 Message: ${body}`).join('\n\n');
        if (formattedMessages) {
          api.sendMessage(`📬 Inbox Messages: 📬\n\n${formattedMessages}`, event.threadID, event.messageID);
        } else {
          api.sendMessage("❌ Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
        }
      } catch {
        try {
          const inboxMessages = await fetchInbox(secondaryApi, email, fallbackApiKey);
          const formattedMessages = inboxMessages.map((message) => `${message.date} - From: ${message.sender}\n${message.message}`).join("\n\n");
          if (formattedMessages) {
            api.sendMessage(`📬 Inbox Messages: 📬\n\n${formattedMessages}`, event.threadID, event.messageID);
          } else {
            api.sendMessage("❌ Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
          }
        } catch {
          api.sendMessage("❌ Can't get any mail yet. Please try again later.", event.threadID, event.messageID);
        }
      }
    } else {
      api.sendMessage("❌ Use 'tempmail create' to generate email and 'tempmail inbox {email}' to get the inbox emails.", event.threadID, event.messageID);
    }
  }
};