const mongoose = require("mongoose");
const { Schema } = mongoose;

const deviceTokenSchema = new Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    userTopics: { type: [String], required: true, default: [] },
});

module.exports = mongoose.model("DeviceToken", deviceTokenSchema);
