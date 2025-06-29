const express = require("express");
const upload = require("../middleware/multerConfig");
const {
    getRequests,
    createRequest,
    replyToRequest,
    getMessages,
    uploadFile,
} = require("../controllers/user_controller");
const verifyToken = require("../middleware/authMiddleware");

const authenticated_users = express.Router();

// Create requests (API endpoint)
authenticated_users.post("/requests", verifyToken, createRequest);

// Upload file (API endpoint)
authenticated_users.post(
    "/upload",
    verifyToken,
    upload.single("file"),
    uploadFile
);

// Fetch requests (API endpoint)
authenticated_users.get("/requests", verifyToken, getRequests);

// Reply to requests (API endpoint)
authenticated_users.post("/requests/:id/reply", verifyToken, replyToRequest);

// Fetch all messages related to a specific request (API endpoint)
authenticated_users.get("/requests/:id/messages", verifyToken, getMessages);

module.exports.authenticated = authenticated_users;
