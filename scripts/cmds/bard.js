const axios = require('axios');

async function handleCommand(api, event, args, message) {
  try {
    const question = args.join(" ").trim();

    if (!question) {
      return message.reply("Please provide a question. Example: {p} cmdName {your question}");
    }

    const response = await getAnswerFromAI(question);

    if (response) {
      message.reply(response);
    } else {
      message.reply("Failed to get an answer. Please try again later.");
    }
  } catch (error) {
    console.error("Error in handleCommand:", error.message);
    message.reply("An error occurred while processing your request.");
  }
}

async function getAnswerFromAI(question) {
  try {
    const url = 'https://haze-ultra-advanced-d80346bab842.herokuapp.com/bard';
    const { data } = await axios.get(url, { params: { prompt: question } });

    if (data && (data.gpt4 || data.reply || data.response || data.answer || data.message)) {
      const answer = data.gpt4 || data.reply || data.response || data.answer || data.message;
      console.log("AI Response:", answer);
      return answer;
    } else {
      throw new Error("No valid response from AI");
    }
  } catch (error) {
    console.error("Error in getAnswerFromAI:", error.message);
    throw new Error("Failed to get AI response");
  }
}

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Network Error:", error.message);
    return null;
  }
}

async function getAIResponse(input, userId, messageID) {
  const query = input.trim() || "hi";
  const services = [
    { url: 'https://haze-ultra-advanced-d80346bab842.herokuapp.com/bard', params: { question: query } }
  ];

  try {
    for (const service of services) {
      const data = await fetchFromAI(service.url, service.params);

      if (data && (data.gpt4 || data.reply || data.response || data.answer || data.message)) {
        const response = data.gpt4 || data.reply || data.response || data.answer || data.message;
        return { response, messageID };
      }
    }

    throw new Error("No valid response from any AI service");
  } catch (error) {
    console.error("Error in getAIResponse:", error.message);
    throw error;
  }
}

module.exports = {
  config: {
    name: 'bard',
    author: 'coffee',
    role: 0,
    category: 'ai',
    shortDescription: 'AI to answer any question',
  },
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    try {
      const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
      api.sendMessage(`🗨 | 𝙶𝚘𝚘𝚐𝚕𝚎 𝙱𝚊𝚛𝚍 |\n━━━━━━━━━━━━━━━━\n${response}━━━━━━━━━━━━━━━━`, event.threadID, messageID);
    } catch (error) {
      console.error("Error in onStart:", error.message);
      api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
  },
  onChat: async function ({ event, message }) {
    const messageContent = event.body.trim().toLowerCase();
    if (messageContent.startsWith("bard")) {
      const input = messageContent.replace(/^ai\s*/, "").trim();
      try {
        const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
        message.reply(`🗨 | 𝙶𝚘𝚘𝚐𝚕𝚎 𝙱𝚊𝚛𝚍 |\n━━━━━━━━━━━━━━━━\n${response}━━━━━━━━━━━━━━━━`, messageID);
      } catch (error) {
        console.error("Error in onChat:", error.message);
        message.reply("An error occurred while processing your request.");
      }
    }
  },
  handleCommand // Export the handleCommand function for command-based interactions
};