const express = require("express");
const upload = require("../middleware/multerConfig");
const {
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getMessages,
    uploadFile,
    deleteUser,
    getCurrentUser,
    updateUser,
    getUsers,
    getOnlineAgents,
    getRequestByID,
    getPaginatedMessages,
    assignAgentToRequest,
} = require("../controllers/index.js");
const { verifyToken } = require("../middleware/authMiddleware");

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

// Fetch requests for current user (API endpoint)
authenticated_users.get("/requests/me", verifyToken, getRequests);

// Fetch request by id (API endpoint)
authenticated_users.get("/requests/:id", verifyToken, getRequestByID);

// Update request (API endpoint)
authenticated_users.post("/requests/:id", verifyToken, updateRequest);

// Delete request (API endpoint)
authenticated_users.delete("/requests/:id", verifyToken, deleteRequest);

// Assign request to agent (API endpoint)
authenticated_users.post(
    "/requests/:id/assign",
    verifyToken,
    assignAgentToRequest
);

// Fetch all messages related to a specific request (API endpoint)
authenticated_users.get("/messages/:id/", verifyToken, getMessages);

// Fetch messages with Pagination related to a specific request (API endpoint)
authenticated_users.get(
    "/messages/:id/paginated",
    verifyToken,
    getPaginatedMessages
);

// Fetch users (API endpoint)
authenticated_users.get("/users", verifyToken, getUsers);

// Fetch users/agent who is online and filterd by topic (API endpoint)
authenticated_users.get("/users/online", verifyToken, getOnlineAgents);

// Fetch current user (API endpoint)
authenticated_users.get("/users/me", verifyToken, getCurrentUser);

// Delete user (API endpoint)
authenticated_users.delete("/users/:id", verifyToken, deleteUser);

// Update user (API endpoint)
authenticated_users.post("/users/me", verifyToken, updateUser);

module.exports.authenticated = authenticated_users;
