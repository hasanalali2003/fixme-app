const { Request, Message, User } = require("../models/index");
const mongoose = require("mongoose");

// @route   GET /api/messages/conversations/:requestId
const getConversationsByRequestId = async (req, res) => {
    const { requestId } = req.params;

    try {
        // Fetch total message count (for this request)
        const totalMessages = await Message.countDocuments({
            request_id: requestId,
        });
        // Fetch paginated messages
        const messages = await Message.find({ request_id: requestId }).sort({
            created_at: -1,
        });

        // Group messages by sender-receiver pair
        const conversationsMap = new Map();

        for (const msg of messages) {
            const sender = msg.sender_id.toString() || "unknown";
            const receiver = msg.receiver_id.toString() || "unknown";

            const key1 = `${sender}_${receiver}`;
            const key2 = `${receiver}_${sender}`;
            const conversationKey = conversationsMap.has(key2) ? key2 : key1;

            if (!conversationsMap.has(conversationKey)) {
                conversationsMap.set(conversationKey, []);
            }

            conversationsMap.get(conversationKey).push(msg);
        }
        const conversations = Array.from(conversationsMap.values());

        return res.status(200).json({
            totalMessages,
            conversationsCount: conversations.length,
            conversations,
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// @route   GET /api/messages/conversation
const getConversationMessages = async (req, res) => {
    const { requestId, user1, user2, page = 1, limit = 20 } = req.query;

    if (!requestId || !user1 || !user2) {
        return res.status(400).json({ error: "Missing required query params" });
    }

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [uid1, uid2] = [user1, user2];

        const query = {
            request_id: requestId,
            $or: [
                { sender_id: uid1, receiver_id: uid2 },
                { sender_id: uid2, receiver_id: uid1 },
            ],
        };

        const totalMessages = await Message.countDocuments(query);

        const messages = await Message.find(query)
            .sort({ created_at: -1 }) // newest first
            .skip(skip)
            .limit(parseInt(limit))
            .populate("sender_id", "full_name _id")
            .populate("receiver_id", "full_name _id");

        res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            messages,
        });
    } catch (error) {
        console.error("Error fetching conversation messages:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getConversationsByRequestId,
    getConversationMessages,
};
