const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWTSecret, JWTExpiresIn } = require("../config/index");

const { User, DeviceToken } = require("../models/index");
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { full_name, email, password, phone_number, birthdate, address } =
            req.body;

        //Check if email already exists
        const isExists = await User.exists({ email });
        if (isExists) {
            return res
                .status(500)
                .json({ message: "User already registered." });
        }
        //Hashing the password before store it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create new user & save it
        const user = new User({
            full_name,
            email,
            password: hashedPassword,
            phone_number,
            birthdate,
            address,
        });
        await user.save();
        //Sign the authentication token
        const token = jwt.sign({ userId: user._id }, JWTSecret, {
            expiresIn: JWTExpiresIn,
        });
        //Send message if user register has done
        res.status(201).json({
            message: "User registerd successfully!",
            token,
        });
    } catch (err) {
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
            error: err._message,
        });
    }
};

// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        //Fetch user
        const user = await User.findOne({ email }).lean();

        //If user not found / email is incorrect!
        if (!user)
            return res.status(401).json({
                message: "No account found with this email address.",
                error: "Unknown Email!",
            });

        //Check if password equal to hashed password in database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch)
            return res.status(401).json({
                message: "Incorrect password. Please try again.",
                error: "Wrong password!",
            });

        //Sign the authentication token
        const token = jwt.sign({ userId: user._id }, JWTSecret, {
            expiresIn: JWTExpiresIn,
        });
        res.status(200).json({
            message: "Authentication successfully!",
            token,
        });
    } catch (err) {
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
            error: err._message,
        });
    }
};

// @route   POST /api/auth/register-token
const registerDeviceToken = async (req, res) => {
    try {
        const { userId, token } = req.body;
        // Check if body not empty
        if (!userId || !token) {
            return res
                .status(400)
                .json({ error: "userId and token are required" });
        }

        const user = await User.findById(userId);
        console.log(user);
        // Upsert logic: update if exists, otherwise create new
        const result = await DeviceToken.findOneAndUpdate(
            { userId }, // Find by userId
            { token, userTopics: user.topics || [] }, // Update token
            { new: true, upsert: true } // Create if not found
        );

        res.status(200).json({
            message: "Token registerd/updated successfully!",
            result,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
            error: err._message,
        });
    }
};

module.exports = {
    register,
    login,
    registerDeviceToken,
};
