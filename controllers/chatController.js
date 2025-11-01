const ChatSession = require('../models/ChatSession');
let GoogleGenAI;
try {
    ({ GoogleGenAI } = require('@google/genai'));
} catch (e) {
    console.error("\nFATAL ERROR: Failed to load the '@google/genai' module.");
    console.error("Please ensure the backend dependencies are installed correctly by running 'npm install' in the '/backend' directory.");
    console.error("Original error:", e.message, "\n");
    process.exit(1);
}

const getAiClient = () => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set. Please configure it in your .env file.");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};


const systemInstruction = `You are Helios, an advanced AI assistant specializing in frontend development and UI/UX design. You adapt your responses based on context:

**Core Behaviors:**
1. **Context-Aware Responses:**
   - For greetings/casual chat: Respond naturally and briefly, no code unless requested
   - For technical questions: Provide detailed, helpful explanations
   - For code requests: Deliver complete, production-ready solutions

2. **Response Types:**
   - GREETING: Be friendly and concise, ask how you can help
   - TECHNICAL: Analyze the question and provide expert guidance
   - CODE REQUEST: Follow the code generation directives below
   - CONVERSATION: Maintain natural dialogue while staying technically focused

3. **Code Generation Directives:**
   - Analyze all inputs (text, images, code files) thoroughly
   - For images: Focus on design, layout, colors, and typography
   - For code: Understand and build upon the existing codebase
   - Default to React, TypeScript, and Tailwind CSS unless specified
   - Include Framer Motion for smooth animations
   - Structure explanations: Design → Code → Animations

4. **Writing Style:**
   - Use clear, well-formatted text with proper paragraphs
   - For code explanations: Use bullet points and sections
   - Maintain a professional yet friendly tone
   - Focus on clarity and readability

5. **Problem Solving:**
   - Break down complex problems into steps
   - Provide complete solutions when needed
   - Include error handling and best practices
   - Consider performance and user experience

Remember to be a helpful co-pilot, making the interaction natural and productive.`;

const generateTitle = async (firstMessage) => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a very short, concise title (4 words max) for the following user query. Respond with only the title and nothing else:\n\n"${firstMessage}"`
        });
        return response.text.trim();
    } catch (error) {
        console.error("Title generation failed:", error);
        return "Untitled Chat";
    }
}

exports.getChatSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ user: req.user.id }).select('-messages').sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getChatSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id });
        if (!session) {
            return res.status(404).json({ message: 'Session not found or you do not have permission to view it.' });
        }
        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createChatSession = async (req, res) => {
    try {
        const { model } = req.body;
        const newSession = new ChatSession({
            user: req.user.id,
            title: 'New Chat',
            model: model || 'gemini-2.5-flash',
            messages: []
        });
        const session = await newSession.save();
        res.status(201).json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteChatSession = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id });
        if (!session) {
            return res.status(404).json({ message: 'Session not found or you do not have permission to delete it.' });
        }
        await session.deleteOne();
        res.json({ message: 'Session deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.renameChatSession = async (req, res) => {
    try {
        const { title } = req.body;
        const session = await ChatSession.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title },
            { new: true }
        );
        if (!session) {
            return res.status(404).json({ message: 'Session not found or you do not have permission to rename it.' });
        }
        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.sendMessage = async (req, res) => {
    const { prompt } = req.body;
    const attachments = req.files || [];

    try {
        const ai = getAiClient();
        const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id });
        if (!session) {
            return res.status(404).json({ message: 'Session not found or you do not have permission to access it.' });
        }

        const userMessage = {
            role: 'user',
            content: prompt,
            attachments: attachments.map(f => ({ fileName: f.originalname, mimeType: f.mimetype }))
        };

        const historyContents = session.messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        const userParts = [{ text: prompt }];
        for (const file of attachments) {
            userParts.push({
                inlineData: {
                    mimeType: file.mimetype,
                    data: file.buffer.toString('base64'),
                },
            });
        }
        historyContents.push({ role: 'user', parts: userParts });

        const contents = [];
        for (const message of historyContents) {
            const previousMessage = contents[contents.length - 1];
            if (previousMessage && previousMessage.role === 'user' && message.role === 'user') {
                previousMessage.parts.push(...message.parts);
            } else {
                contents.push(message);
            }
        }
        
        const stream = await ai.models.generateContentStream({
            model: session.model,
            contents: contents,
            config: {
                systemInstruction,
            },
        });

        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Connection': 'keep-alive'
        });

        let fullModelResponse = '';
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullModelResponse += chunkText;
                res.write(chunkText);
            }
        }

        session.messages.push(userMessage);

        if (session.messages.length === 1 && prompt) {
            session.title = await generateTitle(prompt);
        }

        session.messages.push({ role: 'model', content: fullModelResponse });
        await session.save();

        res.end();

    } catch (err) {
        console.error('Error in sendMessage:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to get response from AI', error: err.message });
        } else {
            res.end();
        }
    }
};