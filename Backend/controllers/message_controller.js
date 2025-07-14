const { Request, Message } = require("../models/index");

// @route   POST /api/messages/:id
const getMessages = async (req, res) => {
    try {
        //Get request id to reply to it
        const request_id = req.params.id;

        //check if the request is exists
        const requestExists = await Request.exists({ _id: request_id });
        if (!requestExists)
            return res.status(404).json({ error: "request not found!" });

        //Get all messages for requests (Read-Only)
        const messages = await Message.find({ request_id }).lean();
        res.status(200).json({ count: messages.length, messages });
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

// @route   GET /api/messages/:id/paginated?page=1&limit=10
const getPaginatedMessages = async (req, res) => {
    try {
        const request_id = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if the request exists
        const requestExists = await Request.exists({ _id: request_id });
        if (!requestExists)
            return res.status(404).json({ error: "Request not found!" });

        // Count total messages
        const totalMessages = await Message.countDocuments(request_id);

        // Get paginated messages (newest first)
        const messages = await Message.find({ request_id })
            .sort({ createdAt: -1 }) // newest messages first
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            page,
            limit,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            count: messages.length,
            messages,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

module.exports = { getMessages, getPaginatedMessages };
