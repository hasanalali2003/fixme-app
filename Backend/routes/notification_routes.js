const express = require("express");
const {
    sendToUUIDs,
    sendToTopics,
} = require("../controllers/notifi_controller");
const notifi_users = express.Router();

notifi_users.post("/send-uuid", sendToUUIDs);
notifi_users.post("/send-topic", sendToTopics);

module.exports = notifi_users;
