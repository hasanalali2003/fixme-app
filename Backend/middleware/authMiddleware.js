const jwt = require("jsonwebtoken");
const { JWTSecret } = require("../config/index");

const verifyToken = (req, res, next) => {
    //Getting the token from the header
    const authHeader = req.header("Authorization");

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });
    try {
        const decoded = jwt.verify(token, JWTSecret);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = verifyToken;
