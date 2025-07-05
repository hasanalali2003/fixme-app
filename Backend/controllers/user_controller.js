const bcrypt = require("bcrypt");

const { User, DeviceToken } = require("../models/index");

// @route   POST /api/upload
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { filename, mimetype, size, path } = req.file;

        // Get folder name
        let folder = "others";
        if (mimetype.startsWith("image/")) folder = "images";
        else if (mimetype.startsWith("audio/")) folder = "voices";

        const result = {
            url: `/uploads/${folder}/${filename}`,
            filename,
            mimetype,
            size,
        };
        res.status(200).json(result);
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        // Fetch all users
        users = await User.find().lean();

        // Check if there is any users or not
        if (users.length === 0)
            return res.status(404).json({ message: "There is no users!" });

        //Send the count of users and every user
        res.status(201).json({ count: users.length, users });
    } catch (err) {
        //Handling any error
        res.status(500).json({
            message: "An error happened while fetching the users.",
            error: err._message,
        });
    }
};

// @route   GET /api/users/me
const getCurrentUser = async (req, res) => {
    try {
        // Fetch current user.
        const user = await User.findById(req.userId).lean();
        //Send the user profile.
        res.status(201).json(user);
    } catch (err) {
        //Handling any error
        res.status(500).json({
            message: "An error happened while fetching the user.",
            error: err._message,
        });
    }
};

// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params.id;
        // Check if user is exists
        const isExists = await User.exists({ id: userId });
        if (isExists) {
            // Delete the user from the database.
            await User.findOneAndDelete({ id: userId });
            return res
                .status(200)
                .json({ message: "User deleted successfully." });
        }
        res.status(404).json({ message: "User not found." });
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

// @route   POST /api/users/me
const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        const updatableFields = [
            "full_name",
            "phone_number",
            "birthdate",
            "address",
            "avatar_url",
            "role",
            "topics",
            "isOnline",
        ];

        // Update normal fields
        updatableFields.forEach((field) => {
            if (updates[field] !== undefined && updates[field] !== "") {
                user[field] = updates[field];
            }
        });

        // Handle password separately
        if (updates.password !== undefined && updates.password !== "") {
            const hashedPassword = await bcrypt.hash(updates.password, 10);
            user.password = hashedPassword;
        }

        user.updated_at = new Date();
        await user.save();

        await DeviceToken.findOneAndUpdate(
            { userId: String(userId) },
            { userTopics: user.topics }
        );
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error happened!", error: err });
    }
};

module.exports = {
    uploadFile,
    getUsers,
    updateUser,
    deleteUser,
    getCurrentUser,
};
