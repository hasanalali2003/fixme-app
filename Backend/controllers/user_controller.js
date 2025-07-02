const bcrypt = require("bcrypt");

const { User, Message } = require("../models/index");

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

const updateUser = async (req, res) => {
    try {
        //Get user id to update it
        const userId = req.userId;
        const {
            full_name,
            phone_number,
            birthdate,
            password,
            address,
            avatar_url,
            role,
            isOnline,
        } = req.body;

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: "User not found." });

        //Update user information
        if (full_name !== undefined && full_name !== "")
            user.full_name = full_name;
        if (phone_number !== undefined && phone_number !== "")
            user.phone_number = phone_number;
        if (birthdate !== undefined && birthdate !== "")
            user.birthdate = birthdate;
        if (password !== undefined && password !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        if (address !== undefined && address !== "") user.address = address;
        if (avatar_url !== undefined && avatar_url !== "")
            user.avatar_url = avatar_url;
        if (role !== undefined && role !== "") user.role = role;
        if (isOnline !== undefined && isOnline !== "") user.isOnline = isOnline;

        user.updated_at = new Date();

        await user.save();

        res.status(200).json(user);
    } catch (err) {
        //Send error
        console.error(err);
        res.status(500).json({ error: "An error happened!" });
    }
};

module.exports = {
    uploadFile,
    getUsers,
    updateUser,
    deleteUser,
    getCurrentUser,
};
