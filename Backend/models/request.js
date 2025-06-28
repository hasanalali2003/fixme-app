const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
    subject: { type: String, required: true },
    description: { type: String, required: false },
    category: { type: String, required: true },
    status: {
        type: String,
        enum: ["open", "in_progress", "closed"],
        default: "open",
        required: true,
    },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assigned_to: { type: Schema.Types.ObjectId, ref: "User", required: false },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: false, default: new Date() },
});

module.exports = mongoose.model("Request", requestSchema);
