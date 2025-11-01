const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../../middleware/auth');
const {
    getChatSessions,
    createChatSession,
    deleteChatSession,
    renameChatSession,
    sendMessage,
    getChatSessionById,
} = require('../../controllers/chatController');

// Multer setup for handling file uploads in memory
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 } // 15 MB per file
});

// All routes in this file are protected and require a valid token
router.use(auth);

// @route   GET api/chat
// @desc    Get all chat sessions for the logged-in user
router.get('/', getChatSessions);

// @route   GET api/chat/:id
// @desc    Get a single session by ID
router.get('/:id', getChatSessionById);

// @route   POST api/chat
// @desc    Create a new chat session
router.post('/', createChatSession);

// @route   DELETE api/chat/:id
// @desc    Delete a chat session
router.delete('/:id', deleteChatSession);

// @route   PUT api/chat/:id
// @desc    Rename a chat session
router.put('/:id', renameChatSession);

// @route   POST api/chat/:id/messages
// @desc    Send a message to a session
router.post('/:id/messages', upload.array('attachments'), sendMessage);

module.exports = router;