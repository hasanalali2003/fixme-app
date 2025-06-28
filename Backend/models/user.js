const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone_number: { type: String, required: true },
    birthdate: { type: Date },
    password: { type: String, required: true },
    address: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "agent", "admin"],
        default: "user",
        required: true,
    },
    avatar_url: { type: String, required: false },
    isOnline: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, required: true, default: new Date() },
    updatedAt: { type: Date, required: false, default: new Date() },
});

module.exports = mongoose.model("User", userSchema);
