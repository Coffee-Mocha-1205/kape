const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tempmail",
    aliases: [`tm`],
    version: "1.0.0",
    author: "Upol | ArYAN",
    role: 0,
    countDown: 5,
    longDescription: {
      en: "Generate temporary email and check inbox"
    },
    category: "email",
    guide: {
      en: ".tempmail < subcommand >\n\nFor Example:\n.tempmail create\n.tempmail inbox <tempmail>"
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(this.config.guide.en, event.threadID, event.messageID);
      }

      if (args[0] === "create") {
        try {
          const response = await axios.get("https://himachalwale.onrender.com/api/tempmail/get?apikey=©himachalwale");
          const responseData = response.data.tempmail;
          api.sendMessage(`📩 Here's your generated temporary email: ${responseData}`, event.threadID, event.messageID);
        } catch (error) {
          console.error("❌ | Error", error);
          api.sendMessage("❌|Unable to generate email address. Please try again later...", event.threadID, event.messageID);
        }
      } else if (args[0].toLowerCase() === "inbox" && args.length === 2) {
        const email = args[1];
        try {
          const response = await axios.get(`https://himachalwale.onrender.com/api/tempmail/inbox?email=${email}&apikey=©himachalwale`);
          const data = response.data;
          const inboxMessages = data.map(({ from, subject, body }) => `📧 Sender: ${from}\n📑 Subject: ${subject || 'Empty'}\n📩 Message: ${body}`).join('\n\n');
          if (inboxMessages) {
            api.sendMessage(`📬 Inbox Messages: 📬\n\n${inboxMessages}`, event.threadID, event.messageID);
          } else {
            api.sendMessage("❌|Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
          }
        } catch (error) {
          console.error("🔴 Error", error);
          api.sendMessage("❌|Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
        }
      } else {
        api.sendMessage("❌ | Use 'Tempmail create' to generate email and 'Tempmail inbox {email}' to get the inbox emails.", event.threadID, event.messageID);
      }

    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred. Please try again later.`, event.threadID, event.messageID);
    }
  }
};