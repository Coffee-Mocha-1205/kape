const axios = require("axios");

module.exports = {
  config: {
    name: "tempmail",
    version: "1.0",
    author: "ARN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Retrieve emails and inbox messages",
      vi: "Retrieve emails and inbox messages",
    },
    longDescription: {
      en: "Retrieve emails and inbox messages",
      vi: "Retrieve emails and inbox messages",
    },
    category: "tool",
    guide: {
      en: "{pn} gen\n{pn} inbox (email)",
      vi: "{pn} gen\n{pn} inbox (email)",
    },
  },

  onStart: async function ({ api, args, event }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(this.config.guide.en, event.threadID, event.messageID);
      }

      const command = args[0].toLowerCase();

      if (command === "create") {
        try {
          const response = await axios.get("https://for-devs.onrender.com/api/mail/gen?apikey=api1");
          const email = response.data.email;
          return api.sendMessage(`📩 Generated email: ${email}`, event.threadID, event.messageID);
        } catch (error) {
          console.error("❌ | Error", error);
          return api.sendMessage("❌ | Failed to generate email. Please try again later.", event.threadID, event.messageID);
        }
      } else if (command === "inbox" && args.length === 2) {
        const email = args[1];
        if (!email) {
          return api.sendMessage("❌ | Provide an email address for the inbox.", event.threadID, event.messageID);
        }

        try {
          const inboxResponse = await axios.get(`https://for-devs.onrender.com/api/mail/inbox?email=${email}&apikey=api1`);
          const inboxMessages = inboxResponse.data;

          if (inboxMessages.length === 0) {
            return api.sendMessage("❌ | No messages found in the inbox.", event.threadID, event.messageID);
          }

          const formattedMessages = inboxMessages.map(({ date, sender, message }) => `📅 Date: ${date}\n📧 From: ${sender}\n📩 Message: ${message}`).join('\n\n');
          return api.sendMessage(`📬 Inbox messages for ${email}:\n\n${formattedMessages}\n\nOld messages will be deleted after some time.`, event.threadID, event.messageID);
        } catch (error) {
          console.error("❌ | Error", error);
          return api.sendMessage("❌ | Failed to retrieve inbox messages. Please try again later.", event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage(`❌ | Invalid command. Use '${this.config.guide.en}'.`, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};