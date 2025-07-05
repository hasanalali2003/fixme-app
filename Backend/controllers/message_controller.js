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

module.exports = { getMessages };
