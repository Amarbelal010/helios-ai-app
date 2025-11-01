const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for individual messages
const MessageSchema = new Schema({
    role: {
        
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [
        {
            fileName: String,
            mimeType: String,
        }
    ]
}, {
    timestamps: true
});

// Schema for a full chat session
const ChatSessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat'
    },
    messages: [MessageSchema],
    model: {
        type: String,
        required: true,
        enum: ['gemini-2.5-flash', 'gemini-2.5-pro']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);