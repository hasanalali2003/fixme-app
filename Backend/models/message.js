const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
    request_id: {
        type: Schema.Types.ObjectId,
        ref: "Request",
        required: false,
    },
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    type: { type: String, required: true },
    content: { type: String, required: true },
    attachments: { type: Object, required: false },
    isSeen: { type: Boolean, required: false, default: false },
    created_at: { type: Date, required: true, default: new Date() },
});

module.exports = mongoose.model("Message", messageSchema);
