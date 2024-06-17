const axios = require('axios');

async function handleCommand(api, event, args, message) {
    try {
        const question = args.join(" ").trim();

        if (!question) {
            return message.reply("Failed to get an answer. Please try again later.");
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
        const services = [
            { url: 'https://markdevs-last-api.onrender.com/gpt4', params: { prompt: question, uid: 'your-uid-here' } },
            { url: 'http://markdevs-last-api.onrender.com/api/v2/gpt4', params: { query: question } },
            { url: 'https://markdevs-last-api.onrender.com/api/v3/gpt4', params: { ask: question } },
            { url: 'https://openaikey-x20f.onrender.com/api', params: { prompt: question } },
            { url: 'https://gpt-four.vercel.app/gpt', params: { prompt: question, uid: question } },
            { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: question } }
        ];

        for (const service of services) {
            const data = await fetchFromAI(service.url, service.params);
            if (data) return data;
        }

        throw new Error("No valid response from any AI service");
    } catch (error) {
        console.error("Error in getAnswerFromAI:", error.message);
        throw new Error("Failed to get AI response");
    }
}

async function fetchFromAI(url, params) {
    try {
        const { data } = await axios.get(url, { params });
        if (data && (data.gpt4 || data.reply || data.response || data.answer || data.message)) {
            const response = data.gpt4 || data.reply || data.response || data.answer || data.message;
            console.log("AI Response:", response);
            return response;
        } else {
            throw new Error("No valid response from AI");
        }
    } catch (error) {
        console.error("Network Error:", error.message);
        return null;
    }
}

async function getAIResponse(input, userId, messageID) {
    const query = input.trim() || "hi";
    try {
        const response = await getAnswerFromAI(query);
        return { response, messageID };
    } catch (error) {
        console.error("Error in getAIResponse:", error.message);
        throw error;
    }
}

module.exports = {
    config: {
        name: 'ai',
        author: 'coffee',
        role: 0,
        category: 'ai',
        shortDescription: 'AI to answer any question',
    },
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        try {
            const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
            api.sendMessage(`🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`, event.threadID, messageID);
        } catch (error) {
            console.error("Error in onStart:", error.message);
            api.sendMessage("An error occurred while processing your request.", event.threadID);
        }
    },
    onChat: async function ({ event, message }) {
        const messageContent = event.body.trim().toLowerCase();
        if (messageContent.startsWith("ai")) {
            const input = messageContent.replace(/^gpt\s*/, "").trim();
            try {
                const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
                message.reply(`🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`, messageID);
            } catch (error) {
                console.error("Error in onChat:", error.message);
                message.reply("An error occurred while processing your request.");
            }
        }
    },
    handleCommand // Export the handleCommand function for command-based interactions
};