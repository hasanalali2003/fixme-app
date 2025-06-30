const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "others";
        // Set different folder based on file type
        if (file.mimetype.startsWith("image/")) folder = "images";
        else if (file.mimetype.startsWith("audio/")) folder = "voices";

        cb(null, path.join(__dirname, "..", "/uploads", folder));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Unique file name
    },
});
const upload = multer({ storage });

module.exports = upload;
