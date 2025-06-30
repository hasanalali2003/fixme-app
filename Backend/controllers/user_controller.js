const path = require("path");

const { Request, User, Message } = require("../models/index");

const getRequests = async (req, res) => {
    try {
        const userRole = await User.findById(req.userId).select("role").lean();
        let requests;

        //Fetch requests for user/agent
        if (userRole.role === "user") {
            requests = await Request.find({ created_by: req.userId }).sort({
                created_at: -1,
            });
        } else if (userRole.role === "agent") {
            // Fetch All requests that not assigned to anyone & assigned to agent
            requests = await Request.find({
                $or: [{ assigned_to: req.userId }, { assigned_to: null }],
            }).sort({ created_at: -1 });
        }

        //Check if there is any requests or not
        if (requests.length === 0)
            return res.status(404).json({ message: "There is no requests!" });

        //Send the count of requests and every request
        res.status(201).json({ count: requests.length, requests });
    } catch (err) {
        //Handling any error
        res.status(500).json({
            message: "An error happened while fetching the requests.",
            error: err._message,
        });
    }
};

const createRequest = async (req, res) => {
    try {
        const { subject, description, category } = req.body;
        const created_by = req.userId;

        //Create new request & save it
        const request = await new Request({
            subject,
            description,
            category,
            created_by,
        });
        await request.save();

        //Send message if request created successfully
        res.status(201).json(request);
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened." });
    }
};

const replyToRequest = async (req, res) => {
    try {
        //Get request id to reply to it
        const requestId = req.params.id;

        //check if the request is exists
        const requestExists = await Request.exists({ _id: requestId });
        if (!requestExists)
            return res.status(404).json({ error: "request not found!" });

        //Message details & Message save
        const { type, content, attachments } = req.body;
        const userId = req.userId;
        const sender_id = userId;

        const message = await new Message({
            requestId,
            sender_id,
            type,
            content,
            attachments,
        });
        await message.save();

        res.status(201).json(message);
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

const updateRequest = async (req, res) => {
    try {
        //Get request id to update it
        const requestId = req.params.id;
        const { subject, description, category, status, assigned_to } =
            req.body;

        const request = await Request.findById(requestId);

        if (!request)
            return res.status(404).json({ error: "Request not found." });

        //Update request information
        if (subject !== undefined && subject !== "") request.subject = subject;
        if (description !== undefined && description !== "")
            request.description = description;
        if (category !== undefined && category !== "")
            request.category = category;
        if (status !== undefined && status !== "") request.status = status;
        if (assigned_to !== undefined && assigned_to !== "")
            request.assigned_to = assigned_to;

        request.updated_at = new Date();

        await request.save();

        res.status(200).json(request);
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

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

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { filename, mimetype, size, path } = req.file;

        // Get folder name
        let folder = "others";
        if (mimetype.startsWith("image/")) folder = "images";
        else if (mimetype.startsWith("audio/")) folder = "voices";

        const result = {
            url: `/uploads/${folder}/${filename}`,
            filename,
            mimetype,
            size,
        };
        res.status(200).json(result);
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

module.exports = {
    getRequests,
    createRequest,
    replyToRequest,
    updateRequest,
    getMessages,
    uploadFile,
};
