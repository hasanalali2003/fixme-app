const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone_number: { type: String, required: true },
    birthdate: { type: Date, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    role: {
        type: String,
        enum: ["client", "agent", "admin"],
        default: "client",
        required: true,
    },
    avatar_url: { type: String, required: false },
    fields: { type: [String], required: false },
    isOnline: { type: Boolean, required: false, default: false },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: false, default: new Date() },
});

module.exports = mongoose.model("User", userSchema);
