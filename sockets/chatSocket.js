const { OpenAI } = require("openai");
const getSystemPrompt = require("../utils/prompts");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function handleChatSocket(socket) {
    console.log("Client connected: ", socket.id);

    socket.on("message", async ({ message, subject }) => {
        try {
            if(!subject || !message) {
                throw new Error("Invalid request: required data not provided");
            }

            const systemPrompt = getSystemPrompt(subject);
            
            const stream = await client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
                stream: true
            });

            for await(const chunk of stream) {
                const token = chunk.choices?.[0]?.delta?.content;
                const reason = chunk.choices?.[0]?.finish_reason;
                
                if(token) {
                    socket.emit("token", { content: token, finishReason: reason });
                }
                if(reason) {
                    socket.emit("end", { finishReason: reason });
                }
            }
        }
        catch(error) {
            console.error("OpenAI API Error: ", error.message);
            socket.emit("error", { message: "Oh no! Apollo couldn’t answer right now. Please try again soon." });
        }
    });

    socket.on("disconnect", () => console.log("Client disconnected: ", socket.id));
}

module.exports = handleChatSocket;