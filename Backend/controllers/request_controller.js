const { Request, User } = require("../models/index");

// @route   GET /api/requests
const getRequests = async (req, res) => {
    try {
        const userRole = await User.findById(req.userId).select("role").lean();
        let requests;

        //Fetch requests for client/agent
        if (userRole.role === "client") {
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

// @route   GET /api/requests/:id
const getRequestByID = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).lean();
        if (!request)
            return res.status(404).json({ message: "Request not found." });
        //Send the request
        res.status(201).json(request);
    } catch (err) {
        //Handling any error
        res.status(500).json({
            message: "An error happened while fetching the requests.",
            error: err._message,
        });
    }
};

// @route   POST /api/requests/
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
        res.status(201).json({
            message: "Request created successfully",
            request,
        });
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened." });
    }
};

// @route   POST /api/requests/:id
const updateRequest = async (req, res) => {
    try {
        //Get request id to update it
        const requestId = req.params.id;
        const updates = req.body;

        const updatableFields = [
            "subject",
            "description",
            "category",
            "status",
            "assigned_to",
        ];

        const request = await Request.findById(requestId);

        if (!request)
            return res.status(404).json({ error: "Request not found." });

        //Update request information
        updatableFields.forEach((field) => {
            if (updates[field] !== undefined && updates[field] !== "") {
                request[field] = updates[field];
            }
        });

        request.updated_at = new Date();

        await request.save();

        res.status(200).json({
            message: "Request updated successfully",
            request,
        });
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

// @route   DELETE /api/requests/:id
const deleteRequest = async (req, res) => {
    try {
        const requestId = req.params.id;

        // Check if request is exists
        const isExists = await Request.exists({ _id: requestId });
        if (isExists) {
            // Delete the request from the database.
            await Request.findOneAndDelete({ _id: requestId });
            return res
                .status(200)
                .json({ message: "Request deleted successfully." });
        }
        res.status(404).json({ message: "Request not found." });
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};
// @route   POST /api/requests/:id/assign
const assignAgentToRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { agent_id } = req.body;

        if (!agent_id) {
            return res
                .status(400)
                .json({ error: "agent_id (agent ID) is required" });
        }

        // 1. Verify agent exists in users collection
        const agent = await User.findById(agent_id);
        if (!agent) {
            return res.status(404).json({ error: "Agent (user) not found" });
        }

        // (Optional) Check if user is actually an agent
        // if (agent.role !== "agent") {
        //   return res.status(403).json({ error: "User is not an agent" });
        // }

        // 2. Verify request exists
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        // 3. Assign agent
        request.assigned_to = agent_id;
        request.updated_at = new Date();
        await request.save();

        res.status(200).json({
            message: "Agent assigned successfully",
            request,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error happened!" });
    }
};

module.exports = {
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestByID,
    assignAgentToRequest,
};
