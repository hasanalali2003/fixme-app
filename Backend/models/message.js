const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
    request_id: {
        type: Schema.Types.ObjectId,
        ref: "Request",
        required: false,
    },
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, default: "Text" },
    content: { type: String, required: true },
    attachments: {
        url: { type: String }, // direct URL to uploaded file
        filename: { type: String }, // stored filename
        mimetype: { type: String }, // "image/png", "audio/mpeg", etc.
        size: { type: Number },
    },
    isSeen: { type: Boolean, required: false, default: false },
    created_at: { type: Date, required: true, default: new Date() },
});

module.exports = mongoose.model("Message", messageSchema);
