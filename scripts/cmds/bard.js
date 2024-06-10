const a = require("axios"),
      t = require("tinyurl");

global.api = {
  s: "https://apis-samir.onrender.com"
};

module.exports = {
  config: {
    name: "bard",
    aliases: ["bard"],
    version: "1.0",
    author: "Samir OE",
    countDown: 5,
    role: 0,
    category: "ai"
  },
  onStart: async function({
    message: m,
    event: e,
    args: r,
    commandName: n
  }) {
    try {
      let s;
      const i = e.senderID;
      if ("message_reply" === e.type && ["photo", "sticker"].includes(e.messageReply.attachments?.[0]?.type)) {
        s = await t.shorten(e.messageReply.attachments[0].url);
      } else {
        const o = r.join(" "),
              c = await a.get(`${global.api.s}/Gemini?text=${encodeURIComponent(o)}&uid=${i}`);
        if (c.data && c.data.candidates && c.data.candidates.length > 0) {
          const t = c.data.candidates[0].content.parts[0].text,
                e = `🗨 | 𝙶𝚘𝚘𝚐𝚕𝚎 𝙱𝚊𝚛𝚍 |━━━━━━━━━━━━━━━━\n${t}\n━━━━━━━━━━━━━━━━`;
          m.reply({
            body: e
          }, (r, o) => {
            global.GoatBot.onReply.set(o.messageID, {
              commandName: n,
              messageID: o.messageID,
              author: i
            })
          })
        }
      }
      if (!s) return void console.error("Error: Invalid message or attachment type");
      const d = `${global.api.s}/telegraph?url=${encodeURIComponent(s)}&senderId=${i}`,
            p = await a.get(d),
            u = p.data.result.link,
            o = r.join(" "),
            f = `${global.api.s}/gemini-pro?text=${encodeURIComponent(o)}&url=${encodeURIComponent(u)}`;
      m.reply({
        body: `🗨 | 𝙶𝚘𝚘𝚐𝚕𝚎 𝙱𝚊𝚛𝚍 |━━━━━━━━━━━━━━━━\n${(await a.get(f)).data}\n━━━━━━━━━━━━━━━━`
      })
    } catch (t) {
      console.error("Error:", t.message)
    }
  },
  onReply: async function({
    message: m,
    event: e,
    Reply: r,
    args: n
  }) {
    try {
      let {
        author: o,
        commandName: c
      } = r;
      if (e.senderID !== o) return;
      const i = n.join(" "),
            d = await a.get(`${global.api.s}/Gemini?text=${encodeURIComponent(i)}&uid=${e.senderID}`);
      if (d.data && d.data.candidates && d.data.candidates.length > 0) {
        const t = d.data.candidates[0].content.parts[0].text,
              r = `🗨 | 𝙶𝚘𝚘𝚐𝚕𝚎 𝙱𝚊𝚛𝚍 |━━━━━━━━━━━━━━━━\n${t}\n━━━━━━━━━━━━━━━━`;
        m.reply({
          body: r
        }, (t, n) => {
          global.GoatBot.onReply.set(n.messageID, {
            commandName: c,
            messageID: n.messageID,
            author: e.senderID
          })
        })
      }
    } catch (t) {
      console.error("Error:", t.message)
    }
  }
}